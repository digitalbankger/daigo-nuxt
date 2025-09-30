// import { Banner } from '~/types/content'

// export default defineEventHandler((): Banner[] => {
//   return [
//     {
//       id: 1,
//       image: `/images/mock/main.webp`,
//       imageMobile: '/images/mock/main-mobile.jpg',
//       mobileHeight: '405px',
//       tags: [
//         { label: 'Кишечник и иммунитет', color: '#FFF05D' },
//         { label: 'Кожа и волосы',        color: '#9AFF9F' },
//         { label: 'Зубы и десны',         color: '#FFBCD8' },
//         { label: 'Кости и мышцы',        color: '#89DEFF' },
//         { label: 'Нервная система и мозг', color: '#9AFF9F' }
//       ],
//       title: 'DAIGO — натуральные БАДы из Японии ',
//       titleSize: '5em',
//       descWidth: '550px',
//       html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма',
//       buttonText: 'Узнать больше о Дайго',
//       mobileButtonText: 'Больше о Дайго',
//       buttonLink: '/catalog'
//     },
//     {
//       id: 2,
//       image: '/images/mock/main.webp',
//       imageMobile: '/images/mock/main-mobile.jpg',
//       mobileHeight: '405px',
//       tags: [
//         { label: 'Кишечник и иммунитет', color: '#FFF05D' },
//         { label: 'Кожа и волосы',        color: '#9AFF9F' },
//         { label: 'Зубы и десны',         color: '#FFBCD8' },
//         { label: 'Кости и мышцы',        color: '#89DEFF' },
//         { label: 'Нервная система и мозг', color: '#9AFF9F' }
//       ],
//       title: 'DAIGO — натуральные БАДы из Японии ',
//       titleSize: '5em',
//       descWidth: '550px',
//       html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма',
//       buttonText: 'Узнать больше о Дайго',
//       mobileButtonText: 'Больше о Дайго',
//       buttonLink: '/catalog'
//     },
//   ]
// })



export default defineEventHandler(async (event) => {
  const base =
    useRuntimeConfig(event).public.daigoApiBase ||
    'https://api.daigo.ru'

  const url = `${base}/v1/shop/content/main-banners`

  // Нормализуем URLы картинок (бэк шлёт относительные пути)
  const filesBase =
    useRuntimeConfig(event).public.daigoFilesBase ||
    base

  const normalizeImg = (src: any): string => {
    if (!src) return ''
    const s = String(src)
    if (s.startsWith('http') || s.startsWith('data:')) return s
    const root = filesBase.replace(/\/$/, '')
    return root + (s.startsWith('/') ? s : `/${s}`)
  }

  // Приводим к вашему интерфейсу Banner из ~/types/content
  const toBanner = (b: any, idx: number) => {
    // теги могут прийти строками или объектами — унифицируем
    const tags = Array.isArray(b?.tags)
      ? b.tags.map((t: any) =>
          typeof t === 'string'
            ? { label: t, color: '#FFF05D' }
            : {
                label: t?.label ?? t?.title ?? '',
                color: t?.color ?? t?.hex ?? '#FFF05D'
              }
        )
      : []

    return {
      id: b?.id ?? b?.banner_id ?? idx,
      image: normalizeImg(
        b?.image ||
        b?.image_url ||
        b?.desktop_image ||
        b?.desktopImage
      ),
      imageMobile: normalizeImg(
        b?.image_mobile ||
        b?.mobile_image ||
        b?.mobileImage ||
        b?.imageMobile
      ),
      mobileHeight: b?.mobile_height || b?.mobileHeight || '405px',

      title: b?.title ?? '',
      titleSize: b?.title_size || b?.titleSize || '5em',
      descWidth: b?.desc_width || b?.descWidth || '550px',

      // HTML-описание (оставляем как есть — у вас компонент ждёт HTML-строку)
      html:
        b?.html ||
        b?.description_html ||
        b?.descriptionHtml ||
        '',

      buttonText: b?.button_text || b?.buttonText || 'Узнать больше',
      mobileButtonText:
        b?.mobile_button_text ||
        b?.mobileButtonText ||
        b?.buttonText ||
        'Узнать больше',
      buttonLink: b?.button_link || b?.buttonLink || b?.link || '/catalog',

      tags
    }
  }

  try {
    // Тянем боевые баннеры и маппим
    const raw: any = await $fetch(url, { timeout: 8000 })
    const list: any[] = Array.isArray(raw) ? raw : (raw?.banners ?? [])
    const banners = list.map(toBanner)

    return banners
  } catch (e: any) {
    // На ошибке вернём пустой список, чтобы главная не падала
    if (import.meta.dev) {
      console.error('[banner] upstream error', e?.response ?? e)
    }
    return []
  }
})
