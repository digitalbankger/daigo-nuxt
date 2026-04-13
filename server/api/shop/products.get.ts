import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  // =========================
  // product_ids ветка (сторис)
  // =========================
  if (q.product_ids) {
    const ids = (
      Array.isArray(q.product_ids)
        ? q.product_ids.flatMap(v => String(v).split(','))
        : String(q.product_ids).split(',')
    )
      .map(s => s.trim())
      .filter(Boolean)

    const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
    const filesBase =
      useRuntimeConfig(event).public.daigoFilesBase ||
      base ||
      ''

    const normalizeImg = (src: any): string => {
      if (!src) return '/images/placeholder-product.png'
      const s = String(src)
      if (s.startsWith('http') || s.startsWith('data:')) return s
      const b = filesBase.replace(/\/$/, '')
      return b + (s.startsWith('/') ? s : `/${s}`)
    }

    const url = `${base}/v1/shop/products?page=1&page_size=9999`
    const res: any = await $fetch(url).catch(() => ({ products: [] }))

    const items = (Array.isArray(res?.products) ? res.products : [])
      .map((p: any) => ({
        id: p.product_id ?? p.id,
        product_id: p.product_id ?? p.id,
        slug: p.slug,
        name: p.name_ru || p.name,
        subtitle: p.subtitle || '',
        image: normalizeImg(p.image),
        detailImages: Array.isArray(p.detail_images)
          ? p.detail_images.map((img: any) => normalizeImg(img)).filter(Boolean)
          : [],
        price: Number(p.price) || 0,
        originalPrice: Number(p.original_price) || 0,
        sort: p.sort_order === 0 ? 16 : p.sort_order,
        properties: p.properties || {},
      }))
      .filter((p: any) => ids.includes(String(p.product_id)))

    return { items, total: items.length }
  }

  // =========================
  // Нормализация изображений
  // =========================
  const filesBase =
    useRuntimeConfig(event).public.daigoFilesBase ||
    useRuntimeConfig(event).public.daigoApiBase ||
    ''

  const normalizeImg = (src: any): string => {
    if (!src) return '/images/placeholder-product.png'
    const s = String(src)
    if (s.startsWith('http') || s.startsWith('data:')) return s
    const base = filesBase.replace(/\/$/, '')
    return base + (s.startsWith('/') ? s : `/${s}`)
  }

  // =========================
  // Пагинация
  // =========================
  const page = Number(q.page ?? 1) || 1
  const pageSize = Number(q.page_size ?? q.limit ?? 15) || 15

  let effectivePageSize = pageSize
  if (q.podarochnye) {
    effectivePageSize = 9999
  }

  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('page_size', String(effectivePageSize))

  if (q.napravlennost) {
    const csv = Array.isArray(q.napravlennost)
      ? q.napravlennost.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
      : String(q.napravlennost)
    params.set('napravlennost', csv)
  }

  if (q.produkty) {
    const vals = Array.isArray(q.produkty)
      ? q.produkty.flatMap(v => String(v).split(',')).filter(Boolean)
      : String(q.produkty).split(',').filter(Boolean)
    params.set('name', vals.join(','))
  }

  for (const [k, vAny] of Object.entries(q)) {
    if (
      [
        'page',
        'page_size',
        'limit',
        'napravlennost',
        'produkty',
        'empty',
        'podarochnye',
      ].includes(k)
    )
      continue

    if (
      k === 'ysclid' ||
      k === 'yclid' ||
      k === 'gclid' ||
      k === 'fbclid' ||
      k.startsWith('utm_')
    )
      continue

    if (vAny == null || vAny === '') continue

    const csv = Array.isArray(vAny)
      ? vAny.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
      : String(vAny)

    if (csv) params.set(k, csv)
  }

  const qs = params.toString().replaceAll('%2C', ',')
  const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
  const url = `${base}/v1/shop/products?${qs}`

  if (import.meta.dev) console.log('[catalog] →', url)

  try {
    const res: any = await $fetch.raw(url, { timeout: 8000 })
    const raw: any = res._data

    const items = (Array.isArray(raw?.products) ? raw.products : [])
      .map((p: any) => {
        const price = Number(p.price) || 0
        const slug = String(p.slug || '')
        const baseProps = p.properties || {}

        let enrichedProps = { ...baseProps }

        const isExcluded =
          slug.startsWith('sertifikat') ||
          slug === 'tamotsu' ||
          slug === 'lux-daigo-metabiotik' ||
          slug.includes('mesyats') ||
          slug.includes('mesyatsev')

        if (price > 30000 && !isExcluded) {
          enrichedProps.podarochnye = ['nabory']
        }

        return {
          id: p.product_id ?? p.id,
          product_id: p.product_id ?? p.id,
          slug,
          name: p.name_ru || p.name,
          subtitle: p.subtitle || '',
          image: normalizeImg(p.image),
          detailImages: Array.isArray(p.detail_images)
            ? p.detail_images.map((img: any) => normalizeImg(img)).filter(Boolean)
            : [],
          price,
          originalPrice: Number(p.original_price) || 0,
          sort: p.sort_order === 0 ? 16 : p.sort_order,
          properties: enrichedProps,
        }
      })

    let filteredItems = items

    if (q.podarochnye) {
      const values = Array.isArray(q.podarochnye)
        ? q.podarochnye
        : String(q.podarochnye).split(',')

      filteredItems = items.filter((p) => {
        const prop = p.properties?.podarochnye || []
        return values.some((v) => prop.includes(v))
      })
    }

    const headerTotal = Number(res.headers.get?.('X-Total-Count') ?? NaN)
    const bodyTotal = Number(
      raw?.total ??
      raw?.count ??
      raw?.meta?.total ??
      raw?.pagination?.total ??
      raw?.pagination?.count ??
      NaN
    )

    const bodyTotalPages = Number(
      raw?.total_pages ??
      raw?.pages ??
      raw?.last_page ??
      raw?.meta?.total_pages ??
      raw?.meta?.last_page ??
      raw?.pagination?.total_pages ??
      raw?.pagination?.last_page ??
      NaN
    )

    let total = q.podarochnye
      ? filteredItems.length
      : Number.isFinite(bodyTotal)
        ? bodyTotal
        : Number.isFinite(headerTotal)
          ? headerTotal
          : Number.isFinite(bodyTotalPages)
            ? bodyTotalPages * effectivePageSize
            : NaN

    const shouldProbeTotal =
      !q.podarochnye &&
      page === 1 &&
      items.length > 0 &&
      (!Number.isFinite(total) || total <= items.length)

    if (shouldProbeTotal) {
      const seenIds = new Set(
        items.map((p: any) => String(p.product_id ?? p.id ?? p.slug ?? ''))
      )

      for (let probePage = 2; probePage <= 50; probePage++) {
        const probeParams = new URLSearchParams(params)
        probeParams.set('page', String(probePage))

        const probeQs = probeParams.toString().replaceAll('%2C', ',')
        const probeUrl = `${base}/v1/shop/products?${probeQs}`

        const probeRaw: any = await $fetch(probeUrl, { timeout: 8000 }).catch(() => null)
        const probeItems = Array.isArray(probeRaw?.products) ? probeRaw.products : []

        if (!probeItems.length) break

        let added = 0
        for (const p of probeItems) {
          const id = String(p?.product_id ?? p?.id ?? p?.slug ?? '')
          if (!id) continue
          if (!seenIds.has(id)) {
            seenIds.add(id)
            added++
          }
        }

        if (added === 0) break
      }

      total = seenIds.size
    }

    if (!Number.isFinite(total)) {
      total = items.length
    }

    return {
      items: filteredItems,
      total,
    }
  } catch (e: any) {
    throw createError({
      statusCode: e?.response?.status || 502,
      statusMessage: 'Catalog upstream error',
    })
  }
})




// import { defineEventHandler, getQuery, createError } from 'h3'

// export default defineEventHandler(async (event) => {
//   const q = getQuery(event)

//   // 0) ветка для product_ids=... (используется сторисом)
//   // если у бэка нет фильтра по id — тянем все и фильтруем на ноде (50 шт ок).
//   if (q.product_ids) {
//     const ids = (
//       Array.isArray(q.product_ids)
//         ? q.product_ids.flatMap(v => String(v).split(','))
//         : String(q.product_ids).split(',')
//     )
//       .map(s => s.trim())
//       .filter(Boolean)

//     const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
//     const url = `${base}/v1/shop/products?page=1&page_size=9999`
//     const res: any = await $fetch(url).catch(() => ({ products: [] }))

//     const items = (Array.isArray(res?.products) ? res.products : []).map((p: any) => ({
//       id:         p.product_id ?? p.id,
//       product_id: p.product_id ?? p.id,
//       slug:       p.slug,
//       name:       p.name_ru || p.name,
//       subtitle:   p.subtitle || '',
//       // важное изменение: делаем картинки абсолютными, если пришёл относительный путь
//       image:      p.image ? (p.image.startsWith('http') ? p.image : `${base}${p.image}`) : '',
//       price:      Number(p.price) || 0,
//       originalPrice: Number(p.original_price) || 0,
//       sort:       p.sort_order === 0 ? 16 : p.sort_order,
//       properties: p.properties || {},
//     })).filter((p: any) => ids.includes(String(p.product_id)))

//     return { items, total: items.length }
//   }

//   // --- вспомогалка для нормализации путей изображений ---
//   const filesBase =
//     useRuntimeConfig(event).public.daigoFilesBase
//     || useRuntimeConfig(event).public.daigoApiBase
//     || '' // например: 'https://api.daigo.ru'

//   const normalizeImg = (src: any): string => {
//     if (!src) return '/images/placeholder-product.png'
//     const s = String(src)
//     if (s.startsWith('http') || s.startsWith('data:')) return s
//     // склеиваем базовый хост и относительный путь (/uploads/...)
//     const base = filesBase.replace(/\/$/, '')
//     return base + (s.startsWith('/') ? s : `/${s}`)
//   }
//   // ------------------------------------------------------

//   // пагинация: бэку нужен page + page_size
//   const page = Number(q.page ?? 1) || 1
//   const pageSize = Number(q.page_size ?? q.limit ?? 9) || 9

//   // собираем параметры; не шлём служебные/пустые
//   const params = new URLSearchParams()
//   params.set('page', String(page))
//   params.set('page_size', String(pageSize))

//   // napravlennost -> как есть (у вас бэк его принимает)
//   if (q.napravlennost) {
//     const csv = Array.isArray(q.napravlennost)
//       ? q.napravlennost.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
//       : String(q.napravlennost)
//     params.set('napravlennost', csv)
//   }

//   // --- ТЕСТОВАЯ ПОДМЕНА SLUG'А (вкл/выкл одной строкой) ---
//   const TEST_REWRITE_SLUG = false // ← поставьте true для теста, затем верните false/удалите
//   const rewriteSlug = (s: string) =>
//     (TEST_REWRITE_SLUG && s === 'daigo-lux') ? 'metabiotik-daigo-lux' : s
//   // ---------------------------------------------------------

//   // produkty -> name (бэкенд фильтрует по name/slug/… — мы отправляем name)
//   if (q.produkty) {
//     const vals = Array.isArray(q.produkty)
//       ? q.produkty.flatMap(v => String(v).split(',')).filter(Boolean)
//       : String(q.produkty).split(',').filter(Boolean)

//     const rewritten = vals.map(rewriteSlug)
//     const csv = rewritten.join(',')
//     params.set('name', csv)
//   }

//   // прокинем остальные фильтры «как есть» (кроме служебных и трекинговых)
//   for (const [k, vAny] of Object.entries(q)) {
//     if (['page', 'page_size', 'limit', 'napravlennost', 'produkty', 'empty'].includes(k)) continue

//     // трекинговые / рекламные параметры игнорируем — они не являются фильтрами каталога
//     if (
//       k === 'ysclid' ||
//       k === 'yclid' ||
//       k === 'gclid' ||
//       k === 'fbclid' ||
//       k.startsWith('utm_')
//     ) continue

//     if (vAny == null || vAny === '') continue
//     const csv = Array.isArray(vAny)
//       ? vAny.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
//       : String(vAny)
//     if (csv) params.set(k, csv)
//   }

//   // некоторым бэкам нужна «сырая» запятая в CSV — уберём %2C
//   const qs = params.toString().replaceAll('%2C', ',')
//   const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
//   const url = `${base}/v1/shop/products?${qs}`

//   if (import.meta.dev) console.log('[catalog] →', url)

//   try {
//     // raw нужен, чтобы достать заголовки
//     const res: any = await $fetch.raw(url, { timeout: 8000 })
//     const raw: any = res._data

//     const items = (Array.isArray(raw?.products) ? raw.products : []).map((p: any) => ({
//       id:         p.product_id ?? p.id,
//       product_id: p.product_id ?? p.id,
//       slug:       p.slug,
//       name:       p.name_ru || p.name,
//       subtitle:   p.subtitle || '',
//       image:      normalizeImg(p.image), // ← делаем абсолютный URL
//       price:      Number(p.price) || 0,
//       originalPrice: Number(p.original_price) || 0,
//       sort:       p.sort_order === 0 ? 16 : p.sort_order,
//       properties: p.properties || {},
//     }))

//     // total — из тела или X-Total-Count; если нет — мягкий фолбэк
//     let total = Number(raw?.total ?? res.headers.get?.('X-Total-Count') ?? NaN)
//     if (!Number.isFinite(total)) {
//       total = (items.length < pageSize)
//         ? (page - 1) * pageSize + items.length
//         : (page + 1) * pageSize
//     }

//     if (import.meta.dev) console.log('[catalog] items=', items.length, 'total=', total)
//     return { items, total }
//   } catch (e: any) {
//     throw createError({
//       statusCode: e?.response?.status || 502,
//       statusMessage: 'Catalog upstream error',
//     })
//   }
// })





// import type { Product, ProductCard } from '~/types/product'

// export default defineEventHandler((event) => {
//   const query = getQuery(event)
//   const page = Number(query.page || 1)
//   const perPage = 9

//   const allProducts: ProductCard[] = [
//     {
//       product_id: 1,
//       slug: 'daigo-lux',
//       name: 'Daigo Lux',
//       subtitle: 'Для кишечника и иммунитета',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-lux.png',
//       price: 95700,
//       properties: {
//         'pomogaet-pri': 'allergiya',
//         'napravlennost': 'kishechnik-i-immunitet',
//         'klass-produkta': 'aminobiotiki',
//         'produkty': 'daigo-lux',
//         'dlya-kogo': 'dlya-detej-i-mam',
//         'sostav': 'peptproduct_id-khlorelly-iph-c',
//         'forma-vypuska': 'zhproduct_idkost',
//         'strana-proizvoditel': 'yaponiya'
//       }
//     },
//     {
//       product_id: 2,
//       slug: 'daigo-dent',
//       name: 'Daigo Dent',
//       subtitle: 'Для зубов и дёсен',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-dent.png',
//       price: 3200,
//       properties: {
//         'pomogaet-pri': 'karies',
//         'napravlennost': 'zuby-i-desna',
//         'klass-produkta': 'metobiotiki',
//         'produkty': 'daigo-dent',
//         'dlya-kogo': 'dlya-detej-i-mam',
//         'sostav': 'vitamin-b3',
//         'forma-vypuska': 'pasta',
//         'strana-proizvoditel': 'yaponiya'
//       }
//     },
//     {
//       product_id: 3,
//       slug: 'daigo-lux',
//       name: 'Daigo Brainy',
//       subtitle: 'Для мозга и памяти',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-brainy.png',
//       price: 8900,
//       properties: {
//         'pomogaet-pri': 'demenciya',
//         'napravlennost': 'mozg-i-nervnaya-sistema',
//         'klass-produkta': 'plazmalogeny',
//         'produkty': 'daigo-brainy',
//         'dlya-kogo': 'dlya-aktivnogo-dolgoletiya',
//         'sostav': 'vitamin-b14',
//         'forma-vypuska': 'kapsuly',
//         'strana-proizvoditel': 'italiya'
//       }
//     },
//     {
//       product_id: 4,
//       slug: 'daigo-lux',
//       name: 'Daigo Dermic',
//       subtitle: 'Для кожи',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-dermic.png',
//       price: 16200,
//       properties: {
//         'pomogaet-pri': 'akne',
//         'napravlennost': 'kozha-i-volosy',
//         'klass-produkta': 'aminobiotiki',
//         'produkty': 'daigo-dermic',
//         'dlya-kogo': 'dlya-detej-i-mam',
//         'sostav': 'vitamin-a',
//         'forma-vypuska': 'gel-kapsuly',
//         'strana-proizvoditel': 'yaponiya'
//       }
//     },
//     {
//       product_id: 5,
//       slug: 'daigo-lux',
//       name: 'Tamotsu',
//       subtitle: 'Для энергии и иммунитета',
//       image: 'http://localhost:3000/images/mock/catalog/tamotsu.png',
//       price: 67500,
//       properties: {
//         'pomogaet-pri': 'utomlyaemost',
//         'napravlennost': 'kishechnik-i-immunitet',
//         'klass-produkta': 'omega-3',
//         'produkty': 'tamotsu',
//         'dlya-kogo': 'dlya-aktivnogo-dolgoletiya',
//         'sostav': 'omega-9',
//         'forma-vypuska': 'kapsuly',
//         'strana-proizvoditel': 'italiya'
//       }
//     },
//     {
//       product_id: 6,
//       slug: 'daigo-lux',
//       name: 'Daigo Dent',
//       subtitle: 'Зубы и десна',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-dent.png',
//       price: 3200,
//       properties: { 'Помогает при': 'teeth', 'Состав': 'lacto' }
//     },
//     {
//       product_id: 7,
//       slug: 'daigo-lux',
//       name: 'Daigo Shampoo',
//       subtitle: 'Кожа и волосы',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-shampoo.png',
//       price: 16200,
//       properties: { 'Помогает при': 'skin', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 8,
//       slug: 'daigo-lux',
//       name: 'Omega-3',
//       subtitle: 'Жир печени трески',
//       image: 'http://localhost:3000/images/mock/catalog/omega-3.png',
//       price: 14000,
//       properties: { 'Помогает при': 'heart', 'Состав': 'omega3' }
//     },
//     {
//       product_id: 9,
//       slug: 'daigo-lux',
//       name: 'Lactis zoo',
//       subtitle: 'Для животных',
//       image: 'http://localhost:3000/images/mock/catalog/lactis-zoo.png',
//       price: 6200,
//       properties: { 'Помогает при': 'animals', 'Состав': 'lacto' }
//     },
//     {
//       product_id: 10,
//       slug: 'daigo-lux',
//       name: 'Daigo Emperor',
//       subtitle: 'Год здоровья в подарок',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-emperor.png',
//       price: 1097000,
//       properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 11,
//       slug: 'daigo-lux',
//       name: 'Daigo Lux 2 страница',
//       subtitle: 'Для кишечника и иммунитета',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-lux.png',
//       price: 95700,
//       properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 12,
//       slug: 'daigo-lux',
//       name: 'Daigo 5 ml 2 страница',
//       subtitle: 'Для кишечника и иммунитета',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-5ml.png',
//       price: 13100,
//       properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 13,
//       slug: 'daigo-lux',
//       name: 'Daigo 10 ml 2 страница',
//       subtitle: 'Для кишечника и иммунитета',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-10ml.png',
//       price: 24100,
//       properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 14,
//       slug: 'daigo-lux',
//       name: 'Tamotsu 2 страница',
//       subtitle: 'Для мозга и нервной системы',
//       image: 'http://localhost:3000/images/mock/catalog/tamotsu.png',
//       price: 67500,
//       properties: { 'Помогает при': 'brain', 'Состав': 'peptproduct_ides' }
//     },
//     {
//       product_id: 15,
//       slug: 'daigo-lux',
//       name: 'Daigo Dent 2 страница',
//       subtitle: 'Зубы и десна',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-dent.png',
//       price: 3200,
//       properties: { 'Помогает при': 'teeth', 'Состав': 'lacto' }
//     },
//     {
//       product_id: 16,
//       slug: 'daigo-lux',
//       name: 'Daigo Shampoo 2 страница',
//       subtitle: 'Кожа и волосы',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-shampoo.png',
//       price: 16200,
//       properties: { 'Помогает при': 'skin', 'Состав': 'ferment' }
//     },
//     {
//       product_id: 17,
//       slug: 'daigo-lux',
//       name: 'Omega-3 2 страница',
//       subtitle: 'Жир печени трески',
//       image: 'http://localhost:3000/images/mock/catalog/omega-3.png',
//       price: 14000,
//       properties: { 'Помогает при': 'heart', 'Состав': 'omega3' }
//     },
//     {
//       product_id: 18,
//       slug: 'daigo-lux',
//       name: 'Lactis zoo 2 страница',
//       subtitle: 'Для животных',
//       image: 'http://localhost:3000/images/mock/catalog/lactis-zoo.png',
//       price: 6200,
//       properties: { 'Помогает при': 'animals', 'Состав': 'lacto' }
//     },
//     {
//       product_id: 19,
//       slug: 'daigo-lux',
//       name: 'Daigo Emperor 2 страница',
//       subtitle: 'Год здоровья в подарок',
//       image: 'http://localhost:3000/images/mock/catalog/daigo-emperor.png',
//       price: 1097000,
//       properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
//     }
//   ]

//   if (query.product_ids) {
//     const product_ids = Array.isArray(query.product_ids)
//       ? query.product_ids.flatMap(i => i.toString().split(','))
//       : query.product_ids.toString().split(',')

//     const product_idNums = product_ids.map(Number)
//     return {
//       items: allProducts.filter(p => product_idNums.includes(p.product_id)),
//       total: product_idNums.length
//     }
//   }

//   const filtered = allProducts.filter(p =>
//     Object.entries(query).every(([key, value]) => {
//       if (key === 'page') return true
//       return p.properties[key] === value
//     })
//   )

//   const total = filtered.length
//   const paginated = filtered.slice((page - 1) * perPage, page * perPage)

//   return {
//     items: paginated,
//     total
//   }
// })
