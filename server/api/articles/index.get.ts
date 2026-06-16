import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listArticlesLite } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const page = Math.max(1, Number(q.page ?? 1))
  const perPage = 15 // синхронно со стором

  const search = String(q.q ?? '').trim().toLowerCase()

  const activeFilters = Object.entries(q).reduce<Record<string, string[]>>((acc, [key, raw]) => {
    if (key === 'page' || key === 'q') return acc
    const values =
      typeof raw === 'string'
        ? raw.split(',').map(v => v.trim()).filter(Boolean)
        : Array.isArray(raw)
          ? raw.flatMap(v => String(v).split(',')).map(v => v.trim()).filter(Boolean)
          : []
    if (values.length) acc[key] = values
    return acc
  }, {})

  const all = await listArticlesLite()

  const filtered = all.filter((a) => {
    // поиск
    if (search) {
      const hay = `${String(a.title ?? '')} ${String(a.preview ?? '')}`.toLowerCase()
      if (!hay.includes(search)) return false
    }

    // фильтры
    for (const [key, values] of Object.entries(activeFilters)) {
      const prop = (a as any)?.properties?.[key]
      if (prop == null) return false
      if (Array.isArray(prop)) {
        if (!prop.some(v => values.includes(String(v)))) return false
      } else {
        if (!values.includes(String(prop))) return false
      }
    }
    return true
  })

  const total = filtered.length
  const start = (page - 1) * perPage
  const items = filtered.slice(start, start + perPage)

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')
  return { items, total }
})


// // import { defineEventHandler, getQuery, setResponseHeader, createError, type H3Event } from 'h3'

// // export type ArticleListItem = {
// //   id: number
// //   slug: string
// //   title: string
// //   preview: string
// //   image: string
// //   date: string         // YYYY-MM-DD
// //   time: number         // минуты чтения
// //   views: number
// //   comments: number
// //   properties?: Record<string, any> | null
// // }

// // type Paged<T> = {
// //   items: T[]
// //   total: number
// //   page: number
// //   perPage: number
// // }

// // const mapItem = (it: any): ArticleListItem => {
// //   const d = it?.published_at ? new Date(it.published_at) : null
// //   return {
// //     id: Number(it?.id),
// //     slug: String(it?.slug ?? ''),
// //     title: String(it?.title ?? ''),
// //     preview: String(it?.meta_description ?? ''), // из API → в твоё preview
// //     image: String(
// //       it?.image_url ??
// //       it?.cover_url ??
// //       '/images/placeholders/article.webp'       // временный плейсхолдер
// //     ),
// //     date: d ? d.toISOString().slice(0, 10) : '',
// //     time: Number(it?.reading_time_minutes ?? 0),
// //     views: Number(it?.view_count ?? 0),
// //     comments: Number(it?.comments_count ?? 0),
// //     properties: it?.properties ?? null
// //   }
// // }

// // const handler = async (event: H3Event): Promise<Paged<ArticleListItem>> => {
// //   const config = useRuntimeConfig(event)
// //   const base = String(config.public.daigoApiBase || '')
// //   if (!base) {
// //     throw createError({ statusCode: 500, statusMessage: 'Missing runtimeConfig.public.daigoApiBase' })
// //   }

// //   const url = new URL('/v1/shop/content/articles/', base)

// //   // Пробрасываем query как есть
// //   const q = getQuery(event) as Record<string, string | string[] | number | null | undefined>
// //   for (const [k, v] of Object.entries(q)) {
// //     if (v == null) continue
// //     if (Array.isArray(v)) {
// //       for (const val of v) url.searchParams.append(k, String(val))
// //     } else {
// //       url.searchParams.set(k, String(v))
// //     }
// //   }

// //   setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')

// //   let raw: any
// //   try {
// //     raw = await $fetch(url.toString(), { headers: { accept: 'application/json' } })
// //   } catch (e: any) {
// //     console.error('[articles/index] Fetch error:', e?.statusCode, e?.statusMessage || e?.message)
// //     throw createError({ statusCode: e?.statusCode || 502, statusMessage: 'Failed to fetch articles' })
// //   }

// //   // Логи для отладки
// //   console.log('[articles/index] Request URL:', url.toString())
// //   console.dir(raw, { depth: null })

// //   // Учитываем формат { articles, total, page, page_size } + универсальные варианты
// //   const rawItems =
// //     raw?.items ??
// //     raw?.articles ??
// //     raw?.data ??
// //     (Array.isArray(raw) ? raw : raw?.results ?? [])

// //   const mapped = Array.isArray(rawItems) ? rawItems.map(mapItem) : []

// //   const total =
// //     Number(
// //       raw?.total ??
// //       raw?.count ??
// //       raw?.meta?.total ??
// //       mapped.length
// //     )

// //   const page = Number(q.page ?? raw?.page ?? raw?.meta?.current_page ?? 1)

// //   const perPage = Number(
// //     q.per_page ?? raw?.per_page ?? raw?.page_size ?? raw?.meta?.per_page ?? 10
// //   )

// //   return {
// //     items: mapped,
// //     total,
// //     page,
// //     perPage
// //   }
// // }

// // export default defineEventHandler(handler)


// import { defineEventHandler, getQuery } from 'h3'
// import type { ArticleListItem, Paged } from '~/types/articles'

// // моковые данные
// const ALL: ArticleListItem[] = [
//   {
//     id: 3,
//     slug: 'chto-takoe-metabiotiki',
//     title: 'Что такое Метабиотики',
//     preview: 'Метабиотики — будущее вашего здоровья: новая эпоха биотехнологий...',
//     image: '/images/articles/first.jpg',
//     date: '2025-08-05',
//     time: 8,
//     views: 13040,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 2,
//     slug: 'po-polochkam-printsip-deystviya-daigo',
//     title: '1. По полочкам: принцип действия Daigo',
//     preview: 'Причины нарушения баланса микрофлоры...',
//     image: '/media-s3/products/daigo-5/instructions.png',
//     date: '2024-06-30',
//     time: 8,
//     views: 91287,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 1,
//     slug: 'na-chto-vliyaet-mikroflora-kishechnika',
//     title: '2. На что влияет микрофлора кишечника?',
//     preview: 'Главные функции микрофлоры кишечника...',
//     image: '/media-s3/articles/yhyqpieqe92gcppbxm8cfhwnu87vv79f.jpg',
//     date: '2024-08-21',
//     time: 8,
//     views: 87234,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   }, 
//   {
//     id: 4,
//     slug: 'antibiotiki-i-mikroflora-kak-vosstanovit-kishechnik-posle-lecheniya',
//     title: 'Антибиотики и микрофлора: как восстановить кишечник после лечения?',
//     preview: 'Антибиотики — одно из величайших достижений медицины, спасшее миллионы жизней...',
//     image: '/media-s3/articles/fmgwngk0nmpabku69hwvbfxl3n7bwifz.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },

//   // Новые статьи без контента внутри(готовы)
//   {
//     id: 5,
//     slug: 'disbakterioz-kak-ponyat-chto-balans-bakteriy-narushen-i-chto-s-etim-delat',
//     title: 'Дисбактериоз: как понять, что баланс бактерий нарушен, и что с этим делать?',
//     preview: 'Микрофлора кишечника — это сложная экосистема, в которой сосуществуют триллионы бактерий, грибов и других микроорганизмов. Их баланс играет ключевую роль в пищеварении...',
//     image: '/media-s3/articles/2i7ox270udqou8r4jvp5u49nfgps644p.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 6,
//     slug: 'daigo-lux-evolyutsiya-metabiotika-s-vekovoy-istoriey',
//     title: 'Daigo Lux: эволюция метабиотика с вековой историей!',
//     preview: 'В последние годы всё больше внимания уделяется метабиотикам — инновационным средствам, способствующим поддержанию здорового микробиома и укреплению иммунитета...',
//     image: '/media-s3/articles/t35k43amzb9avugchueoo43uyvw04n9u.jpg',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 7,
//     slug: 'allergiya-i-astma-ekspertnoe-mnenie-o-prichinakh-zabolevaniy-i-sposobakh-borby-s-nimi',
//     title: 'Аллергия и астма: экспертное мнение о причинах заболеваний и способах борьбы с ними',
//     preview: 'Аллергические заболевания затрагивают миллионы людей во всем мире, существенно влияя на качество их жизни...',
//     image: '/media-s3/articles/n3th53jag532vuxtt1pcruvaewa9yem8.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 8,
//     slug: 'glyuten-i-laktoza-komu-deystvitelno-nuzhno-ikh-izbegat',
//     title: 'Глютен и лактоза: кому действительно нужно их избегать?',
//     preview: 'Глютен: что это и почему он стал проблемой для многих?...',
//     image: '/media-s3/articles/aoqi29vjazsdjfjsa8oc6icexlg5h3ym.jpg',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 9,
//     slug: 'daigo-kak-vino-fermentatsiya-prodolzhaetsya-v-upakovke',
//     title: 'Daigo как вино: ферментация продолжается в упаковке!',
//     preview: 'Польза ферментированных продуктов...',
//     image: '/media-s3/articles/3ulgpuh4xxg22okan0688kq296mntm0s.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 10,
//     slug: 'kak-daigo-pomogaet-pri-psoriaze-ot-kishechnika-k-kozhe',
//     title: 'Как Daigo помогает при псориазе: от кишечника к коже',
//     preview: 'Нарушения в работе иммунной системы...',
//     image: '/media-s3/articles/csv9jncyacqbm49flvz0vvd0s7t5v1a4.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 11,
//     slug: 'pochemu-vazhen-dlitelnyy-priem-daigo-rasskazyvaem-poetapno-kak-uluchshaetsya-zdorove',
//     title: 'Почему важен длительный прием Daigo: рассказываем поэтапно, как улучшается здоровье.',
//     preview: 'В современном мире, где фармацевтические препараты часто предлагают быстрое, но кратковременное решение проблем со здоровьем, все больше людей обращают внимание на натуральные добавки, которые работают на клеточном уровне...',
//     image: '/media-s3/articles/gi781102k9961wkctzpjsxkhk94atoa6.jpg',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 12,
//     slug: 'psoriaz-pravda-i-mify-o-lechenii',
//     title: 'Псориаз: правда и мифы о лечении',
//     preview: 'В этой статье, опираясь на экспертное мнение врача-дерматолога Юлии Галлямовой, мы детально разберем основные аспекты псориаза:...',
//     image: '/media-s3/articles/sqlhvxe5rhl5wn9g8hpgqi14c5rs0tb0.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 13,
//     slug: 'peptid-khlorelly-prirodnyy-istochnik-zdorovya-i-molodosti',
//     title: 'Пептид хлореллы: природный источник здоровья и молодости',
//     preview: 'Современная наука активно изучает натуральные компоненты, которые могут поддерживать здоровье и замедлять процессы старения...',
//     image: '/media-s3/articles/s2pwieg5lf32magymdozkpzr76599sr7.jpg',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 14,
//     slug: 'nuzhno-li-davat-probiotik-novorozhdennomu',
//     title: 'С первых дней и на всю жизнь: важность микрофлоры для здоровья детей',
//     preview: 'Поддержание здоровой микрофлоры кишечника — один из ключевых факторов, влияющих на здоровье ребенка с первых дней жизни и до зрелого возраста...',
//     image: '/media-s3/articles/37wu3heurw5qhtnzwjfka5uts35cc9c7.jpg',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 15,
//     slug: 'mozhno-li-pit-probiotiki-vmeste-s-antibiotikami',
//     title: 'Можно ли пить метабиотики вместе с антибиотиками?',
//     preview: 'Вокруг приема антибиотиков существует множество разных теорий и правил, который зачастую противоречат друг другу...',
//     image: '/media-s3/articles/vu8vdnu2xmaf0qlrvxrmucoodjh6xttm.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },
//   {
//     id: 16,
//     slug: 'dva-slona-pomoshchi-mozgu-tamotsu-ili-aminobiotik-daigo-brainy',
//     title: 'Два слона помощи мозгу: Tamotsu или аминобиотик Daigo Brainy?',
//     preview: 'Головной мозг — это главный центр управления нашим телом, эмоциями, мышлением и памятью. Он работает без перерывов и выходных, обрабатывая огромные объемы информации каждый день...',
//     image: '/media-s3/articles/kkel6mwduiuc0lf8k1qitr234suylbhp.png',
//     date: '2025-05-27',
//     time: 5,
//     views: 780,
//     comments: 0,
//     properties: { napravlennost: 'kishechnik-i-immunitet' }
//   },

//   // Parsing

//   {
//     id: 3,
//     slug: "sekrety-100-letnikh-kak-yapontsy-sokhranyayut-molodost-i-zdorove-do-glubokoy-starosti",
//     title: "Секреты 100-летних: как японцы сохраняют молодость и здоровье до глубокой старости",
//     preview: "В Японии долголетие – не редкость, а почти норма. Эта страна десятилетиями возглавляет мировые рейтинги по продолжительности жизни, а количество столетних жителей здесь превышае...",
//     image: "/media-s3/articles/3grcezfpk04ysd0oqsnmq9e70plh3jt1.jpg",
//     date: "2025-08-21",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 4,
//     slug: "nevidimye-pomoshchniki-nashego-zdorovya-zachem-nuzhna-mikrobiota-kishechnika-",
//     title: "Невидимые помощники нашего здоровья: зачем нужна микробиота кишечника?",
//     preview: "Представьте, что внутри вас живет целая вселенная — около 100 триллионов микроорганизмов, которые влияют на ваше здоровье, настроение и даже пищевые предпочтения. Это микробиота...",
//     image: "/media-s3/articles/08wwykmue5teiuvf86smebj1art2gnrj.png",
//     date: "2025-08-15",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },







  

//   {
//     id: 3,
//     slug: "sekrety-100-letnikh-kak-yapontsy-sokhranyayut-molodost-i-zdorove-do-glubokoy-starosti",
//     title: "Секреты 100-летних: как японцы сохраняют молодость и здоровье до глубокой старости",
//     preview: "В Японии долголетие – не редкость, а почти норма. Эта страна десятилетиями возглавляет мировые рейтинги по продолжительности жизни, а количество столетних жителей здесь превышае...",
//     image: "/media-s3/articles/3grcezfpk04ysd0oqsnmq9e70plh3jt1.jpg",
//     date: "2025-08-21",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 4,
//     slug: "nevidimye-pomoshchniki-nashego-zdorovya-zachem-nuzhna-mikrobiota-kishechnika-",
//     title: "Невидимые помощники нашего здоровья: зачем нужна микробиота кишечника?",
//     preview: "Представьте, что внутри вас живет целая вселенная — около 100 триллионов микроорганизмов, которые влияют на ваше здоровье, настроение и даже пищевые предпочтения. Это микробиота...",
//     image: "/media-s3/articles/08wwykmue5teiuvf86smebj1art2gnrj.png",
//     date: "2025-08-15",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 5,
//     slug: "daigo-lux-shampoo-yaponskiy-proryv-v-ukhode-za-volosami-cherez-mikrofloru-kozhi-golovy",
//     title: "Daigo Lux Shampoo: японский прорыв в уходе за волосами через микрофлору кожи головы",
//     preview: "Мы привыкли думать, что шампунь нужен только для одного — очищать волосы. Чем больше пены, чем сильнее аромат, чем эффектнее обещания на этикетке («объем», «блеск», «увлажнение»...",
//     image: "/media-s3/articles/kxjdmv4jo1741qbr6kioyaf8yttoy476.jpg",
//     date: "2025-08-08",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 6,
//     slug: "organicheskiy-daigo-kak-otkrytiya-nobelevskogo-laureata-sozdali-metabiotik-budushchego",
//     title: "Органический Daigo: как открытия Нобелевского лауреата создали метабиотик будущего?",
//     preview: "Еще в начале XX века великий русский ученый Илья Мечников, лауреат Нобелевской премии (1908 г.), сделал революционное открытие: «Старение и болезни начинаются с токсинов в кишеч...",
//     image: "/media-s3/articles/nl85cczmx19jprxba3mw7kupf1egu4bf.jpg",
//     date: "2025-08-08",
//     time: 9,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 2,
//     slug: "legkaya-voda-nauchnyy-proryv-ili-modnyy-trend-glavnoe-o-vode-bez-deyteriya-",
//     title: "Легкая вода: научный прорыв или модный тренд? Главное о воде без дейтерия.",
//     preview: "Вода — источник жизни. Эта фраза известна каждому, но современная наука готова добавить к ней уточнение: «и особенно та, что лишена тяжелых изотопов».",
//     image: "/media-s3/articles/vjeqrkuh9twbft1nen86021q5bdy46fn.png",
//     date: "2025-08-26",
//     time: 9,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 1,
//     slug: "ustali-ot-ustalosti-daigo-evolution-detoks-dlya-kishechnika-i-immuniteta",
//     title: "Устали от усталости? Daigo Evolution — детокс для кишечника и иммунитета",
//     preview: "Чувствуете, что организм просит передышки? Тело кажется тяжелым, кожа тусклой, а энергии едва хватает до обеда?",
//     image: "/media-s3/articles/tz2fhtmhsufzx4rplllrwifht0hmwumf.jpg",
//     date: "2025-09-19",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 7,
//     slug: "zubnaya-pasta-daigo-dent-novyy-standart-ukhoda-za-polostyu-rta-ot-mekhanicheskogo-ochishcheniya-k-bi",
//     title: "Зубная паста Daigo Dent: новый стандарт ухода за полостью рта - от механического очищения к биологическому балансу",
//     preview: "На протяжении десятилетий стоматология делала акцент на агрессивном очищении - считалось, что чем тщательнее мы удаляем бактерии, тем здоровее будут зубы и десны. Однако совреме...",
//     image: "/media-s3/articles/fi21c9ltb3cs2jmogvtf0ay38fc3lfvf.jpg",
//     date: "2025-08-07",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 10,
//     slug: "krasota-iznutri-kak-3-mesyachnyy-kurs-daigo-dermic-preobrazhaet-kozhu-na-kletochnom-urovne",
//     title: "Красота изнутри: как 3-месячный курс Daigo Dermic преображает кожу на клеточном уровне?",
//     preview: "Во все времена сияющая, здоровая кожа считалась эталоном красоты и благополучия. Но если раньше уход ограничивался поверхностными методами, то современная наука доказала: истинн...",
//     image: "/media-s3/articles/c28lkxhj8wi9pirt4htigshc4ojpf0bc.png",
//     date: "2025-06-27",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 11,
//     slug: "daigo-brainy-innovatsionnyy-podkhod-k-sokhraneniyu-yasnosti-uma-i-zdorovya-mozga",
//     title: "Daigo Brainy: инновационный подход к сохранению ясности ума и здоровья мозга",
//     preview: "В современном мире, где информационная нагрузка растет с каждым днем, когнитивное здоровье становится не просто важным - оно критически необходимо для качества жизни. Способност...",
//     image: "/media-s3/articles/zb9wzuz866wauxjj6j0dfat3rv3z441v.png",
//     date: "2025-06-26",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 8,
//     slug: "daigo-brainy-jointic-i-dermic-prirodnaya-sila-naturalnogo-peptida-khlorelly-dlya-zdorovya-mozga-sust",
//     title: "Daigo Brainy, Jointic и Dermic: природная сила натурального пептида хлореллы для здоровья мозга, суставов и кожи",
//     preview: "Современная наука стремится не просто устранять заболевания, а находить решения, предупреждающих их и способные поддерживать здоровье на глубинном, клеточном уровне. Ученые все ...",
//     image: "/media-s3/articles/b57w25t4bo1nzxzona8ctdd42umb2m3l.jpg",
//     date: "2025-07-15",
//     time: 11,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 9,
//     slug: "prirodnyy-algoritm-vosstanovleniya-pochemu-dobavki-dermic-brainy-i-jointic-trebuyut-kursovogo-priema",
//     title: "Природный алгоритм восстановления: почему добавки Dermic, Brainy и Jointic требуют курсового приема?",
//     preview: "В современном мире, где мгновенные решения стали нормой, мы привыкли ждать быстрых результатов от всего — от косметики до БАДов. Но настоящие изменения в организме происходят по...",
//     image: "/media-s3/articles/0z2zws8r5u4b0wi325tmil6sw9l8lu9z.png",
//     date: "2025-07-02",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 12,
//     slug: "ot-vospaleniya-k-svobode-dvizheniy-kak-rabotaet-trekhmesyachnyy-kurs-daigo-jointic",
//     title: "От воспаления к свободе движений: как работает трехмесячный курс Daigo Jointic",
//     preview: "Подвижность, легкость движений и свобода от боли – основа полноценной жизни в любом возрасте. Однако современный ритм, повышенные нагрузки и естественные возрастные изменения ча...",
//     image: "/media-s3/articles/t94nylzgjn12fxd29776gzb4ij35sedm.jpg",
//     date: "2025-06-25",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 14,
//     slug: "ne-kofe-edinym-mogut-li-dobavki-povysit-rabotosposobnost-sotrudnikov",
//     title: "Не кофе единым: могут ли добавки повысить работоспособность сотрудников?",
//     preview: "В современном мире высоких скоростей и жесткой конкуренции эффективность сотрудников — один из ключевых факторов успеха компании. Традиционные стимуляторы, такие как кофе, давно...",
//     image: "/media-s3/articles/p3wy31sxkn68athmqom2vgo5vrwhf8p8.jpg",
//     date: "2025-06-23",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 13,
//     slug: "fizicheskaya-aktivnost-i-dobavki-pochemu-zabota-o-sustavakh-neobkhodima-kazhdomu",
//     title: "Физическая активность и добавки: почему забота о суставах необходима каждому?",
//     preview: "Современный фитнес предлагает огромное разнообразие тренировочных направлений — от высокоинтенсивного функционального тренинга до модных танцевальных и восстановительных практик...",
//     image: "/media-s3/articles/lj2hq6flf1q3ok1jap3m3c93kuewl8cp.jpg",
//     date: "2025-06-24",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 15,
//     slug: "sovety-otdykhayushchim-kak-pobedit-akklimatizatsiyu-v-otpuske",
//     title: "Советы отдыхающим: как победить акклиматизацию в отпуске?",
//     preview: "Акклиматизация — естественная реакция организма на изменения окружающей среды, но она нередко сопровождается усталостью, головной болью, пищевыми расстройствами и другими неприя...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-20",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 16,
//     slug: "bez-nepriyatnostey-kak-sdelat-semeynoe-puteshestvie-komfortnym",
//     title: "Без неприятностей: как сделать семейное путешествие комфортным?",
//     preview: "Семейное путешествие — это возможность провести время вместе, открыть новые места и создать яркие воспоминания. Но что делать, если долгожданную поездку омрачают внезапные болезни?",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-19",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 17,
//     slug: "vzryvnaya-sila-i-vynoslivost-kak-povysit-anaerobnye-vozmozhnosti-organizma",
//     title: "Взрывная сила и выносливость: как повысить анаэробные возможности организма?",
//     preview: "В современном спорте и фитнесе ключевыми факторами успеха часто становятся не только общая физическая подготовка, но и специализированные качества, такие как взрывная сила и ана...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-17",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 18,
//     slug: "kak-uskorit-vosstanovlenie-posle-sportivnykh-travm",
//     title: "Как ускорить восстановление после спортивных травм?",
//     preview: "Спортивные травмы — неизбежная часть активного образа жизни. Повреждения мышц, связок или суставов не только вызывают боль и дискомфорт, но и надолго выбивают из тренировочного ...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-17",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 19,
//     slug: "kak-povysit-usvoenie-belka-pri-nabore-myshechnoy-massy",
//     title: "Как повысить усвоение белка при наборе мышечной массы?",
//     preview: "Для достижения максимальных результатов в наборе мышечной массы важно не только потреблять достаточное количество белка, но и обеспечивать его эффективное усвоение организмом. Д...",
//     image: "/media-s3/articles/1wxq1k5oj25im3lqwl53rdsx0nqa31f6.png",
//     date: "2025-06-11",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 21,
//     slug: "kak-pravilno-trenirovatsya-letom-na-otkrytom-vozdukhe-bez-vreda-dlya-zdorovya",
//     title: "Как правильно тренироваться летом на открытом воздухе без вреда для здоровья?",
//     preview: "Летние тренировки на свежем воздухе — отличный способ укрепить здоровье, повысить выносливость и зарядиться энергией. Однако жара, высокая влажность и нехватка кислорода могут п...",
//     image: "/media-s3/articles/1duzekubgb97utye6enyvntevo2g8mu1.jpg",
//     date: "2025-06-11",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 20,
//     slug: "sinergiya-sportpita-kak-sochetat-vse-elementy-dlya-maksimalnogo-effekta",
//     title: "Синергия спортпита: как сочетать все элементы для максимального эффекта?",
//     preview: "Для достижения высоких результатов организму требуются разные компоненты: энергия, белки, аминокислоты, витамины и микроэлементы. Именно поэтому спортивное питание стало неотъем...",
//     image: "/media-s3/articles/ax7cz4mqjeadgpuxt5h6m8cstvd2pqfm.jpg",
//     date: "2025-06-11",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 24,
//     slug: "zdorove-i-molodost-v-kazhdoy-molekule-sila-peptida-khlorelly-s-tochki-zreniya-nauki",
//     title: "Здоровье и молодость в каждой молекуле: сила пептида хлореллы с точки зрения науки",
//     preview: "Лето – время, когда хочется чувствовать себя легко, сияющей и безупречной во всем: от идеального тонуса кожи до энергии, которая бьет ключом. Но настоящая красота начинается изн...",
//     image: "/media-s3/articles/b9r6fu14mvq7mle4d7x1m8qkmv7sm3hx.jpg",
//     date: "2025-06-05",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 23,
//     slug: "dzhetlag-bolshe-ne-problema-kak-peptidy-i-plazmalogeny-pomogayut-bystroy-adaptatsii",
//     title: "Джетлаг больше не проблема: как пептиды и плазмалогены помогают быстрой адаптации?",
//     preview: "Частые перелеты, смена часовых поясов и жесткий график командировок — привычная реальность для бизнесменов, топ-менеджеров, спикеров и т.д. Но даже самый выносливый организм не ...",
//     image: "/media-s3/articles/9m5tun67z63gf7pgz1tq27tmijyny4hq.webp",
//     date: "2025-06-09",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 25,
//     slug: "gotovimsya-k-plyazhnomu-sezonu-kak-povysit-effektivnost-apparatnykh-protsedur",
//     title: "Готовимся к пляжному сезону: как повысить эффективность аппаратных процедур?",
//     preview: "Лето наступило, и каждая из нас мечтает встретить пляжный сезон с уверенностью — чтобы кожа сияла, тело было подтянутым, а отражение в зеркале радовало. Аппаратные процедуры — о...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-04",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 22,
//     slug: "innovatsionnye-formuly-dlya-yasnogo-uma-v-puteshestviyakh-i-komandirovkakh-kak-sozdayutsya-unikalnye",
//     title: "Инновационные формулы для ясного ума в путешествиях и командировках: как создаются уникальные добавки?",
//     preview: "Современный ритм жизни требует от нас постоянной концентрации, быстрой адаптации и ясности ума — особенно в путешествиях и командировках, когда стресс, смена часовых поясов и не...",
//     image: "/media-s3/articles/9m5tun67z63gf7pgz1tq27tmijyny4hq.webp",
//     date: "2025-06-10",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 26,
//     slug: "krasota-iznutri-kak-podgotovit-kozhu-k-plyazhnomu-sezonu-za-paru-nedel",
//     title: "Красота изнутри: как подготовить кожу к пляжному сезону за пару недель?",
//     preview: "Лето — это время, когда хочется жить ярко: чувствовать бархатный песок под ногами, вдыхать соленый бриз и ловить момент, глядя на закат. А отпуск у теплого моря — та самая долго...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2025-06-03",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 28,
//     slug: "metabiotiki-dlya-sportsmenov-uluchshenie-pishchevareniya-i-uskorenie-vosstanovleniya",
//     title: "Метабиотики для спортсменов: улучшение пищеварения и ускорение восстановления",
//     preview: "Спортивные победы и поражения часто объясняют тактикой, физической подготовкой или силой воли. Но что, если истинная причина кроется гораздо глубже — в кишечнике?",
//     image: "/media-s3/articles/epd0w352k93hedgsr2eszvui290b4w4k.jpg",
//     date: "2025-06-02",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 27,
//     slug: "metabiotiki-protiv-otekov-kak-umnye-metabolity-bakteriy-vyvodyat-lishnyuyu-zhidkost",
//     title: "Метабиотики против отеков: как умные метаболиты бактерий выводят лишнюю жидкость?",
//     preview: "Ты просыпаешься утром, подходишь к зеркалу — и вместо свежего сияющего лица видишь одутловатость, мешки под глазами или нечеткий овал. Знакомая ситуация?",
//     image: "/media-s3/articles/fd33imwiu2ewhmuykjsw915z7l0aw3h2.png",
//     date: "2025-06-03",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 29,
//     slug: "bakterialnyy-otpechatok-pochemu-u-kazhdogo-unikalnaya-mikroflora",
//     title: "Бактериальный отпечаток: почему у каждого уникальная микрофлора?",
//     preview: "Человеческий организм — это сложная экосистема, в которой гармонично сосуществуют триллионы микроорганизмов. Совокупность этих бактерий, вирусов, грибов и других микробов, насел...",
//     image: "/media-s3/articles/5vbakn28x5sg98p2okwajk3t2t8983x2.png",
//     date: "2025-06-02",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 30,
//     slug: "sindrom-sovy-i-kishechnik-svyaz-mezhdu-tsirkadnymi-ritmami-bakteriyami-i-bessonnitsey",
//     title: "Синдром «совы» и кишечник: связь между циркадными ритмами, бактериями и бессонницей",
//     preview: "Современный ритм жизни часто заставляет нас жертвовать сном ради работы, развлечений или других дел. Однако для людей с синдромом «совы» — хронотипом, характеризующимся поздним ...",
//     image: "/media-s3/articles/ji0nj1vh4021qd56oes9q91eiqi7a1o2.png",
//     date: "2025-05-28",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 32,
//     slug: "antibiotiki-i-mikroflora-kak-vosstanovit-kishechnik-posle-lecheniya",
//     title: "Антибиотики и микрофлора: как восстановить кишечник после лечения?",
//     preview: "Антибиотики — одно из величайших достижений медицины, спасшее миллионы жизней. Однако их применение часто имеет побочный эффект: наряду с патогенными бактериями страдает и полез...",
//     image: "/media-s3/articles/fmgwngk0nmpabku69hwvbfxl3n7bwifz.png",
//     date: "2025-05-27",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 33,
//     slug: "disbakterioz-kak-ponyat-chto-balans-bakteriy-narushen-i-chto-s-etim-delat",
//     title: "Дисбактериоз: как понять, что баланс бактерий нарушен, и что с этим делать?",
//     preview: "Микрофлора кишечника — это сложная экосистема, в которой сосуществуют триллионы бактерий, грибов и других микроорганизмов. Их баланс играет ключевую роль в пищеварении, иммуните...",
//     image: "/media-s3/articles/2i7ox270udqou8r4jvp5u49nfgps644p.png",
//     date: "2025-05-26",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 31,
//     slug: "absolyuty-dostizhimy-shedevry-v-mire-badov-sushchestvuyut-",
//     title: "Абсолюты достижимы: шедевры в мире БАДов существуют",
//     preview: "Представьте себе картину великого художника или архитектурный ансамбль, от которого захватывает дух. Настоящий шедевр не просто радует глаз — он меняет наше представление о возм...",
//     image: "/media-s3/articles/keiiwy6vtqucas8x7qlmwuakiuoaj3on.png",
//     date: "2025-05-28",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 34,
//     slug: "mikroflora-i-uspekh-v-biznese-kak-zdorove-kishechnika-vliyaet-na-produktivnost",
//     title: "Микрофлора и успех в бизнесе: как здоровье кишечника влияет на продуктивность?",
//     preview: "В мире высоких скоростей и бесконечных дедлайнов успех во многом зависит не только от стратегий и связей, но и от состояния кишечника. Микрофлора, (триллионы бактерий, живущих в...",
//     image: "/media-s3/articles/hbdz1s0lwr0r42834wbx5l3banjw1r5g.png",
//     date: "2025-05-22",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 35,
//     slug: "khlorella-vs-spirulina-chto-vybrat",
//     title: "Хлорелла vs Спирулина: что выбрать?",
//     preview: "Хлорелла и спирулина — одни из самых популярных суперфудов последних лет. Обе — микроводоросли с богатым составом, высоко ценятся за свои питательные и оздоравливающие свойства.",
//     image: "/media-s3/articles/edw1b8dnl60o3k11ta0bj5raflbpuehr.png",
//     date: "2025-05-21",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 36,
//     slug: "daigo-lux-evolyutsiya-metabiotika-s-vekovoy-istoriey",
//     title: "Daigo Lux: эволюция метабиотика с вековой историей!",
//     preview: "В последние годы всё больше внимания уделяется метабиотикам — инновационным средствам, способствующим поддержанию здорового микробиома и укреплению иммунитета. Среди них особое ...",
//     image: "/media-s3/articles/t35k43amzb9avugchueoo43uyvw04n9u.jpg",
//     date: "2025-05-21",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 37,
//     slug: "intuitivnoe-pitanie-kak-nauchitsya-slushat-svoye-telo",
//     title: "Интуитивное питание: как научиться слушать своё тело?",
//     preview: "Представьте мир, где не нужно считать калории, делить еду на «хорошую» и «плохую» и корить себя за лишний кусок пиццы. Где вместо жёстких правил — доверие к себе, а вместо чувст...",
//     image: "/media-s3/articles/6qdi69047ozfotoacy53hzl8c2q3m9eu.png",
//     date: "2025-05-20",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 38,
//     slug: "pochemu-khlorella-glavnyy-trend-2025-goda",
//     title: "Почему хлорелла — главный тренд 2025 года",
//     preview: "С древних времён водоросли служили человечеству ценным ресурсом. Прибрежные народы по всему миру издавна собирали морские водоросли для пропитания, лечения и даже для удобрения ...",
//     image: "/media-s3/articles/urr8esbz5grvvk6q202dso5yuu329yjr.jpg",
//     date: "2025-05-19",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 42,
//     slug: "probiotiki-dlya-intimnoy-mikroflory",
//     title: "Пробиотики для интимной микрофлоры",
//     preview: "Микрофлора — это собирательное название микроорганизмов, находящихся в симбиозе с человеком. Бывает микробиота кожи, кишечника, влагалища, жёлчных путей и др.",
//     image: "/media-s3/articles/atxi6jrb7na388l6bh4xg89omtmxuu6s.webp",
//     date: "2024-07-31",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 39,
//     slug: "9-prichin-nachat-prinimat-khlorellu-uzhe-segodnya-polza-kotoruyu-nevozmozhno-ignorirovat",
//     title: "9 причин начать принимать хлореллу уже сегодня: польза, которую невозможно игнорировать",
//     preview: "Иногда самые мощные природные решения выглядят скромно. Хлорелла — микроскопическая зелёная водоросль, но в её клетках скрывается потенциал, способный изменить самочувствие, вне...",
//     image: "/media-s3/articles/2uh3lwzdwqwsu0oqoruqn07s30xt262a.png",
//     date: "2025-05-16",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 41,
//     slug: "kogda-luchshe-vsego-prinimat-probiotiki",
//     title: "Когда лучше всего принимать пробиотики",
//     preview: "Правильное время приема добавок играет ключевую роль в их эффективности и безопасности. Аргумент о том, что биологически активные добавки - это не лекарства, а значит можно не с...",
//     image: "/media-s3/articles/0pw92ilti1k6el503wu0j3lspzwxy4mr.webp",
//     date: "2024-07-31",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 43,
//     slug: "mozhno-li-prinimat-probiotiki-pri-grudnom-vskarmlivanii",
//     title: "Можно ли принимать пробиотики при грудном вскармливании?",
//     preview: "Грудное вскармливание (ГВ) - чрезвычайно важный процесс, который затрагивает не только питание маленького человека, но и закладывает фундамент его здоровья. Грудное молоко играе...",
//     image: "/media-s3/articles/7fvb205qn5qocccllnq8jwc4gjdi6vrb.webp",
//     date: "2024-07-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 40,
//     slug: "peptidy-novogo-pokoleniya-pochemu-produkty-ot-daigo-eto-budushchee-zdorovya",
//     title: "Пептиды нового поколения: почему продукты от Daigo — это будущее здоровья",
//     preview: "Мир меняется с невероятной скоростью. Чтобы оставаться здоровыми и сохранять высокий уровень жизненной энергии, важно не просто следовать за инновациями, а выбирать лучшие из них.",
//     image: "/media-s3/articles/zzxbqw3zph87560h7ju31xmc9lgrmcev.png",
//     date: "2025-05-14",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 45,
//     slug: "kak-probiotiki-pomogayut-pecheni-vosstanovitsya-posle-bolezni",
//     title: "Как пробиотики помогают печени восстановиться после болезни",
//     preview: "Печень - очень трудолюбивый орган. Она участвует во всех обменных процессах, синтезирует и разрушает избытки углеводов, жиров, гормонов, может накапливать полезные компоненты, ч...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2024-07-03",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 46,
//     slug: "pochemu-nuzhno-prinimat-probiotiki-pri-gastrite",
//     title: "Почему нужно принимать метабиотики при гастрите",
//     preview: "Сколько людей в вашем окружении имеют диагноз \"гастрит\"? Такое знакомое и \"популярное\" сегодня заболевание на глобальном уровне поражает более 50% населения.",
//     image: "/media-s3/articles/zpmwkd9vko2fyyxmn4o74j1uvpwupiwm.webp",
//     date: "2024-07-03",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 44,
//     slug: "kak-probiotiki-vliyayut-na-kishechnik-posle-khimioterapii",
//     title: "Как метабиотики влияют на кишечник после химиотерапии?",
//     preview: "Онкология требует яростного лечения, которое оставляет неизгладимый след на всем организме. Сбой в своей работе дают многие органы и системы, которые зачастую никак не связаны с...",
//     image: "/media-s3/articles/qpbl9228ttqd0oav44j31tl5ndrg145q.webp",
//     date: "2024-07-03",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 48,
//     slug: "pomogayut-li-probiotiki-pri-lechenii-pryshchey",
//     title: "Помогают ли пробиотики при лечении прыщей",
//     preview: "Чистая сияющая кожа не только дарит уверенность в себе. Прежде всего, это показатель здоровья, но, к сожалению, чаще человек может «похвастаться» проблемной кожей.",
//     image: "/media-s3/articles/382i4q24vv5ze1weet3kqo7oa326tpwb.webp",
//     date: "2024-07-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 47,
//     slug: "probiotiki-dlya-pokhudeniya",
//     title: "Пробиотики или метабиотики для похудения?",
//     preview: "Изобилие пищи и малоподвижный образ жизни становятся причиной избыточного веса и ожирения, которые приобретают сегодня масштаб эпидемии. Многие хотят похудеть, но сталкиваются с...",
//     image: "/media-s3/articles/bz3vlz0tgvs83gbltbj2hmiujszn0kjb.webp",
//     date: "2024-07-03",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 49,
//     slug: "probiotiki-pri-sindrome-razdrazhennogo-kishechnika",
//     title: "Метабиотики при синдроме раздраженного кишечника",
//     preview: "По данным Всемирной Организации Здравоохранения (ВОЗ), от него страдают как минимум 15–20% населения планеты. Но из-за неявных проявлений 2/3 больных вообще не обращаются к врач...",
//     image: "/media-s3/articles/wlh0ldj2vl0f04yeknnqir3zuy31qp08.webp",
//     date: "2024-07-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 51,
//     slug: "razvivaytes-vmeste-s-nami-prisoedinyaytes-k-soobshchestvu-partnerov-daigo-i-obmenivaytes-opytom-i-zn",
//     title: "Развивайтесь вместе с нами: присоединяйтесь к сообществу партнеров Daigo и обменивайтесь опытом и знаниями.",
//     preview: "В современном мире успех всё чаще зависит не от индивидуальных усилий, а от способности организаций учиться и работать вместе, создавая ценные связи и синергии. Обмен знаниями и...",
//     image: "/media-s3/articles/klnsqjirxpq8da45m78v9pi15l542i7e.png",
//     date: "2021-11-21",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 50,
//     slug: "probiotiki-pri-allergii-u-vzroslykh-i-detey",
//     title: "Пробиотики при аллергии у взрослых и детей",
//     preview: "Почему некоторые считают, что пробиотики при аллергии у взрослых и детей - это панацея? Из-за тесной связи кишечника и иммунитета.",
//     image: "/media-s3/articles/qnr9pbgzerv6zfun5bxcmn02d20ptknf.webp",
//     date: "2024-07-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 52,
//     slug: "razvivayte-svoy-biznes-vmeste-s-nami-uznayte-o-vygodnykh-usloviyakh-partnyerskoy-programmy-daigo-",
//     title: "Развивайте свой бизнес вместе с нами: узнайте о выгодных  условиях партнёрской  программы «Daigo».",
//     preview: "В современном деловом мире, где конкуренция растет с каждым днем, успешное расширение бизнеса требует не только внутренних ресурсов, но и стратегических союзов. В условиях глоба...",
//     image: "/media-s3/articles/484dvg113jgav07u5b1jid8to26fw3g6.png",
//     date: "2021-11-21",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 53,
//     slug: "rasshirte-svoyu-klientskuyu-bazu-ispolzuyte-nashu-partnerskuyu-programmu-dlya-privlecheniya-novykh-k",
//     title: "Расширьте свою клиентскую базу: используйте нашу партнерскую программу для привлечения новых клиентов и увеличения прибыли.",
//     preview: "Существует множество стратегий для расширения клиентской базы, каждая из которых помогает бизнесу привлекать новых клиентов и укреплять свои позиции на рынке. Мы считаем, что гр...",
//     image: "/media-s3/articles/469xb095b3eucfh2q4lqa3npai8ofk4c.png",
//     date: "2021-08-22",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 55,
//     slug: "uluchshite-svoy-biznes-ispolzuyte-partnerskuyu-programmu-daigo-dlya-optimizatsii-protsessov-i-uvelich",
//     title: "Улучшите свой бизнес: используйте партнерскую программу Daigo для оптимизации процессов и увеличения прибыли.",
//     preview: "Оптимизация процессов в бизнесе играет ключевую роль в достижении эффективности, устойчивости и конкурентоспособности. В современном динамичном мире компании сталкиваются с раст...",
//     image: "/media-s3/articles/rln61kqzkxvb2uhrwymn8f18i1tgbkxb.png",
//     date: "2021-08-14",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 54,
//     slug: "obgonite-konkurentov-stante-partnerom-daigo-i-poluchite-preimushchestvo-na-rynke",
//     title: "Обгоните конкурентов: станьте партнером Daigo и получите преимущество на рынке.",
//     preview: "В современном мире бизнеса конкуренция становится все более жесткой, и для того, чтобы оставаться на плаву, компании должны постоянно искать способы быть на шаг впереди. Быть лу...",
//     image: "/media-s3/articles/9b1zr8wykljrb0pwipkndk24d1bwkl9q.png",
//     date: "2021-08-15",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 56,
//     slug: "stante-liderami-rynka-prisoedinyaytes-k-partnerskoy-programme-daigo-i-poluchite-dostup-k-eksklyuzivn",
//     title: "Станьте лидерами рынка: присоединяйтесь к партнерской программе Daigo и получите доступ к эксклюзивным инструментам и ресурсам.",
//     preview: "Партнерство является мощным инструментом, который может помочь компании не только укрепить свои позиции на рынке, но и стать лидером в своей отрасли. Объединяя силы с другими, к...",
//     image: "/media-s3/articles/zm67w7a1thcj4netzi0p0f6szk3afugj.png",
//     date: "2021-08-13",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 57,
//     slug: "khlorella-v-sovremennoy-meditsine-i-farmatsevtike-ot-poroshka-do-peptidov",
//     title: "Хлорелла в современной медицине и фармацевтике: от порошка до пептидов",
//     preview: "С каждым годом водоросль хлорелла всё чаще оказывается в центре внимания специалистов — от гастроэнтерологов и нутрициологов до дерматологов, терапевтов и врачей, работающих в с...",
//     image: "/media-s3/articles/gm41clrsq8qbfqvd447gq7s3ux6jgejp.png",
//     date: "2025-05-14",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 59,
//     slug: "serdechno-sosudistye-zabolevaniya-pochemu-stoit-zadumatsya-o-profilaktike-i-kakuyu-rol-igraet-peptid",
//     title: "Сердечно-сосудистые заболевания: почему стоит задуматься о профилактике и какую роль играет пептид хлореллы",
//     preview: "Сердечно-сосудистая система — основа нашего здоровья и качества жизни. К сожалению, её заболевания остаются одними из самых распространённых во всём мире.",
//     image: "/media-s3/articles/80p3o7bedvrsclorndmqjzccktrcfsjr.png",
//     date: "2025-05-13",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 60,
//     slug: "kak-peptid-khlorelly-pomogaet-pri-onkologii-nauchnyy-podkhod-bez-predrassudkov",
//     title: "Как пептид хлореллы помогает при онкологии: научный подход без предрассудков",
//     preview: "Онкологические заболевания затрагивают миллионы людей по всему миру, независимо от возраста, пола и социального статуса. Чтобы поддержать тех, кто столкнулся с этой сложной ситу...",
//     image: "/media-s3/articles/8oz7jvynlfxt67sf7klahd7tuhjaqa5b.png",
//     date: "2025-05-12",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 61,
//     slug: "pochemu-s-vozrastom-pishchevarenie-ukhudshaetsya-rol-mikrobioma-v-starenii",
//     title: "Почему с возрастом пищеварение ухудшается: роль микробиома в старении",
//     preview: "С возрастом наш организм претерпевает множество изменений , и пищеварительная система — не исключение. Метеоризм , запоры , тяжесть после еды и другие неприятные симптомы часто ...",
//     image: "/media-s3/articles/vxlva00b14edmb13pei6kr9f418ybioz.png",
//     date: "2025-05-07",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 58,
//     slug: "kishechnye-parazity-skrytaya-ugroza-ili-chast-ekosistemy",
//     title: "Кишечные паразиты: скрытая угроза или часть экосистемы?",
//     preview: "Кишечные паразиты — незримые спутники человечества на протяжении тысячелетий. Одни считают их опасными захватчиками, нарушающими здоровье, другие — частью сложной экосистемы, ко...",
//     image: "/media-s3/articles/puqcxwjij1a7m9z5fnh9eogiz38fl13n.png",
//     date: "2025-05-14",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 63,
//     slug: "kak-zhvachka-vliyaet-na-mikrofloru-polosti-rta",
//     title: "Как жвачка влияет на микрофлору полости рта?",
//     preview: "Жевательная резинка давно вошла в повседневную жизнь миллионов людей — её используют для освежения дыхания, очистки зубов после еды или просто в качестве привычки. Однако её воз...",
//     image: "/media-s3/articles/xdv38p6a9dcm5qtv87a4v0np3kfsxwpq.png",
//     date: "2025-05-05",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 64,
//     slug: "po-polochkam-printsip-deystviya-daigo",
//     title: "1. По полочкам: принцип действия Daigo",
//     preview: "Причины нарушен ия бала нса микрофлоры Микрофлора кишечника, также известная как микробиота кишечника, — это сложная экосистема микроорганизмов, которые обитают в желудочно-кише...",
//     image: "/media-s3/articles/webpl55x9sjwkrzth57e4q2wkni9prxa.jpg",
//     date: "2025-04-30",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 62,
//     slug: "sindrom-puteshestvennika-kak-perelety-i-smena-klimata-vliyayut-na-mikrobiom",
//     title: "Синдром путешественника: как перелеты и смена климата влияют на микробиом?",
//     preview: "Путешествия — это не только новые впечатления, но и серьезное испытание для организма. Многие сталкиваются с так называемым «синдромом путешественника» — расстройством пищеварен...",
//     image: "/media-s3/articles/txbupyumbik47ch9xitfy5bxazg2usc3.jpg",
//     date: "2025-05-06",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 65,
//     slug: "k-zdorovyu-sustavov-cherez-balans-v-kishechnike-kak-rabotaet-os-kishechnik-sustavy",
//     title: "К здоровью суставов через баланс в кишечнике: как работает ось «кишечник-суставы»",
//     preview: "Связь иммунитета и заболеваний суставов Мы привыкли думать, что боль в суставах – это результат возрастных изменений, травм или физических перегрузок. Но что, если ключ к здоров...",
//     image: "/media-s3/articles/al9c7476ffznxraoc91swa47e1vk6h4m.png",
//     date: "2025-04-29",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 68,
//     slug: "kak-nekhvatka-omega-3-vliyaet-na-razvitie-rebyenka",
//     title: "Как нехватка Омега-3 влияет на развитие ребёнка?",
//     preview: "Как Омега-3 жирные кислоты влияют на физическое и умственное развитие ребенка? В современном мире, где фастфуд и полуфабрикаты часто вытесняют полезные продукты, родители всё ча...",
//     image: "/media-s3/articles/ln1lavrc1oa0plfezi4gfbt32g7vtm6y.png",
//     date: "2025-03-14",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 69,
//     slug: "kishechnik-i-son-pochemu-balans-mikroflory-pomogaet-zasypat-bystree",
//     title: "Кишечник и сон: почему баланс микрофлоры помогает засыпать быстрее",
//     preview: "Почему баланс микрофлоры помогает засыпать быстрее Вы уверены, что причина Вашей бессонницы — стресс или нехватка магния? Мы привыкли думать, что кишечник отвечает лишь за перев...",
//     image: "/media-s3/articles/afj3kjt1qw3uz1u775o1bqca0wxgwqsb.png",
//     date: "2025-03-14",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 66,
//     slug: "ot-bakteriy-k-vospaleniyam-kak-rabotaet-os-kishechnik-kozha-",
//     title: "От бактерий к воспалениям: как работает ось «кишечник-кожа»?",
//     preview: "Связь кожи и кишечника Кожа — это зеркало, отражающее всё, что происходит внутри организма. Покраснения, акне, экзема или преждевременные морщины могут быть не просто косметичес...",
//     image: "/media-s3/articles/fb47bx7wljvigv2ory323l30lon2s17q.jpg",
//     date: "2025-04-28",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 67,
//     slug: "peptid-khlorelly-naturalnoe-sredstvo-dlya-borby-s-vospaleniem-v-sustavakh",
//     title: "Пептид хлореллы: натуральное средство для борьбы с воспалением в суставах",
//     preview: "Воспаление суставов: как облегчить себе жизнь? Суставы — это сложные механизмы, которые работают без устали, позволяя бегать, прыгать, танцевать, обнимать близких и даже просто ...",
//     image: "/media-s3/articles/bj6d5oq1vssbjywkucepgjsbic9j2v61.png",
//     date: "2025-03-14",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 70,
//     slug: "sboy-v-sisteme-chto-skryvaetsya-za-diagnozom-vegeto-sosudistaya-distoniya-",
//     title: "Сбой в системе: что скрывается за диагнозом вегето-сосудистая дистония?",
//     preview: "Что скрывается за диагнозом вегето-сосудистая дистония? Вегето-сосудистая дистония — это как невидимый дирижёр, который внезапно забыл ноты: сердце бешено стучит, голова кружитс...",
//     image: "/media-s3/articles/octqbfm0uk4ffjx05u7i9hcej70l7ahk.png",
//     date: "2025-03-14",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 73,
//     slug: "chto-vazhno-znat-o-mikrobiote-mochevyvodyashchikh-putey",
//     title: "Что важно знать о микробиоте мочевыводящих путей?",
//     preview: "От стерильности к разнообразию: что важно знать о микробиоте мочевыводящих путей? Мы привыкли слышать о микробиоте кишечника, но в микроорганизмы обитают на всем нашем теле и сл...",
//     image: "/media-s3/articles/j1xzmovwj50u0691mqtfxy3955godmov.png",
//     date: "2025-03-10",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 71,
//     slug: "eozinofilnyy-enterit-u-detey-rol-kishechnoy-mikroflory-v-upravlenii-zabolevaniem",
//     title: "Эозинофильный энтерит у детей: роль кишечной микрофлоры в управлении заболеванием",
//     preview: "Что делать с э озинофильным энтеритом у детей? Бывает, что ребенок постоянно жалуется на боли в животе, отказывается от еды, теряет вес, а врачи разводят руками, не находя очеви...",
//     image: "/media-s3/articles/124cnx11vk22r6s20uwmz2jqanpv2orv.png",
//     date: "2025-03-14",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 72,
//     slug: "kak-vybrat-bezopasnyy-peptid-vazhnye-fakty-i-riski-kotorye-dolzhen-znat-kazhdyy",
//     title: "Как выбрать безопасный пептид: важные факты и риски, которые должен знать каждый",
//     preview: "Виды пептидов: факты и риски Пептиды — это органические соединения, которые состоят из двух и более остатков аминокислот . Они участвуют в обмене веществ, гормональной регуляции...",
//     image: "/media-s3/articles/2o8x3yqy1wbq01hbh1nujx9ftzq7x6e2.png",
//     date: "2025-03-10",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 75,
//     slug: "kak-podderzhivat-uroven-testosterona-i-energiyu-muzhskoe-zdorove-bez-riskov-",
//     title: "Как поддерживать уровень тестостерона и энергию – мужское здоровье без рисков",
//     preview: "Ключевые факторы, влияющие на мужское здоровье и способы их коррекции Мужское здоровье включает в себя большое количество показателей: уровень энергии и тестостерона, функционир...",
//     image: "/media-s3/articles/biyhl5jtfz8e0s9mk8xkrcbptce9k568.jpeg",
//     date: "2025-03-10",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 74,
//     slug: "kak-mikroflora-svyazana-s-boleznyami-pecheni",
//     title: "Как микрофлора связана с болезнями печени?",
//     preview: "Дисбиоз как фактор риска: как микрофлора связана с болезнями печени? Печень — один из самых важных и многозадачных органов человеческого тела.",
//     image: "/media-s3/articles/73kxsxbsp94es55jp1fca347tve4m06c.png",
//     date: "2025-03-10",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 77,
//     slug: "kogda-otkryli-probiotik",
//     title: "Когда открыли пробиотик",
//     preview: "О пользе бактерий для здоровья человека знали, конечно, не всегда. Более того, только в последнее время в сознании людей укрепилась идея того, что не все бактерии - это зло, хот...",
//     image: "/media-s3/articles/x7u72ks7c6o2uq3xemcx9x0pmo0m2xpi.jpg",
//     date: "2024-09-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 76,
//     slug: "gubitelnyy-dzhetlag-kak-spravitsya-s-posledstviyami-smeny-chasovykh-poyasov",
//     title: "Губительный джетлаг: как справиться с последствиями смены часовых поясов?",
//     preview: "Как справиться с последствиями смены часовых поясов с помощью пептида хлореллы и аминокислот? Путешествия и поездки делают жизнь ярче, однако есть у них один неприятный спутник,...",
//     image: "/media-s3/articles/gtk9yrbf3atr2bu5lm6b2cjhoijp598q.png",
//     date: "2025-03-07",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 79,
//     slug: "probiotiki-pri-povyshennom-kholesterine",
//     title: "Как снизить холестерин?",
//     preview: "Принято считать, что холестерин имеет прямую связь с сосудами и сердцем. Действительно, это так, однако на сегодняшний день доказала связь между холестерином и кишечником, котор...",
//     image: "/media-s3/articles/8zr36onwnvoka5l5il2y3tq7w809vh1y.jpg",
//     date: "2024-09-03",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 78,
//     slug: "mozhno-li-prinimat-probiotiki-pri-tsistite",
//     title: "Метабиотики или пробиотики: что выбрать при цистите?",
//     preview: "Микрофлора или микробиота — это собирательное название микроорганизмов, находящихся в симбиозе с человеком. Бывает микробиота кожи, кишечника, влагалища, желчных путей и др.",
//     image: "/media-s3/articles/it9wxv190uxf1awp7zsql70hbz1wd7e1.jpg",
//     date: "2024-09-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 80,
//     slug: "rasstroystvo-stula-pri-prorezyvanii-zubov",
//     title: "Расстройство стула при прорезывании зубов",
//     preview: "Один из самых важных этапов в ранней стадии формирования малыша - это этап прорезывания зубов. Немногочисленные родители из числа счастливчиков говорят, что этот этап прошел нез...",
//     image: "/media-s3/articles/qlqz20qd3cfgcsm2intxs2ms0cep18nm.jpg",
//     date: "2024-09-03",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 81,
//     slug: "kak-uluchshit-peristaltiku-kishechnika",
//     title: "Как улучшить перистальтику кишечника?",
//     preview: "Желудочно-кишечный тракт выполняет много функций, при этом каждый процесс в отдельности очень прост. Например, перистальтика является ключевым механизмом работы кишечника, необх...",
//     image: "/media-s3/articles/nko7ke9ec59w6f9o1kdvjcn18hui1hum.jpg",
//     date: "2024-09-02",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 82,
//     slug: "probiotiki-pri-laktaznoy-nedostatochnosti",
//     title: "Что делать при лактазной недостаточности?",
//     preview: "В организме предусмотрено множество процессов, которые призваны обеспечивать его идеальную работу. Несмотря на свои мощные компенсаторные возможности, нарушение даже одного мале...",
//     image: "/media-s3/articles/0kio86fkf4wgae4w6k23lu8a1pp22qbb.jpg",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 83,
//     slug: "probiotiki-dlya-vosstanovleniya-mikroflory-kishechnika-rebenku",
//     title: "Пробиотики для восстановления микрофлоры кишечника ребенку",
//     preview: "Детский организм - это особая структура, любое вмешательство в которую должно быть максимально обоснованно и безопасно. Родители, на плечи которых ложится принятие всех решений ...",
//     image: "/media-s3/articles/h5hzs4xb05ymikn1yugfpp5g826z2h3x.jpg",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 86,
//     slug: "mozhno-li-pit-probiotiki-vmeste-s-antibiotikami",
//     title: "Можно ли пить метабиотики вместе с антибиотиками?",
//     preview: "Вокруг приема антибиотиков существует множество разных теорий и правил, который зачастую противоречат друг другу. Однако, сегодня мы знаем наверняка, что даже обоснованный и нео...",
//     image: "/media-s3/articles/vu8vdnu2xmaf0qlrvxrmucoodjh6xttm.png",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 85,
//     slug: "kak-pravilno-pit-probiotiki-i-antibiotiki",
//     title: "Как правильно пить антибиотики?",
//     preview: "Не новость, что прием антибиотиков чреват множеством не самых приятных побочных эффектов. Многие из них касаются нарушений в работе желудочно-кишечного тракта и баланса кишечной...",
//     image: "/media-s3/articles/upppelnqi52lirlmz18wedwg458cosn5.png",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 84,
//     slug: "nuzhno-li-davat-probiotik-novorozhdennomu",
//     title: "С первых дней и на всю жизнь: важность микрофлоры для здоровья детей",
//     preview: "С первых дней и на всю жизнь: важность микрофлоры для здоровья детей Поддержание здоровой микрофлоры кишечника — один из ключевых факторов, влияющих на здоровье ребенка с первых...",
//     image: "/media-s3/articles/37wu3heurw5qhtnzwjfka5uts35cc9c7.jpg",
//     date: "2024-09-02",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 87,
//     slug: "obyazatelno-li-pit-probiotiki-posle-antibiotikov",
//     title: "Обязательно ли пить метабиотики после антибиотиков",
//     preview: "Развитие медицины - это большое благо, которое помогает человеку справляться со многими болезнями и увеличивать продолжительность жизни. Так, например, появление антибиотиков ст...",
//     image: "/media-s3/articles/w20ua08n38tomwzn2h7ml1zn1g0h3lti.jpg",
//     date: "2024-09-02",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 88,
//     slug: "mozhno-li-prinimat-probiotiki-pri-diaree",
//     title: "Можно ли принимать метабиотики при диарее?",
//     preview: "Состояние и регулярность стула - это тот фактор, по которому можно отследить общее здоровье организма. Любые его изменения, будь то запор или диарея, являются определенным сигна...",
//     image: "/media-s3/articles/trrivgxbc1clzom9k7w7f552w97l7hkm.png",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 90,
//     slug: "pomogayut-li-probiotiki-pri-zaporakh",
//     title: "Помогают ли пробиотики при запорах",
//     preview: "Кроме переваривания пищи и всасывания питательных веществ, кишечник обладает и другими функциями, одна из которых - выделительная. По ней можно судить о правильности работы ЖКТ,...",
//     image: "/media-s3/articles/rf3fummtkhyvlxt17nlpnm0qe22asv3k.jpg",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 91,
//     slug: "stoit-li-pit-probiotiki-posle-rotovirusnoy-infektsii",
//     title: "Стоит ли пить метабиотики после ротовирусной инфекции",
//     preview: "Невидимые глазу вирусы и инфекции обитают повсюду вокруг нас. Защититься от них можно, но не всегда получается, особенно, если речь идет о детях.",
//     image: "/media-s3/articles/lzikaqmixw1qcth363t5dgu1ulor2csa.jpg",
//     date: "2024-09-02",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 89,
//     slug: "vliyanie-probiotikov-na-organizm",
//     title: "Влияние пробиотиков на организм",
//     preview: "Влияние пробиотиков на организм человека изучается давно. Более века назад великий русский ученый И.И.",
//     image: "/media-s3/articles/atu4yu7kasovzu0yk2137vyt6er4vn85.png",
//     date: "2024-09-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 92,
//     slug: "fermenty-i-probiotiki-gde-raznitsa",
//     title: "Ферменты и пробиотики - где разница?",
//     preview: "Пищеварительная система человека устроена сложно, но очень умно. Каждый орган выполняет свою функцию, даже от маленькой бактерии зависит процесс переваривания и усвоения пищи.",
//     image: "/media-s3/articles/8a81uioippjlmv7q2nmc1i0of2t7tlps.jpg",
//     date: "2024-09-02",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 94,
//     slug: "pomogut-li-probiotiki-pri-atroficheskom-gastrite",
//     title: "Помогут ли метабиотики при атрофическом гастрите",
//     preview: "Есть ли в вашем окружении человек с гастритом? К сожалению, статистика на сегодняшний день такова, что 80% населения России, включая детей, болеют различными формами хроническог...",
//     image: "/media-s3/articles/72y027imc05k7nalxzatyw8oeijk1gst.webp",
//     date: "2024-07-31",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 95,
//     slug: "kakie-probiotiki-luchshe-prinimat-pri-yazvennom-kolite",
//     title: "Какие пробиотики лучше принимать при язвенном колите",
//     preview: "Существует целая группа воспалительных заболеваний кишечника (ВЗК), которые являются очень распространенными, включают в себя массу неприятных проявлений, но остаются не до конц...",
//     image: "/media-s3/articles/fiyb31s59ii0t9hlvi3w9k6vvos52h0g.webp",
//     date: "2024-07-31",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 93,
//     slug: "kak-probiotik-pomogaet-pri-atopicheskom-dermatite",
//     title: "Как метабиотик помогает при атопическом дерматите?",
//     preview: "Наш кишечник содержит триллионы микроорганизмов, которые играют ключевую роль в поддержании общего здоровья, включая здоровье кожи. Особой проблемой в последнее время стал атопи...",
//     image: "/media-s3/articles/ihgsr9f24swh0ck3ipoxehekdjs6fm8y.jpg",
//     date: "2024-09-02",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 97,
//     slug: "perimenopauza-chto-eto-za-period-v-zhizni-zhenshchiny-i-nuzhno-li-lechenie",
//     title: "Перименопауза. Что это за период в жизни женщины и нужно ли лечение?",
//     preview: "Женский организм абсолютно уникален. Он способен подарить новую жизнь, благодаря своей сложно устроенной репродуктивной системе.",
//     image: "/media-s3/articles/xp1ztr8xijya3iyfiugm661o3kahxraz.webp",
//     date: "2024-07-02",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 96,
//     slug: "mozhno-li-pit-probiotiki-vo-vremya-beremennosti",
//     title: "Можно ли пить метабиотики во время беременности",
//     preview: "Беременность - особый период в жизни женщины, во время которого она переживает различные изменения, поэтому будущей маме нужно тщательно следить за состоянием своего здоровья. О...",
//     image: "/media-s3/articles/xq7jsmjydt332sisoqdamcz8rprcuf6c.webp",
//     date: "2024-07-31",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 98,
//     slug: "kak-uluchshit-pamyat-vzroslomu",
//     title: "Как улучшить память взрослому",
//     preview: "Оставаться в трезвом уме и твердой памяти до самой старости, пожалуй, мечта многих людей. К сожалению, с возрастом когнитивные способности человека ухудшаются.",
//     image: "/media-s3/articles/s6xfow93fk3cfzq6ilrwgqb9vlkeseap.webp",
//     date: "2024-07-02",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 99,
//     slug: "pravila-pitaniya-pri-bolnom-zheludke-i-kishechnike",
//     title: "Правила питания при больном желудке и кишечнике",
//     preview: "Благополучная работа органов желудочно-кишечного тракта напрямую связана со здоровьем всего организма. Возможно, мы не удивим, сказав, что диета при нарушении желудочно кишечног...",
//     image: "/media-s3/articles/bkv8h2msyumeppi0uicy30iqmz927as3.webp",
//     date: "2024-07-02",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 100,
//     slug: "prostye-sposoby-ukrepit-sosudy",
//     title: "Простые способы укрепить сосуды",
//     preview: "Сосуды - это часть кровеносной системы, которая отвечает за транспортировку крови по всему организму. Они играют ключевую роль в поддержании жизнедеятельности органов и тканей, ...",
//     image: "/media-s3/articles/pcrqhp7x6z87fv2tczvp0bp1m5zgzxcq.webp",
//     date: "2024-06-26",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 101,
//     slug: "lechenie-i-profilaktika-stomatita-chto-vazhno-znat-o-bolezni",
//     title: "Лечение и профилактика стоматита: что важно знать о болезни",
//     preview: "Стоматит является распространенным заболеванием полости рта. Он представляет собой воспаление слизистой оболочки.",
//     image: "/media-s3/articles/cpzmwipl4skx43qy6h0f648oo3enxjfj.webp",
//     date: "2024-06-24",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 103,
//     slug: "probiotiki-pri-lechenii-khelikobakter-pilori",
//     title: "Метабиотики при лечении Хеликобактер пилори",
//     preview: "Бактерия Хеликобактер Пилори живет уже несколько тысяч лет и, к сожалению, продолжает эволюционировать вместе с людьми и животными (обнаруживается даже у птиц). Она отличается н...",
//     image: "/media-s3/articles/ry04f6c2ixs2u44v54iz2z760ihwqi9s.webp",
//     date: "2024-06-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 104,
//     slug: "vosstanovlenie-kishechnika-posle-kolonoskopii",
//     title: "Восстановление кишечника после колоноскопии",
//     preview: "По данным Всемирной Организации Здравоохранения (ВОЗ), от него страдают как минимум 15–20% населения планеты. Но из-за неявных проявлений 2/3 больных вообще не обращаются к врач...",
//     image: "/media-s3/articles/r4syxruqyndn5zfhjz3mg14flefqny8q.webp",
//     date: "2024-06-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 102,
//     slug: "profilaktika-kariesa",
//     title: "Профилактика кариеса",
//     preview: "Кариес - это одно из наиболее распространенных заболеваний полости рта. Оно характеризуется разрушением твердых тканей зуба.",
//     image: "/media-s3/articles/oa1n5nt2czulc809b2tykvq6hfdty2ah.jpg",
//     date: "2024-06-24",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 105,
//     slug: "sindrom-izbytochnogo-bakterialnogo-rosta-kak-ne-propustit-i-kak-vyyavit",
//     title: "Синдром избыточного бактериального роста: как не пропустить и как выявить?",
//     preview: "Здоровая кишечная среда - это то, что поддерживает общее благополучие всего организма. Она полностью зависит от населяющих его бактерий.",
//     image: "/media-s3/articles/pn26jxv04l75c7kpijslzqoh3ix0e2qd.webp",
//     date: "2024-06-03",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 106,
//     slug: "sovmestimost-probiotikov-i-alkogolya",
//     title: "Совместимость пробиотиков и алкоголя",
//     preview: "Все мы знаем о вреде алкоголя. Безусловно, он не несет пользу для здоровья, особенно, если употребляется в чрезмерных количествах.",
//     image: "/media-s3/articles/81w35r8l0x9iojjguo22vvavdg74ztu4.webp",
//     date: "2024-06-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 107,
//     slug: "doktor-berg-immunitet-vs-koronavirus",
//     title: "Доктор Берг: Иммунитет VS коронавирус",
//     preview: "Пока ученые всего мира ищут эффективные средства борьбы с короновирусом (а кто-то, если верить СМИ, их даже нашел) очевидно одно — он поражает — в первую очередь! — людей со сла...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-31",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 108,
//     slug: "rol-mikrobioma-v-zdorove",
//     title: "Роль микробиома в здоровье",
//     preview: "Удивительно. Именно с этого слова стоит начать статью о связи микробов нашего тела и нашего здоровья.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-30",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 109,
//     slug: "chistoe-litso-bez-vysypaniy-sovety",
//     title: "Чистое лицо без высыпаний – советы",
//     preview: "Каждый сбой в работе организма имеет последствия и часто отражается на лице в виде одиноких прыщей, появляющихся друг за другом или множественных высыпаний. Хотя, это может быть...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-28",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 111,
//     slug: "pro-laktobakterii-slyshali-vse-no-ne-vse-znayut-zachem-oni-nam-nuzhny",
//     title: "Про лактобактерии слышали все. Но не все знают, зачем они нам нужны",
//     preview: "Это дружелюбные нашему организму бактерии. Им не нужен наш кислород, и, к тому же, они питаются клетчаткой, которую наш организм не способен использовать.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-26",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 110,
//     slug: "o-polze-ponimaniya-pishchevareniya-i-metabiotikov-i-pravilnom-pitanii",
//     title: "О пользе понимания пищеварения, приема метабиотиков и правильном питании",
//     preview: "Сергей Вялов Врач-гастроэнтеролог, гепатолог, к.м.н. с 12-летним стажем.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-27",
//     time: 13,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 113,
//     slug: "os-kishechnik-mozg",
//     title: "Ось кишечник-мозг",
//     preview: "Из нашего опыта общения с врачами и посещения лечебных учреждений может складываться впечатление, что разные органы или целые системы в нашем теле живут независимо друг от друга...",
//     image: "/media-s3/articles/6bn7zv1n9usjht3a6sowguaxvow361q6.webp",
//     date: "2023-07-24",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 112,
//     slug: "vy-znaete-kakoy-vnutrenniy-organ-samyy-krupnyy-v-chelovecheskom-tele",
//     title: "Вы знаете, какой внутренний орган самый крупный в человеческом теле?",
//     preview: "Нет, не сердце. Это печень.",
//     image: "/media-s3/articles/k0vrddz8u032xlpi30qnd75mcpzyp6gq.webp",
//     date: "2023-07-25",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 115,
//     slug: "chto-takoe-peyerovy-blyashki",
//     title: "Что такое Пейеровы бляшки?",
//     preview: "Телохранители нашего здоровья. Знаете кто это?",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-21",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 114,
//     slug: "sekrety-dolgoletiya-o-tonkostyakh-metabolicheskogo-pitaniya-meditsine-5-p-i-kvartete-zdorovya",
//     title: "Секреты долголетия - о тонкостях метаболического питания, «Медицине 5 П» и «Квартете здоровья»",
//     preview: "Дарья Александровна Гусакова Врач холистической медицины, эндокринолог, специалист по терапии anti-age клиники доктора Калинченко. Более 10 лет занимается вопросами эндокринолог...",
//     image: "/media-s3/articles/ldpvj370y9umv1sdlwc2zi105ilu082b.webp",
//     date: "2023-07-22",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 116,
//     slug: "dieta-pri-boleznyakh-dvenadtsatiperstnoy-kishki",
//     title: "Диета при болезнях двенадцатиперстной кишки",
//     preview: "Двенадцатиперстная кишка представляет собой начальный отдел тонкой кишки. Она приводит пищу в состояние, необходимое для дальнейшего продвижения по кишечнику (регулируя кислотно...",
//     image: "/media-s3/articles/572rs1403csda085lt429w7fphdl7gp4.webp",
//     date: "2023-07-20",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 118,
//     slug: "metabiotiki-s-tochki-zreniya-nauki-sovremennye-issledovaniya-i-perspektivy-razvitiya",
//     title: "Метабиотики с точки зрения науки: современные исследования и перспективы развития.",
//     preview: "Внимание современных исследователей микробиома человека все больше привлекают метабиотики — новое поколение биологических добавок, это ценные продукты метаболизма микроорганизмо...",
//     image: "/media-s3/articles/nlvsklbe3fki6e63nwphmqve7o53ajbp.jpg",
//     date: "2024-12-03",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 117,
//     slug: "nachistotu-otvechaem-samye-na-populyarnye-voprosy-o-daigo",
//     title: "Начистоту: отвечаем на самые популярные вопросы о Daigo.",
//     preview: "Несмотря на то, что бренд Daigo уже более 12 лет успешно существует на рынке товаров для здоровья, а метабиотики сегодня имеют все большую популярность, все равно встречается не...",
//     image: "/media-s3/articles/r7toxse2nr6wciwjxft137ptm1wnwn79.png",
//     date: "2024-12-03",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 119,
//     slug: "luchshe-dolshe-pochemu-vazhno-prinimat-daygo-kursom",
//     title: "Лучше дольше: почему важно принимать Дайго курсом?",
//     preview: "Выпил таблетку и через 20 минут забыл о боли в голове - удобно, правда? Кратковременная «срочная помощь» бывает очень необходима, согласны, но если мы говорим о фундаментальной ...",
//     image: "/media-s3/articles/lq1sk0o8t1jkmcpzgnkclml6mek84d77.jpg",
//     date: "2024-12-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 120,
//     slug: "mikroflora-kishechnika-eye-rol-i-funktsii-v-zhizni-cheloveka",
//     title: "Микрофлора кишечника: её роль и функции в жизни человека.",
//     preview: "Ещё недавно слово «бактерии» ассоциировалось исключительно с чем-то вредным и опасным. Мы привыкли видеть в микробах врагов, которые вызывают болезни и требуют немедленного унич...",
//     image: "/media-s3/articles/mvkb80iu3xqkopco8q70hf1tx2umjl6x.png",
//     date: "2024-12-02",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 121,
//     slug: "chernaya-pyatnitsa-v-daigo-lotereya-skidok-do-30-na-vse-produkty",
//     title: "Черная пятница в Daigo: лотерея скидок до 30% на все продукты",
//     preview: "Черная пятница в Daigo: лотерея скидок до 30% на все продукты! Друзья, цель бренда Daigo - здоровье как можно большего количества людей, поэтому мы дарим возможность приобрести ...",
//     image: "/media-s3/articles/ydw03rbgu14xje8tg9ouzggm6dl88dsf.jpg",
//     date: "2024-11-20",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 122,
//     slug: "kak-izbavitsya-ot-proiskov-khelikobakter-pilori",
//     title: "Как избавиться от происков Хеликобактер Пилори?",
//     preview: "Эта бактерия способна вызывать серьезные воспаления и разрушения слизистой желудка, ассоциируется с гастритом, язвенной болезнью и даже онкологией. Догадались, о ком речь?",
//     image: "/media-s3/articles/z3bdvq53rzwnr5ng4yc0v0ug62sxo8nj.jpg",
//     date: "2024-11-19",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 123,
//     slug: "nauchnaya-osnova-kak-rabotaet-metabiotik-daigo",
//     title: "Научная основа: как работает метабиотик Daigo?",
//     preview: "Еще русский микробилог, Нобелевский лауреат И.И. Мечников считал, что кишечная микробиота - это фундамент нашего долголетия, молодости и красоты.",
//     image: "/media-s3/articles/cjgvf9jhhbccdkzco0mnewc5ivmbjsnl.png",
//     date: "2024-11-13",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 124,
//     slug: "trevozhnye-zvonochki-glavnye-simptomy-khelikobakter-pilori",
//     title: "Тревожные звоночки: главные симптомы Хеликобактер Пилори.",
//     preview: "У каждого человека уникальный отпечаток пальцев, а также…микробиом кишечника! Эта совокупность всех бактерий, в нем обитающих, все чаще рассматривается учёными и врачами как клю...",
//     image: "/media-s3/articles/fsxfaeuotav4qtgii6zdasz62iih94z0.jpg",
//     date: "2024-11-07",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 125,
//     slug: "aktsiya-daigo-2-1",
//     title: "Акция: Daigo 2+1",
//     preview: "Мы рады предложить вам особую выгоду: при покупке двух упаковок Daigo 5 ml, третья достанется вам совершенно бесплатно! Это идеальная возможность поддержать иммунитет и улучшить...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2024-10-11",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 126,
//     slug: "povyste-uznavaemost-svoego-brenda-uchastvuyte-v-partnerskikh-meropriyatiyakh-i-aktsiyakh-daigo",
//     title: "Повысьте узнаваемость своего бренда: участвуйте в партнерских мероприятиях и акциях Daigo",
//     preview: "Узнаваемость бренда — один из ключевых факторов успеха в современном бизнесе. В условиях жесткой конкуренции на рынке важно не только предложить качественный продукт или услугу,...",
//     image: "/media-s3/articles/18g3q1eey6nmvu0st3y4c14lqhdedoya.png",
//     date: "2024-09-08",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 127,
//     slug: "7-funktsiy-kishechnika-avtorskiy-vebinar-tyuzikova-igorya-adamovicha",
//     title: "7 функций кишечника - авторский вебинар Тюзикова Игоря Адамовича",
//     preview: "",
//     image: "/media-s3/articles/2wqs39dvr2zahe0a5rh9ha6pf8ap6xsx.webp",
//     date: "2023-07-09",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 128,
//     slug: "put-k-idealnoy-kozhe-lezhit-cherez-kishechnik",
//     title: "Путь к идеальной коже лежит через…кишечник!",
//     preview: "Если составлять критерии красоты, то чистая кожа без высыпаний обязательно будет в этом списке. В ней нуждаются все и, особенно, публичные люди, которым по долгу службы всегда п...",
//     image: "/media-s3/articles/9m5tun67z63gf7pgz1tq27tmijyny4hq.webp",
//     date: "2023-07-07",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 129,
//     slug: "dieta-pri-yazve-zheludka",
//     title: "Диета при язве желудка",
//     preview: "Питание при язве желудка не менее важно в терапевтическом комплексе, чем медикаментозные препараты. Язва желудка или язвенная болезнь –локальное разрушение слизистой.",
//     image: "/media-s3/articles/o1yhgtj89bwnqm9g6at1mhce0yskn8lb.webp",
//     date: "2023-07-06",
//     time: 9,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 130,
//     slug: "gormonalnoe-starenie-polovye-gormony-mikrobiota-kishechnika-k-m-n-tyuzikov-igor-adamovich",
//     title: "Гормональное старение. Половые Гормоны. Микробиота кишечника - к.м.н. Тюзиков Игорь Адамович",
//     preview: "Тюзиков Игорь Адамович Учёная степень: кандидат медицинских наукУченое звание: Профессор РАЕ Профессор Российской Академии Естествознания",
//     image: "/media-s3/articles/94tk3o8x92n3owgxabfrc6dotlm03qv9.webp",
//     date: "2023-07-04",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 132,
//     slug: "kak-svyazany-delenie-kletok-i-zamedlenie-stareniya",
//     title: "Как связаны деление клеток и замедление старения?",
//     preview: "В 1961 году Леонард Хейфлик обнаружил, что в клетках существует своего рода «молекулярный счетчик». Как ипотечный калькулятор, он отмечает, сколько делений совершила клетка.",
//     image: "/media-s3/articles/27gju1n9qpoflxl0uteswoklojmwhfqk.webp",
//     date: "2023-07-02",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 131,
//     slug: "kak-vylechit-yachmen-na-glazu",
//     title: "Как вылечить ячмень на глазу",
//     preview: "Проснулись утром, а на глазу неприятный подарок? С таким явлением как ячмень сталкивался, наверное, каждый.",
//     image: "/media-s3/articles/ga1rh6rks0z2sr1w4c70259e03wve5fo.webp",
//     date: "2023-07-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 133,
//     slug: "metabiotiki-kak-sredstvo-immunoreabilitatsii-v-inektsionnoy-kosmetologii-d-m-n-ilnitskiy-a-n",
//     title: "Метабиотики как средство иммунореабилитации в инъекционной косметологии. д.м.н Ильницкий А.Н.",
//     preview: "Андрей Николаевич Ильницкий Доктор медицинских наук, профессор, АНО Научно-исследовательский медицинский центр \"Геронтология\", город Москва",
//     image: "/media-s3/articles/apzr9wkygb63bwr40qb3y2dxeptu6jsy.webp",
//     date: "2023-07-01",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 135,
//     slug: "dieta-pri-infektsionnykh-zabolevaniyakh-kishechnika",
//     title: "Диета при инфекционных заболеваниях кишечника",
//     preview: "Кишечник часто называют «наружным» органом, потому что наше пищеварение начинается с ротовой полости, которая состоит из слизистых. Не секрет, что именно на слизистых оседают ра...",
//     image: "/media-s3/articles/29uvdfmx4zqlpccohtrvvfjx4g28dibf.webp",
//     date: "2023-06-29",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 134,
//     slug: "insulinorezistentnost-ozhirenie-diabet-endokrinolog-rozhdestvenskaya-olga",
//     title: "Инсулинорезистентность. Ожирение. Диабет - эндокринолог Рождественская Ольга",
//     preview: "Рождественская Ольга - эндокринолог, андролог, диетолог",
//     image: "/media-s3/articles/7itafivsui7bg2xrmiw6ywd0700qkss8.webp",
//     date: "2023-06-30",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 136,
//     slug: "pitanie-bolnykh-pri-rake-kishechnika",
//     title: "Питание больных при раке кишечника",
//     preview: "Именно неправильное питание провоцирует развитие раковых (онкологических) заболеваний кишечника, поэтому диета стоит на первом месте как для лечения, так и для профилактики. Что...",
//     image: "/media-s3/articles/dz6fw9egz6k2vaums0t4qd3u5ehbbdb9.webp",
//     date: "2023-06-28",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 139,
//     slug: "10-pravil-zdorovya",
//     title: "10 правил здоровья",
//     preview: "Заключение Мы изучили кишечник в рамках 7 глав под общим названием «7 функций кишечника». С одной стороны, в кишечнике синтезируются различные вещества , а с другой стороны, упо...",
//     image: "/media-s3/articles/td1wq9yb6gr18cyhfshb411uwaduc46v.webp",
//     date: "2023-06-24",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 137,
//     slug: "zachem-nuzhna-pishchevaritelnaya-sistema-probiotiki-prebiotiki-i-metabiotiki-sinichka-i-baton",
//     title: "Зачем нужна пищеварительная система? Пробиотики, пребиотики и метабиотики. \"Синичка и батон\"",
//     preview: "Сергей Вялов Врач-гастроэнтеролог, гепатолог, кандидат медицинских наук, медицинский эксперт федеральных образовательных программ для врачей, медицинский консультант федеральных...",
//     image: "/media-s3/articles/o1yhgtj89bwnqm9g6at1mhce0yskn8lb.webp",
//     date: "2023-06-26",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 140,
//     slug: "populyarnye-voprosy-plasticheskomu-khirurgu-andrey-iskornev",
//     title: "Популярные вопросы пластическому хирургу. Андрей Искорнев",
//     preview: "",
//     image: "/media-s3/articles/94tk3o8x92n3owgxabfrc6dotlm03qv9.webp",
//     date: "2023-06-18",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 138,
//     slug: "gde-nachinaetsya-nash-immunitet-i-kak-nam-ego-ne-poteryat-ochen-poleznye-blyashki",
//     title: "Где начинается наш иммунитет и как нам его не потерять? Очень полезные бляшки.",
//     preview: "Галкина Ирина Юрьевна Научный Руководитель компании Профлайн и руководитель Учебно Методического Центра Профлайн, кандидат.мед.наук, Член Национального общества регенеративной м...",
//     image: "/media-s3/articles/tv25mq4tj32q0qw7co3jpd97fs1y0joh.webp",
//     date: "2023-06-25",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 143,
//     slug: "kishechnik-i-immunitet-protivostoim-novym-vyzovam-xxi-veka",
//     title: "Кишечник и иммунитет-противостоим новым вызовам XXI века",
//     preview: "Прощаев Кирилл Иванович д.м.н., врач-терапевт, профессор кафедры терапии, гериатрии и антивозрастной медицины ФГБОУ ДПО «Институт повышения квалификации Федерального медико-биол...",
//     image: "/media-s3/articles/hod4wzi7ksrenkria2u2y627idkio5uk.webp",
//     date: "2023-06-15",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 142,
//     slug: "starcheskaya-dementsiya",
//     title: "Старческая деменция",
//     preview: "Естественные процессы старения касаются всех органов тела человека, в том числе, головного мозга. Физиологические изменения в преклонном возрасте включают некоторые нарушения по...",
//     image: "/media-s3/articles/9m5tun67z63gf7pgz1tq27tmijyny4hq.webp",
//     date: "2023-06-16",
//     time: 12,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 141,
//     slug: "vy-znali-chto-plokhie-bakterii-vydelyayut-toksichnoe-veshchestvo-ammiak-vnutri-nashego-tela",
//     title: "Вы знали, что \"плохие\" бактерии выделяют токсичное вещество аммиак внутри нашего тела",
//     preview: "Не секрет, что аммиак в больших количествах наносит вред нашему организму. А знали ли вы, что и мы сами его производим?",
//     image: "/media-s3/articles/jryg969q6ajacwn90p6qqhnqmkr2l9ap.webp",
//     date: "2023-06-17",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 145,
//     slug: "ochishchenie-krovi-khoroshaya-kishechnaya-sreda-predotvrashchaet-kishechnoe-brozhenie-i-sposobstvuet",
//     title: "Очищение крови. Хорошая кишечная среда предотвращает кишечное брожение и способствует очищению крови.",
//     preview: "Роль крови Знаете ли вы, сколько крови содержится в организме человека? В целом считается, что масса крови составляет 7-8% от массы всего тела.",
//     image: "/media-s3/articles/f5nmi66xw8xkpitcvjm5ljgc797jt1we.webp",
//     date: "2023-06-13",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 146,
//     slug: "immunitet-v-kishechnike-nakhoditsya-70-limfotsitov-",
//     title: "Иммунитет. В кишечнике находится 70% лимфоцитов.",
//     preview: "Что такое иммунитет Иммунитет – это механизм для защиты от заболеваний и их лечения. К основным функциям иммунитета относятся защита от инфекций, поддержание и укрепление здоров...",
//     image: "/media-s3/articles/6nn7yb4453628wdvv9zoostlnw2lu0i2.webp",
//     date: "2023-06-12",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 147,
//     slug: "myshtsy-i-samoizolyatsiya-do-i-posle",
//     title: "Мышцы и самоизоляция: до и после",
//     preview: "Ильницкий Андрей Николаевич Доктор медицинских наук, профессор, первый заместитель директора АНО «Научно-исследовательский медицинский центр «Геронтология», заведующий кафедрой ...",
//     image: "/media-s3/articles/n3nc0veomc933xe3locf07felvzvedjx.webp",
//     date: "2023-06-11",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 144,
//     slug: "kak-effektivno-pomoch-immunitetu-i-kozhe-v-sezon-stressov-i-potryaseniy",
//     title: "Как эффективно помочь иммунитету и коже в сезон стрессов и потрясений?",
//     preview: "Галкина Ирина Юрьевна Научный Руководитель компании Профлайн и руководитель Учебно Методического Центра Профлайн, кандидат.мед.наук, Член Национального общества регенеративной м...",
//     image: "/media-s3/articles/dbzhdzpj0kz4uvx006d98e5z5zcyimyr.webp",
//     date: "2023-06-14",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 149,
//     slug: "sintez-vitaminy-gormony-i-fermenty-sinteziruyutsya-v-kishechnike",
//     title: "Синтез. Витамины, гормоны и ферменты синтезируются в кишечнике.",
//     preview: "Ферменты Ферменты жизненно необходимы для жизни. Они участвуют во всех процессах жизнедеятельности, от пищеварения и всасывания питательных веществ до дыхания и мышечного движения.",
//     image: "/media-s3/articles/gs2drtu1s9rtrshi3l9cob2ap2gv31za.webp",
//     date: "2023-06-09",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 148,
//     slug: "stress-menedzhment-v-epokhu-peremen-effektivnye-tekhniki-i-priyemy-dlya-vas-i-vashikh-blizkikh",
//     title: "Стресс-менеджмент в эпоху перемен. Эффективные техники и приёмы для вас и ваших близких.",
//     preview: "​Молокова Елена Валентиновна Гинеколог-эндокринолог Врач превентивной и антивозрастной медицины Мы живём сейчас в непростое время. В нашем пространстве появилась новая \"вводная\".",
//     image: "/media-s3/articles/34rpm6x11uqcgrg6w7xtbn1ry0gr69ic.webp",
//     date: "2023-06-10",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 150,
//     slug: "novoe-v-meditsine-psikhobiogenezis",
//     title: "Новое в медицине: психобиогенезис",
//     preview: "Прощаев Кирилл Иванович д.м.н., врач-терапевт, профессор кафедры терапии, гериатрии и антивозрастной медицины ФГБОУ ДПО «Академия повышения квалификации Федерального медико-биол...",
//     image: "/media-s3/articles/saxodr43yt1by1j41vte8u91g42yzvny.webp",
//     date: "2023-06-08",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 153,
//     slug: "nastroyka-mukozalnogo-immuniteta-immunnaya-sistema-slizistykh-obolochek-cherez-pishchevaritelnyy-tra",
//     title: "Настройка мукозального иммунитета (иммунная система слизистых оболочек) через пищеварительный тракт",
//     preview: "Гладских Лариса Валентиновна Генеральный директор ЗАО «МЕДМИНИПРОМ», доктор фармацевтических наук, академик РАМТН, член научного совета Cellgym Technologies GmbH Возможности про...",
//     image: "/media-s3/articles/3q74rdgukuw2zrv56cz5pl91jhybdcpz.webp",
//     date: "2023-06-05",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 152,
//     slug: "vsasyvanie-pitatelnye-veshchestva-takie-kak-sakhara-aminokisloty-i-zhirnye-kisloty-vsasyvayutsya-che",
//     title: "Всасывание. Питательные вещества, такие как сахара, аминокислоты и жирные кислоты, всасываются через кишечную стенку",
//     preview: "Питательные вещества поступают через тонкий кишечник Тонкий кишечник является местом всасывания питательных веществ. Всасывание осуществляется через клетки на его поверхности (э...",
//     image: "/media-s3/articles/f7bhp27n2tnikfqictpy98kt6cabnxkm.webp",
//     date: "2023-06-06",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 151,
//     slug: "detoksikatsiya",
//     title: "Детоксикация. Химические вещества разрушаются и блокируются.",
//     preview: "Детоксикация начинается с печени В последнее время слово «детокс» стало ключевым для характеристики здорового образа жизни. Как часто вы слышите это слово?",
//     image: "/media-s3/articles/q1t0v21hp9in4oymb68k7xtn3nwygy3r.webp",
//     date: "2023-06-07",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 154,
//     slug: "postkovidnyy-sindrom-simptomy-terapiya",
//     title: "Постковидный синдром. Симптомы. Терапия",
//     preview: "Постковидный синдром Постковидный синдром - это клиническое состояние, возникающее после выздоровления от острой коронавирусной инфекции. От данной реакции на перенесенное забол...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-06-04",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 155,
//     slug: "chto-takoe-metabiotiki-v-chem-ikh-polza",
//     title: "Аденовирусная инфекция. Что это. Симптомы.",
//     preview: "Аденовирусная инфекция — это группа острых вирусных заболеваний, которые могут проявляться поражением слизистых оболочек дыхательных путей, глаз, кишечника и лимфоидной ткани. В...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-06-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 156,
//     slug: "khronicheskiy-gastrit",
//     title: "Хронический гастрит",
//     preview: "Хронический гастрит – это группа длительно протекающих воспалительных заболеваний слизистой оболочки желудка, характеризующееся нарушением секреторной (кислотообразующей), мотор...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-06-02",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 158,
//     slug: "muzhskoe-dolgoletie-novyy-vzglyad-na-profilaktiku-raka-predstatelnoy-zhelezy",
//     title: "Мужское долголетие: новый взгляд на профилактику рака предстательной железы",
//     preview: "А.Н. Ильницкий, д.м.н., профессор, заведующий кафедрой терапии, гериатрии и антивозрастной медицины Академии постдипломного образования Федерального научно-клинического центра Ф...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-05-31",
//     time: 12,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 157,
//     slug: "ko-mne-obratilas-zhenshchina-40-let-s-zhalobami-vysypaniya-na-litse",
//     title: "Ко мне обратилась женщина 40 лет с жалобами высыпания на лице",
//     preview: "Косметолог эстетист Малицкая Виктория Николаевна Победитель 6-го международного конкурса косметологов Санкт Петербург в 2006 году. Профессиональный тренер косметолог.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-06-01",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 160,
//     slug: "koronavirusnaya-infektsiya-rasprostranenie-proyavleniya",
//     title: "Коронавирусная инфекция. Распространение. Проявления.",
//     preview: "Коронавирусная инфекция (COVID-19) – это острое респираторное инфекционное заболевание, вызываемое вирусом SARS-CoV-2. Данный вирус был впервые выявлен в 2019 году в городе Ухан...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-05-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 159,
//     slug: "akne-kak-lechit-prichiny",
//     title: "Акне. Как лечить. Причины.",
//     preview: "Акне (угревая сыпь) – это воспалительное заболевание кожи, возникающее вследствие скопления избыточного количества кожного сала в устьях волосяных фолликулов. Это приводит к обр...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-05-25",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 161,
//     slug: "vydelenie-nenuzhnye-veshchestva-i-toksiny-vyvodyatsya-iz-organizma",
//     title: "Выделение. Ненужные вещества и токсины выводятся из организма.",
//     preview: "Состав выделений из толстого кишечника Около 70-80% фекалий состоит из воды, оставшуюся часть составляют остатки пищи, кишечные бактерии и слизь, а также другие вещества. Формир...",
//     image: "/media-s3/articles/9w1lyy169eimvunoms9hvnk1emv2teb7.webp",
//     date: "2023-01-04",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 162,
//     slug: "pishchevarenie-pishcha-tshchatelno-pererabatyvaetsya",
//     title: "Пищеварение. Пища тщательно перерабатывается",
//     preview: "Изо рта в желудок Этапы пищеварения (расщепления) различаются в зависимости от состава пищи. Когда углеводные продукты, такие как рис и хлеб, попадают в рот и смешиваются со слю...",
//     image: "/media-s3/articles/ot0zws292920acw1syfzm2mw178gdztx.webp",
//     date: "2023-01-04",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 164,
//     slug: "dieta-pri-zabolevanii-sigmovidnoy-kishki",
//     title: "Диета при заболевании сигмовидной кишки",
//     preview: "Наш желудочно-кишечный тракт состоит из разных органов и отделов. Сигмовидная кишка - это один из отделов толстого кишечника.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2022-03-15",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 163,
//     slug: "reabilitatsiya-posle-lecheniya-onkologii",
//     title: "Реабилитация после лечения онкологии",
//     preview: "Онкология (рак) – это группа заболеваний, каждое из которых способно поражать любой орган или ткань, это происходит за счет патологического разрастания аномальных клеток. На бол...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2022-03-17",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 167,
//     slug: "po-muzhski-chem-otlichaetsya-starenie-kozhi-u-muzhchin-ot-zhenshchin-i-kak-ego-zamedlit",
//     title: "По-мужски: чем отличается старение кожи у мужчин от женщин и как его замедлить?",
//     preview: "Как происходит старение кожи? Под поверхностью кожи задолго до появления первых морщин разворачивается сложная молекулярная драма.",
//     image: "/media-s3/articles/oxrd452gf1xe0amv5yhkwscub9qnj6g9.png",
//     date: "2025-04-28",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 166,
//     slug: "optimiziruyte-svoi-raskhody-ispolzuyte-partnerskuyu-programmu-daigo-dlya-snizheniya-zatrat-na-privle",
//     title: "Оптимизируйте свои расходы: используйте партнерскую программу Daigo для снижения затрат на привлечение клиентов.",
//     preview: "Компании всегда ищут всевозможные способы оптимизировать свои затраты, особенно на привлечение клиентов. И это нормально!",
//     image: "/media-s3/articles/57921qqmydwemg9nt2do0so71f957mhr.png",
//     date: "2021-11-21",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 168,
//     slug: "na-chto-vliyaet-mikroflora-kishechnika",
//     title: "2. На что влияет микрофлора кишечника?",
//     preview: "Главные функции микрофлоры кишечника Немногие задумываются о том, что ключевую роль в самочувствии и пищевых привычках играет микрофлора кишечника — триллионы микроорганизмов, о...",
//     image: "/media-s3/articles/yhyqpieqe92gcppbxm8cfhwnu87vv79f.jpg",
//     date: "2025-04-26",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 169,
//     slug: "allergiya-i-astma-ekspertnoe-mnenie-o-prichinakh-zabolevaniy-i-sposobakh-borby-s-nimi",
//     title: "Аллергия и астма: экспертное мнение о причинах заболеваний и способах борьбы с ними",
//     preview: "Аллергические заболевания затрагивают миллионы людей во всем мире, существенно влияя на качество их жизни. В последние десятилетия отмечается рост заболеваемости аллергией и аст...",
//     image: "/media-s3/articles/n3th53jag532vuxtt1pcruvaewa9yem8.png",
//     date: "2025-04-25",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 170,
//     slug: "revmatoidnyy-artrit-mogut-li-pomoch-peptidy",
//     title: "Ревматоидный артрит: могут ли помочь пептиды?",
//     preview: "Проблемная основа ревматоидного артрита Когда утро начинается не с бодрости, а с боли, пальцы не слушаются, колени ноют, а простые движения превращаются в испытание, тогда слова...",
//     image: "/media-s3/articles/1qc7s02909odfkbxhoswbathcuk49foh.jpg",
//     date: "2025-04-23",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 165,
//     slug: "litso-kazhdogo-cheloveka-zerkalo-ego-pishchevykh-privychek",
//     title: "Лицо каждого человека – зеркало его пищевых привычек!",
//     preview: "И то, как часто вы едите сладкое или пьете вино, можно легко определить по состоянию кожи. Британский врач-натуропат, дерматолог Нигма Талиб после долгих наблюдений за пациентам...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2022-02-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 171,
//     slug: "peptidy-protiv-pigmentatsii-novyy-podkhod-k-rovnomu-tonu-litsa",
//     title: "Пептиды против пигментации: новый подход к ровному тону лица",
//     preview: "За что отвечает каждый слой кожи? Ровная и сияющая кожа, словно фарфор, — мечта многих.",
//     image: "/media-s3/articles/5weikorjvha677ihls772bnbo0phjm3n.jpg",
//     date: "2025-04-23",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 174,
//     slug: "os-kishechnik-mozg-kto-kogo-kontroliruet",
//     title: "Ось «кишечник-мозг»: кто кого контролирует?",
//     preview: "Как связаны кишечник и мозг? В последние десятилетия наука все больше внимания уделяет изучению сложных взаимодействий между различными системами организма.",
//     image: "/media-s3/articles/dg2vqm99jaz6i9ecfwixtruux7rb63jk.jpg",
//     date: "2025-04-23",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 172,
//     slug: "mikrobiota-kishechnika-novyy-podkhod-k-lecheniyu-depressii-i-trevogi",
//     title: "Микробиота кишечника: новый подход к лечению депрессии и тревоги",
//     preview: "Связь уровня стресса и микробиоты Что, если наше настроение, уровень стресса и даже склонность к тревоге зависят не только от мыслей и переживаний, но и от того, что происходит ...",
//     image: "/media-s3/articles/vcdujtbd3h87qdfxo3gzvbd9t9jjdu0z.png",
//     date: "2025-04-23",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 176,
//     slug: "mikroflora-i-alkogol-pochemu-spirtnoe-narushaet-balans-kishechnika-i-kak-predotvratit-eto",
//     title: "Микрофлора и алкоголь: почему спиртное нарушает баланс кишечника и как предотвратить это?",
//     preview: "Как алкоголь влияет на пищеварительную систему Люди нередко позволяют себе выпить спиртного в компании друзей или после напряженного дня. Алкоголь стал частью культуры и отдыха,...",
//     image: "/media-s3/articles/ls721doscrphdyr4ts7i7abrojv2ampz.jpg",
//     date: "2025-04-11",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 173,
//     slug: "plazmalogeny-skrytyy-resurs-vashego-mozga-kak-uvelichit-produktivnost-v-2-raza",
//     title: "Плазмалогены - скрытый ресурс вашего мозга: как увеличить продуктивность в 2 раза?",
//     preview: "Плазмалогены и продуктивность Если представить мозг в виде высокотехнологичного суперкомпьютера, работающего на уникальном биотопливе, то каждого будет занимать вопрос о качеств...",
//     image: "/media-s3/articles/nfbwwoc2ghun0481e55n8w8chqobdwa4.png",
//     date: "2025-04-23",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 175,
//     slug: "glyuten-i-laktoza-komu-deystvitelno-nuzhno-ikh-izbegat",
//     title: "Глютен и лактоза: кому действительно нужно их избегать?",
//     preview: "Г лютен: что это и почему он стал проблемой для многих? В последние годы безглютеновые и безлактозные диеты стали настоящим трендом: полки магазинов заполнены продуктами с помет...",
//     image: "/media-s3/articles/aoqi29vjazsdjfjsa8oc6icexlg5h3ym.jpg",
//     date: "2025-04-15",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 177,
//     slug: "kak-izbavitsya-ot-perkhoti-rol-bakteriy-i-proverennye-metody-borby",
//     title: "Как избавиться от перхоти: роль бактерий и проверенные методы борьбы",
//     preview: "Пе рхоть и бактерии Перхоть — распространённая проблема, которая затрагивает около 50% взрослого населения . Долгое время считалось, что её вызывает исключительно грибок Malasse...",
//     image: "/media-s3/articles/eezhi7cg5ktavpal0c0syk154gki3xg5.png",
//     date: "2025-04-11",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 178,
//     slug: "gipodinamiya-kak-sidyachiy-obraz-zhizni-vliyaet-na-zdorove",
//     title: "Гиподинамия: как сидячий образ жизни влияет на здоровье?",
//     preview: "Почему гиподинамию называют «тихим убийцей»? Гиподинамия – это состояние, при котором человек ведет малоподвижный образ жизни, испытывая хронический недостаток физической активн...",
//     image: "/media-s3/articles/6jm406a10wufygzbm0phbab57f9h38es.png",
//     date: "2025-04-10",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 179,
//     slug: "skrytoe-vospalenie-i-vozrast-pochemu-inflameydzhing-vrag-molodosti",
//     title: "Скрытое воспаление и возраст: почему инфламейджинг — враг молодости",
//     preview: "Что такое инфламейджинг и как он связан со старостью? За последнее столетие средняя продолжительность жизни заметно выросла, однако вместе с долголетием увеличилась и распростра...",
//     image: "/media-s3/articles/moovf0wf7i4yhshm9zv5n3vb08dpuyda.png",
//     date: "2025-04-10",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 181,
//     slug: "prezhdevremennoe-starenie-ot-khronicheskogo-stressa-do-skrytogo-vospaleniya",
//     title: "Преждевременное старение: от хронического стресса до скрытого воспаления",
//     preview: "Преждевременное старение: почему организм «сдаёт позиции» раньше времени — и можно ли это остановить? Старение — естественный процесс, который начинается в организме с первых ле...",
//     image: "/media-s3/articles/tnv2gx6x2r4kih1zdxgj5hbpruowz6du.png",
//     date: "2025-04-08",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 180,
//     slug: "stomatit-voyna-mikrobov-v-rotovoy-polosti",
//     title: "Стоматит: война микробов в ротовой полости",
//     preview: "Как связаны между собой кишечный и ротовой микробиом? Последние исследования раскрывают удивительные факты: оказывается, за болезненными язвочками во рту стоит не просто инфекци...",
//     image: "/media-s3/articles/74kylkcjigbq5a2bf395hf0gu4z7o745.png",
//     date: "2025-04-09",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 182,
//     slug: "khondroprotektory-dlya-sustavov-vasha-zashchita-ili-pustaya-trata-de-neg",
//     title: "Хондропротекторы для суставов: ваша защита или пустая трата денег?",
//     preview: "Хондропротекторы - прошлый век? Исследования показывают, что 60% бегунов испытывают боли в коленях (пателлофеморальный синдром), 30% тяжелоатлетов сталкиваются с артрозом коленн...",
//     image: "/media-s3/articles/68mtcel9vd7fo1rjhqmnp7n51ef3x2oo.png",
//     date: "2025-04-07",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 183,
//     slug: "vesna-sezon-bolezney-legkikh-kak-kishechnik-pomogaet-zashchititsya",
//     title: "Весна — сезон болезней легких. Как кишечник помогает защититься?",
//     preview: "Причины обострения бронхолегочных заболеваний весной Авитаминоз и ослабленный иммунитет: скудный на свежие овощи и фрукты зимний рацион приводит к дефициту витаминов A, B, C, D ...",
//     image: "/media-s3/articles/zcracbndecdjiwv0rzk4xz3v2koxnrkd.png",
//     date: "2025-04-07",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 185,
//     slug: "revmatoidnyy-artrit-spasenie-v-peptidakh",
//     title: "Ревматоидный артрит:  спасение в пептидах?",
//     preview: "Как бороться с болезнью, которая разрушает суставы и заставляет организм атаковать самого себя? Когда утро начинается не с бодрости, а с боли, пальцы не слушаются, колени ноют, ...",
//     image: "/media-s3/articles/68mtcel9vd7fo1rjhqmnp7n51ef3x2oo.png",
//     date: "2025-04-03",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 187,
//     slug: "kak-nayti-effektivnoe-sredstvo-ot-allergii",
//     title: "Как найти эффективное средство от аллергии?",
//     preview: "Разного характера аллергия, к сожалению, прочно вошла в нашу жизнь. Сезонная или пищевая - она может проявляться в различных формах, от легкого насморка и зуда, до более серьезн...",
//     image: "/media-s3/articles/08wwykmue5teiuvf86smebj1art2gnrj.png",
//     date: "2025-04-03",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 184,
//     slug: "vstrechayte-prilozhenie-daigo",
//     title: "Встречайте приложение Daigo!",
//     preview: "Встречайте новое приложение Daigo — всё, что вы любите, стало ещё ближе Вот что ждёт вас внутри: Обновленная система лояльности Теперь каждый ваш шаг с Daigo — шаг в сторону при...",
//     image: "/media-s3/articles/411wwh8s3dc9ffojnuyn9plc67tuanqv.jpg",
//     date: "2025-04-04",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 186,
//     slug: "rost-allergii-i-astmy-ekspertnoe-mnenie-o-prichinakh-zabolevaniy-i-sposobakh-borby-s-nimi",
//     title: "Рост аллергии и астмы: экспертное мнение о причинах заболеваний и способах борьбы с ними",
//     preview: "Аллергические заболевания затрагивают миллионы людей во всем мире, существенно влияя на качество их жизни. В последние десятилетия отмечается рост заболеваемости аллергией и аст...",
//     image: "/media-s3/articles/gkpymltfxmonzkmcwwv5cjixroywmyqz.png",
//     date: "2025-04-03",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 188,
//     slug: "allergicheskiy-rinit-simptomy-diagnoz-terapiya",
//     title: "Аллергический ринит. Симптомы. Диагноз. Терапия.",
//     preview: "Аллергический ринит – это воспалительное заболевание слизистой оболочки носа, обусловленное влиянием аллергенов. Данное заболевание может протекать круглогодично или в определен...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2025-04-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 190,
//     slug: "migren-pod-mikroskopom-rol-peptidov-v-patogeneze-problemy",
//     title: "Мигрень под микроскопом: роль пептидов в патогенезе проблемы",
//     preview: "Мигрень под микроскопом По данным ВОЗ, мигрень входит в топ-10 причин, нарушающих качество жизни, опережая диабет и гипертонию. Каждый седьмой человек на планете знает ее лицо, ...",
//     image: "/media-s3/articles/5j1naymhk9zd20fwjafew5ef391fyimu.png",
//     date: "2025-03-31",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 189,
//     slug: "sovety-dlya-otvetstvennykh-khozyaev-kak-podderzhat-aktivnost-pitomtsa-na-dolgie-gody-",
//     title: "Советы для ответственных хозяев: как поддержать активность питомца на долгие годы",
//     preview: "Причины пониженной активности ваших питомцев С возрастом домашние животные становятся менее активными, больше спят, теряют интерес к играм и прогулкам. Владельцы часто с грустью...",
//     image: "/media-s3/articles/zmdc520a9eo5n1t2euoknydp5lvjlke6.png",
//     date: "2025-04-02",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 191,
//     slug: "kak-zamedlit-starenie-kozhi",
//     title: "Как замедлить старение кожи?",
//     preview: "Основы основ: роль слоев кожи в поддержании молодости и здоровья Старение кожи – неизбежный биологический процесс, заложенный в нашей ДНК, но ускоренный внешними и внутренними ф...",
//     image: "/media-s3/articles/bva34iwzen1onpri0vyn3oqlcrh1eel5.png",
//     date: "2025-03-31",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 192,
//     slug: "vesenniy-bum-skidok-neozhidanno-dazhe-dlya-nas-prazdnuem-8-marta-po-polnoy",
//     title: "Весенний БУМ скидок — неожиданно даже для нас! Празднуем 8 Марта по полной!",
//     preview: "Весенний БУМ скидок в Daigo: лотерея скидок до 25% на все продукты! Весенняя лихорадка началась!",
//     image: "/media-s3/articles/l91bhcd92zpehjbduk1gv9rfeghfe1p2.jpg",
//     date: "2025-03-31",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 194,
//     slug: "pochemu-pitomtsu-s-zabolevaniem-zhkt-ne-pomogut-antibiotiki-i-probiotiki-razbiraem-effektivnuyu-stra",
//     title: "Почему питомцу с заболеванием ЖКТ не подходят пробиотики?",
//     preview: "Причины заболеваний ЖКТ у домашних животных Здоровье желудочно-кишечного тракта является основой общего состояния здоровья Вашего питомца. Дисбаланс кишечной микрофлоры у животн...",
//     image: "/media-s3/articles/npwou1eq7o9z8sn3raedvu5wubz4cyh5.jpg",
//     date: "2025-03-27",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 193,
//     slug: "shchit-ot-virusov-kak-mikroflora-zashchishchaet-ot-orvi",
//     title: "Щит от вирусов: как микрофлора защищает от ОРВИ?",
//     preview: "Миллионы людей сталкиваются с насморком, температурой и болью в горле — классическими симптомами ОРВИ. Несмотря на то, что острые респираторные вирусные инфекции хорошо изучены,...",
//     image: "/media-s3/articles/m5oilx8c6ox54yjsatjwl96hwa5hbni2.jpg",
//     date: "2025-03-28",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 195,
//     slug: "gibkiy-razum-sekrety-neyroplastichnosti-i-sposobnosti-k-obucheniyu",
//     title: "Гибкий разум: секреты нейропластичности и способности к обучению",
//     preview: "Способность к обучению в нейропластичности Способность к обучению — одно из самых удивительных свойств человеческого мозга. Мы учимся с первых дней жизни: осваиваем речь, приобр...",
//     image: "/media-s3/articles/q0kcqzr1wup2r2nd5ks4c8u6eeenz11r.jpg",
//     date: "2025-03-27",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 196,
//     slug: "ot-kishechnika-do-nasmorka-svyaz-immuniteta-i-mikroflory",
//     title: "От кишечника до насморка: связь иммунитета и микрофлоры",
//     preview: "Связь иммунитета и микрофлоры Острые респираторные заболевания (ОРЗ) и острые респираторные вирусные инфекции (ОРВИ) — это одни из самых распространённых заболеваний в мире. Каж...",
//     image: "/media-s3/articles/zhjdi133ux0t8goy7m4g3bbsoyw06ch3.png",
//     date: "2025-03-18",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 197,
//     slug: "pullulanovye-kapsuly-innovatsiya-v-dostavke-aktivnykh-veshchestv",
//     title: "Пуллулановые капсулы: инновация в доставке активных веществ.",
//     preview: "Эффективность пищевых добавок: не только содержание, но и форма Современный рынок биологически активных добавок предлагает потребителям широкий ассортимент продуктов, направленн...",
//     image: "/media-s3/articles/s2b0g2rxal02qgsqukx0lkerl9mko5wk.png",
//     date: "2025-03-04",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 198,
//     slug: "balans-intimnoy-mikroflory-klyuch-k-zhenskomu-zdorovyu",
//     title: "Баланс интимной микрофлоры — ключ к женскому здоровью!",
//     preview: "Баланс интимной микрофлоры Миллиарды микроорганизмов играют ключевую роль в поддержании здоровья человеческого организма. Микрофлора присутствует в различных частях тела: в кише...",
//     image: "/media-s3/articles/cjvt30j4n5tnkgbyiy2xz46wkfg4tzqb.jpg",
//     date: "2025-03-04",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 200,
//     slug: "dva-slona-pomoshchi-mozgu-tamotsu-ili-aminobiotik-daigo-brainy",
//     title: "Два слона помощи мозгу: Tamotsu или аминобиотик Daigo Brainy?",
//     preview: "Что необходимо для поддержания активности мозга? Головной мозг — это главный центр управления нашим телом, эмоциями, мышлением и памятью.",
//     image: "/media-s3/articles/kkel6mwduiuc0lf8k1qitr234suylbhp.png",
//     date: "2025-03-04",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 199,
//     slug: "daigo-kak-vino-fermentatsiya-prodolzhaetsya-v-upakovke",
//     title: "Daigo как вино: ферментация продолжается в упаковке!",
//     preview: "Польза ферментированных продуктов С древних времен люди интуитивно понимали, что некоторые продукты обладают особой силой, способной укреплять здоровье и продлевать жизнь. Одним...",
//     image: "/media-s3/articles/3ulgpuh4xxg22okan0688kq296mntm0s.png",
//     date: "2025-03-04",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 202,
//     slug: "kak-pishchevye-privychki-kontroliruyut-vashu-zhizn-i-chto-s-etim-delat-poleznye-sovety-ot-eksperta",
//     title: "Как пищевые привычки контролируют Вашу жизнь и что с этим делать: полезные советы от эксперта",
//     preview: "Елена Карлинская — психолог, сертифицированный гештальт-терапевт Расстройства пищевого поведения: где граница между нормой и проблемой? Питание — это не только биологическая пот...",
//     image: "/media-s3/articles/ozqpsl6qf388t66umsmu23qurqov10uo.jpg",
//     date: "2025-02-21",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 201,
//     slug: "kak-daigo-pomogaet-pri-psoriaze-ot-kishechnika-k-kozhe",
//     title: "Как Daigo помогает при псориазе: от кишечника к коже",
//     preview: "Нарушения в работе иммунной системы Всего семь букв, одно слово, и болезнь, которая основательно портит качество жизни человека - псориаз. Несмотря на то, что псориаз известен ч...",
//     image: "/media-s3/articles/csv9jncyacqbm49flvz0vvd0s7t5v1a4.png",
//     date: "2025-03-04",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 205,
//     slug: "sindrom-vyzhatogo-apelsina-kak-spasti-mozg-ot-peregruzki",
//     title: "Синдром выжатого апельсина: как спасти мозг от перегрузки",
//     preview: "Кирилл Иванович Прощаев — доктор медицинских наук, профессор, директор Автономной некоммерческой организации «Научно-исследовательский медицинский центр “Геронтология”». Что так...",
//     image: "/media-s3/articles/6s4bhwezxk88sn2c2gt7xedb11x2d14y.png",
//     date: "2025-02-21",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 203,
//     slug: "sakharnyy-diabet-bolezn-veka-ili-upravlyaemyy-diagnoz",
//     title: "Сахарный диабет: болезнь века или управляемый диагноз?",
//     preview: "Сахарный диабет ежедневно бросает вызов миллионам людей по всему миру. По данным Всемирной организации здравоохранения, за последние 40 лет число людей с диабетом выросло почти ...",
//     image: "/media-s3/articles/ronsjfkr93bqhwgl3ir267m3ds0xx1lp.png",
//     date: "2025-02-21",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 204,
//     slug: "nalet-pristli-na-zubakh-opasnost-ili-esteticheskiy-defekt",
//     title: "Налет Пристли на зубах: опасность или эстетический дефект?",
//     preview: "Многие из нас привыкли считать, что налет на зубах — это просто следствие неправильной гигиены. Однако существуют разновидности налета, которые появляются даже у тех, кто тщател...",
//     image: "/media-s3/articles/ix3ra1c7lj46ccbk1xru7hplxp7yyy0i.png",
//     date: "2025-02-21",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 206,
//     slug: "tekhnologiya-iph-pochemu-peptid-khlorelly-iz-aminobiotikov-daigo-eto-proryv",
//     title: "Технология IPH: почему пептид хлореллы из аминобиотиков Daigo — это прорыв?",
//     preview: "Пептиды, представляющие собой цепочки аминокислот, соединенных пептидными связями, уже давно привлекают внимание ученых и исследователей благодаря их уникальным биологическим св...",
//     image: "/media-s3/articles/ksllutsritxmm3kppai8e76v16ehg6v3.png",
//     date: "2025-02-21",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 208,
//     slug: "pitanie-pri-sakharnom-diabete-2-tipa",
//     title: "Питание при сахарном диабете 2 типа",
//     preview: "По данным ВОЗ, количество людей, страдающих от диабета 2 типа, в начале 2022 насчитывало более 400 миллионов человек. И цифра эта, к сожалению, неуклонно растет.",
//     image: "/media-s3/articles/g2ivgv1gm2gql44cwqxw9uxs2krx6m3z.webp",
//     date: "2024-04-23",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 207,
//     slug: "priznaki-bolezni-pecheni-simptomy-narusheniya-raboty-pecheni",
//     title: "Признаки болезни печени – симптомы нарушения работы печени",
//     preview: "Печень - очень важный орган. Интересно, но она никогда не прекращает свою работу, поэтому «стареет» раньше других органов.",
//     image: "/media-s3/articles/w07wnjij9eiq4djb73w9zbv97tal409n.webp",
//     date: "2024-04-23",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 209,
//     slug: "osobennosti-klimaksa-kak-perezhit-nepriyatnye-proyavleniya",
//     title: "Особенности климакса: как пережить неприятные проявления?",
//     preview: "После 45 лет женский организм начинает претерпевать череду особенных изменений, которые называются менопаузой. Менопауза характеризуется окончательным прекращением менструальног...",
//     image: "/media-s3/articles/25i32855zt4hilbtfjtz5mcckkiyzfk6.webp",
//     date: "2024-04-19",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 210,
//     slug: "dieta-pri-pankreatite",
//     title: "Диета при панкреатите",
//     preview: "Питание напрямую связано с состоянием нашего здоровья, поэтому является инструментом его поддержания. Отсюда следует логичный вывод, что возникновение любых заболеваний требует ...",
//     image: "/media-s3/articles/nzq7vermuetf8cpli2y9utnmcawtsqxu.webp",
//     date: "2024-04-19",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 211,
//     slug: "chto-takoe-biokhaking-i-kak-on-rabotaet",
//     title: "Что такое биохакинг и как он работает?",
//     preview: "Человечество не перестает искать «волшебную» таблетку от всех болезней, желая жить долго и качественно.Однако, даже это желание имеет свойство развиваться и трансформироваться в...",
//     image: "/media-s3/articles/94tk3o8x92n3owgxabfrc6dotlm03qv9.webp",
//     date: "2024-04-15",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 213,
//     slug: "chto-delat-chtoby-ne-nabirat-lishniy-ves-s-vozrastom",
//     title: "Что делать, чтобы не набирать лишний вес с возрастом",
//     preview: "Оставаться если не стройным, то хотя бы без лишних килограммов, хотят многие. Как правило, желание сохраняется и к достижению элегантного возраста, ведь старение зачастую сопров...",
//     image: "/media-s3/articles/2ua6u3co6h18n1nazcjscr8uknh16u02.webp",
//     date: "2024-03-20",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 212,
//     slug: "kak-stat-biokhakerom-i-raskryt-svoy-biologicheskiy-potentsial",
//     title: "Как стать биохакером и раскрыть свой биологический потенциал",
//     preview: "Жить долго и счастливо, как завещают во всех сказках, хочет каждый человек. Именно поэтому медицина и другие науки стараются найти самые действенные методы, с помощью которых мо...",
//     image: "/media-s3/articles/a3pkwdby298pxr8hdfjfevz372sc7015.webp",
//     date: "2024-03-25",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 214,
//     slug: "sukhaya-kozha-tela-prichiny-lechenie-i-profilaktika",
//     title: "Сухая кожа тела: причины, лечение и профилактика",
//     preview: "Знали ли вы, что наша кожа обладает естественными механизмами удержания влаги? У нее имеются сальные железы, которые вырабатывают себум - маслообразный секрет, помогающий сохран...",
//     image: "/media-s3/articles/sclifmdqe3x730338b1ekrcekw237nfz.webp",
//     date: "2024-03-19",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 215,
//     slug: "kak-pobedit-atopicheskiy-dermatit",
//     title: "Как победить атопический дерматит?",
//     preview: "Самый большой орган человеческого организма - кожа. Она выполняет множество важных функций, состоит из нескольких слоев, содержит различные клетки, нервные окончания, сосуды и д...",
//     image: "/media-s3/articles/llqftkp1mgsg6r4r625qepqkuth6le35.webp",
//     date: "2024-03-18",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 217,
//     slug: "nezamenimyy-izoleytsin-istochnik-sily-vynoslivosti-i-zdorovya",
//     title: "Незаменимый изолейцин: источник силы, выносливости и здоровья.",
//     preview: "Поскольку организм не может синтезировать эту аминокислоту самостоятельно, важно получать изолейцин извне. В этой статье разберемся подробнее, какие функции выполняет изолейцин ...",
//     image: "/media-s3/articles/p1bplijxj3d8633umuirrcp7f6f70qf9.jpg",
//     date: "2025-01-17",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 216,
//     slug: "profilaktika-serdechno-sosudistykh-zabolevaniy",
//     title: "Профилактика сердечно-сосудистых заболеваний",
//     preview: "Сердечно-сосудистые заболевания (ССЗ) остаются одной из главных причин смертности в мире, представляя собой серьезную угрозу здоровью человека. Инфаркты, инсульты и артериальная...",
//     image: "/media-s3/articles/m73vak0py85pehxbpf03rzvvlv31nea9.webp",
//     date: "2024-02-21",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 219,
//     slug: "eda-s-umom-kak-gramotno-postroit-svoy-ratsion",
//     title: "Еда с умом: как грамотно построить свой рацион",
//     preview: "Современные исследования подтверждают связь системы питания с риском развития конкретных заболеваний, энергией, продуктивностью и способностью справляться со стрессом. Первые ша...",
//     image: "/media-s3/articles/24ig0fq12bywdm1mdlwxtkhac61io276.jpg",
//     date: "2025-01-15",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 218,
//     slug: "aminokisloty-osnova-zhiznenno-vazhnykh-protsessov-v-organizme",
//     title: "Аминокислоты: основа жизненно важных процессов в организме.",
//     preview: "Когда речь заходит о здоровье, восстановлении и правильном питании, мы часто слышим о важности белков. Однако за кулисами этого процесса стоят аминокислоты — незаменимые участни...",
//     image: "/media-s3/articles/u0u3usawptw1sjx9j5kkoogw01k9mhe3.jpg",
//     date: "2025-01-15",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 222,
//     slug: "peptidy-chto-eto-takoe-i-chem-oni-polezny",
//     title: "Пептиды: что это такое и чем они полезны?",
//     preview: "Что нужно знать про пептидах? Пептиды – это короткие цепочки аминокислот, связанных между собой.",
//     image: "/media-s3/articles/sb1sf88egzrdmjf8z9vmn197hze83n0f.webp",
//     date: "2025-01-09",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 220,
//     slug: "peptid-khlorelly-prirodnyy-istochnik-zdorovya-i-molodosti",
//     title: "Пептид хлореллы: природный источник здоровья и молодости",
//     preview: "Современная наука активно изучает натуральные компоненты, которые могут поддерживать здоровье и замедлять процессы старения. Одним из таких перспективных веществ является пептид...",
//     image: "/media-s3/articles/s2pwieg5lf32magymdozkpzr76599sr7.jpg",
//     date: "2025-01-14",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 223,
//     slug: "boksy-zdorovya-nabory-dlya-kompleksnoy-podderzhki-vas-i-vashikh-blizkikh",
//     title: "Боксы здоровья: наборы для комплексной поддержки вас и ваших близких!",
//     preview: "В каждой сфере жизни, будь то работа, спорт или забота о красоте и молодости, важно получать ощутимую поддержку, которая помогает достигать необходимых целей. Для этого мы созда...",
//     image: "/media-s3/articles/q69abggkek31pjsezbgk2ssb0kzcfqs9.png",
//     date: "2024-12-18",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 224,
//     slug: "mozg-sustavy-i-kozha-otkryty-prodazhi-novykh-produktov-ot-brenda-daigo-",
//     title: "Мозг, суставы и кожа: открыты продажи новых продуктов от бренда Daigo!",
//     preview: "Мы знаем, что может помочь правильно управлять здоровьем на протяжении всей жизни - пептидная регуляция! Счастливы сообщить, что были созданы три абсолютно новых продукта в мире...",
//     image: "/media-s3/articles/q1ppifn0sotq026iiayzrrknu31oxl8u.png",
//     date: "2024-12-13",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 221,
//     slug: "sovershennaya-kozha-v-lyubom-vozraste-put-ot-vnutrennego-k-vneshnemu",
//     title: "Совершенная кожа в любом возрасте: путь от внутреннего к внешнему",
//     preview: "Кожа — орган, выполняющий важные функции для здоровья. Основные из них — барьерная и защитная.",
//     image: "/media-s3/articles/za9112bihisdnafjp6u5cvtid2wpzagb.jpg",
//     date: "2025-01-13",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 225,
//     slug: "mikrobiom-sovremennogo-cheloveka-glavnye-ugrozy-ikh-posledstviya-i-strategii-vosstanovleniya",
//     title: "Микробиом современного человека: главные угрозы, их последствия и стратегии восстановления.",
//     preview: "XX и XXI века стали эпохой стремительных изменений, не только для технологий и общества, но и для биологии человека. Одним из самых серьёзных последствий этих перемен стало разр...",
//     image: "/media-s3/articles/28dyaz4y9470m18hznrhh5g81r605auh.png",
//     date: "2024-12-13",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 226,
//     slug: "darim-daigo-lux-pri-pokupke-dvukh-tamotsu-do-12-dekabrya-prednovogodniy-syurpriz-dlya-vashego-zdorov",
//     title: "Дарим Daigo Lux при покупке двух Tamotsu до 12 декабря: предновогодний сюрприз для вашего здоровья!",
//     preview: "Хотите улучшить когнитивные способности, точно мыслить, запоминать информацию мгновенно, при этом не иметь проблем с ЖКТ и быть максимально продуктивным? Чтобы это стало реально...",
//     image: "/media-s3/articles/9m5tun67z63gf7pgz1tq27tmijyny4hq.webp",
//     date: "2024-12-06",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 227,
//     slug: "7-not-zdorovya-ot-natalii-gorn",
//     title: "7 нот здоровья от Наталии Горн",
//     preview: "Наталию Горн (@dr.nataliya_gorn) знают как врача общей практики, специалиста по стресс-менеджменту, health-коуча, anti-age-терапевта и автора семинаров о нутриентах, витаминах и...",
//     image: "/media-s3/articles/6y08lpqpz97e0ww99hnp47kn07gzbq7x.webp",
//     date: "2023-08-10",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 230,
//     slug: "kak-ponyat-chto-s-mikrofloroy-kishechnika-ne-vse-v-poryadke",
//     title: "Как понять, что с микрофлорой кишечника не все в порядке?",
//     preview: "к.м.н. Марат Зиннатуллин Врач-гастроэнтеролог.",
//     image: "/media-s3/articles/vpbo0ggfyd1h4l2k8uya28rn8atjvcbt.webp",
//     date: "2023-08-07",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 228,
//     slug: "disbioz-kishechnika-prichina-neeffektivnosti-kvarteta-zdorovya-d-m-n-zhilenko-marina-ivanovna",
//     title: "Дисбиоз кишечника. Причина неэффективности квартета здоровья. д.м.н Жиленко Марина Ивановна",
//     preview: "Жиленко Марина Ивановна д.м.н., гинеколог, заведующая отделением гинекологии Клиники Профессора Калинченко (Москва, Россия)",
//     image: "/media-s3/articles/k0vrddz8u032xlpi30qnd75mcpzyp6gq.webp",
//     date: "2023-08-09",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 231,
//     slug: "bronkhialnaya-astma-ba-prichiny-simptomy-",
//     title: "Бронхиальная астма (БА), причины, симптомы",
//     preview: "Бронхиальная астма (БА) – это воспалительное заболевание дыхательных путей, которое может быть вызвано различными факторами и проявляющееся бронхоспазмом (удушьем). Данное забол...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-06",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 229,
//     slug: "rol-poleznykh-bakteriy",
//     title: "Роль «полезных» бактерий",
//     preview: "В 1949 году Казуоши Масагаки выступил в Палате представителей Японии с лекцией о роли «полезных» бактерий в жизни человека, о последних исследованиях и достижениях в этой област...",
//     image: "/media-s3/articles/r3ptbuc0cmz1yclluumjqodn5ny99vrx.webp",
//     date: "2023-08-08",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 232,
//     slug: "chto-takoe-metabiotiki",
//     title: "Что такое Метабиотики",
//     preview: "Метабиотики — будущее вашего здоровья: новая эпоха биотехнологий Метабиотики — это новейший класс функциональных добавок, которые не содержат живые микроорганизмы, а их метаболи...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-05",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 234,
//     slug: "personalnyy-mikrobiom-ego-vliyanie-na-sostoyanie-zdorovya-i-starenie",
//     title: "Персональный микробиом, его влияние на состояние здоровья и старение",
//     preview: "Гладских Лариса Валентиновна Доктор фармацевтических наук, академик Российской академии медико-технических наук (РАМТН), генеральный директор российской фармацевтической компани...",
//     image: "/media-s3/articles/3gtfyti17is8fqkytdto7qdvqtoo0t22.webp",
//     date: "2023-08-03",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 233,
//     slug: "pechen-i-detoks",
//     title: "Печень и детокс",
//     preview: "Разбираемся с токсинами В последнее время теме детоксикации уделяется очень много внимания, можно встретить курсы детокса с различными соками или травами, лечебные детокс спа-пр...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-04",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 235,
//     slug: "zdorovyy-kishechnik-zalog-zdorovya-i-dolgoletiya-cheloveka",
//     title: "Здоровый кишечник залог здоровья и долголетия человека",
//     preview: "Для того чтобы продлить свою жизнь, прежде всего нужно заботиться о здоровье кишечника и о здоровом балансе его микрофлоры. Длина нашего кишечника, важно органа пищеварительной ...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-02",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 236,
//     slug: "dieta-pri-spaechnoy-bolezni-kishechnika",
//     title: "Диета при спаечной болезни кишечника",
//     preview: "Спайки — это образования, которые создаются из соединительной ткани, склеивая оболочки внутренних органов. Они бывают чаще после операции, но встречаются и при болезнях (в том ч...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-01",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 238,
//     slug: "kak-svyazany-stress-i-immunitet",
//     title: "Как связаны стресс и иммунитет",
//     preview: "Крепкая иммунная система - залог качественной жизни. Именно она способна отразить угрозу или обеспечить бессимптомное протекание болезни, а также отсутствие осложнений после нее.",
//     image: "/media-s3/articles/ouuvigozdhnxczoaufsr8jlnll4soudz.webp",
//     date: "2024-05-31",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 239,
//     slug: "kak-stress-vliyaet-na-uroven-sakhara-v-krovi",
//     title: "Как стресс влияет на уровень сахара в крови?",
//     preview: "Может ли подняться сахар в крови на нервной почве у здорового человека? Именно так мы хотим начать эту статью, чтобы сразу обозначить столь важную тему.",
//     image: "/media-s3/articles/1yp2ovd6b1jldjmzlo676mfdk71ax8gy.webp",
//     date: "2024-05-31",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 237,
//     slug: "poleznye-produkty-dlya-kishechnika-s-probiotikami",
//     title: "Полезные продукты для кишечника с пробиотиками",
//     preview: "Почти 100 лет назад было выявлено, что для микрофлоры полезны пробиотические продукты. Они содержат в себе «хорошие» бактерии.",
//     image: "/media-s3/articles/f7k200by2sqea932db7689cdp4krlvdm.webp",
//     date: "2024-05-31",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 240,
//     slug: "kak-poteryat-ves-i-pochemu-diety-nedostatochno-effektivny",
//     title: "Как потерять вес, и почему диеты недостаточно эффективны",
//     preview: "Даже в период расцвета творчества Рубенса были женщины, мечтающие о стройном теле. Мысли о том, из-за чего не получается похудеть, или почему таблетки для похудения не помогают,...",
//     image: "/media-s3/articles/v00n80wtkxvop0pyluhup3atwdbur6uw.webp",
//     date: "2024-05-31",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 242,
//     slug: "bronkhialnaya-astma-ili-bronkhit-simptomy-diagnostika",
//     title: "Бронхиальная астма или бронхит: симптомы, диагностика",
//     preview: "Легкие - важнейший орган в нашем организме. К сожалению, они часто находятся «под ударом», так как рискуют быть атакованы вирусами или осложнениями от других заболеваний.",
//     image: "/media-s3/articles/uvlkjbz2d4vui01ccqg5n3o9d5k6207c.webp",
//     date: "2024-05-14",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 241,
//     slug: "kak-otlichit-pochechnye-oteki-ot-drugikh",
//     title: "Как отличить почечные отеки от других",
//     preview: "Есть ли в вашем окружении те, кто боится пить воду по вечерам или съесть кусочек чего-то соленого, чтобы не получить надутое лицо на утро? Проблема отечности беспокоит большое к...",
//     image: "/media-s3/articles/ztwdxyghp4gc0p1ia70oge1kacc3h1mr.webp",
//     date: "2024-05-20",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 243,
//     slug: "zashchita-pecheni-pri-prieme-lekarstv",
//     title: "Защита печени при приеме лекарств",
//     preview: "Печень - это наш фильтр. Через нее проходит все, что мы едим и пьем: она обезвреживает и выводит вредные вещества, защищая от них организм.",
//     image: "/media-s3/articles/90eh9ttw3wk3ubysiuu68n5cc46lcjfx.webp",
//     date: "2024-05-14",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 244,
//     slug: "norma-vypadeniya-volos-skolko-volos-dolzhno-vypadat-v-den",
//     title: "Норма выпадения волос: сколько волос должно выпадать в день?",
//     preview: "Красивые волосы - удел мечтаний многих, причем, совсем не стоит делать гендерных различий. Согласитесь, вряд ли кто-то откажется от густых, сияющих, здоровых волос.",
//     image: "/media-s3/articles/ii2ktm8z33k3nb1b82dgets51b7qmil0.webp",
//     date: "2024-05-14",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 245,
//     slug: "kak-stress-vliyaet-na-mozg",
//     title: "Как стресс влияет на мозг?",
//     preview: "Самое ценное, что есть у человека, - это разум. Только после него идет здоровое тело.",
//     image: "/media-s3/articles/0p24s0up3hzwb82fmxt5nqqd27j56etg.webp",
//     date: "2024-05-14",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 247,
//     slug: "preventivnaya-meditsina-vklad-v-zdorove-i-dolgoletie",
//     title: "Превентивная медицина: вклад в здоровье и долголетие",
//     preview: "Превентивная медицина — это одно из направлений современной медицины, главной задачей которого является сохранение хорошего самочувствия пациентов, повышение продуктивности и ул...",
//     image: "/media-s3/articles/9d0q6tbod2dj6zeamedoifzfvayj72uv.png",
//     date: "2025-01-27",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 246,
//     slug: "kak-vernut-appetit-i-nabrat-ves-posle-stressa",
//     title: "Как вернуть аппетит и набрать вес после стресса",
//     preview: "В то время, как одни люди не могут усмирить свой аппетит при любой нервной ситуации, другие не знают, как набрать вес после стресса. Оказывается, стресс и аппетит действительно ...",
//     image: "/media-s3/articles/5x0yhhar8k4pb9odi1ju2dcw4uta6wrj.webp",
//     date: "2024-04-23",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 249,
//     slug: "psoriaz-pravda-i-mify-o-lechenii",
//     title: "Псориаз: правда и мифы о лечении",
//     preview: "В этой статье, опираясь на экспертное мнение врача-дерматолога Юлии Галлямовой, мы детально разберем основные аспекты псориаза: от симптомов и причин до современных терапевтичес...",
//     image: "/media-s3/articles/sqlhvxe5rhl5wn9g8hpgqi14c5rs0tb0.png",
//     date: "2025-01-24",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 248,
//     slug: "kogda-myshtsy-slabeyut-chto-nuzhno-znat-o-sarkopenii",
//     title: "Когда мышцы слабеют: что нужно знать о саркопении?",
//     preview: "С возрастом многие сталкиваются с проблемой, о которой редко задумываются заранее — потерей мышечной массы и силы. Это явление носит название саркопения и представляет собой сер...",
//     image: "/media-s3/articles/r1apo7m4y7ogllz56541hsmcb3ik6ofh.png",
//     date: "2025-01-24",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 250,
//     slug: "daigo-pomoshchnik-vracha-realnye-keysy-primeneniya-",
//     title: "«Daigo — помощник врача: реальные кейсы применения»",
//     preview: "Как сохранить здоровье кишечника в путешествиях? В другой стране или городе состав воды и пищи отличаются от привычных нам, что негативно влияет на микробиоту.",
//     image: "/media-s3/articles/6nl4dvnp1wfvj6gbx24cydkr112y8edl.jpg",
//     date: "2025-01-22",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 251,
//     slug: "sekrety-arginina-kak-aminokislota-uluchshaet-zdorove",
//     title: "Секреты аргинина: как аминокислота улучшает здоровье?",
//     preview: "Эта аминокислота играет ключевую роль во множестве процессов нашего организма, начиная от выработки энергии и заканчивая поддержанием здоровья сердца. Где взять достаточное коли...",
//     image: "/media-s3/articles/983l30h6htbckxaxq3gl59r277xml983.jpg",
//     date: "2025-01-22",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 252,
//     slug: "mozg-myshtsy-i-immunitet-rol-glutaminovoy-kisloty-v-nashem-organizme",
//     title: "Мозг, мышцы и иммунитет: роль глутаминовой кислоты в нашем организме.",
//     preview: "Представьте, что в вашем организме есть маленький, но невероятно важный «дирижёр», который помогает мозгу быстро думать, мышцам эффективно восстанавливаться, а всему телу остава...",
//     image: "/media-s3/articles/evmycv1snrlzss8sxjkny1ktq4lwoeun.jpg",
//     date: "2025-01-22",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 254,
//     slug: "osteoartrit-pochemu-bolyat-sustavy-i-kak-etogo-izbezhat",
//     title: "Остеоартрит: почему болят суставы и как этого избежать?",
//     preview: "Боль и скованность в суставах — проблемы, с которыми сталкивается почти каждый человек, особенно с возрастом. Но что, если эти неприятные ощущения становятся постоянными и мешаю...",
//     image: "/media-s3/articles/3764fagsg6av8rqiu1bppiieupp1k8v3.jpg",
//     date: "2025-01-17",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 253,
//     slug: "sila-leytsina-kak-aminokislota-podderzhivaet-telo-i-um",
//     title: "Сила лейцина: как аминокислота поддерживает тело и ум",
//     preview: "Например, аминокислота лейцин является ключевым элементом в том, чтобы наше тело оставалось сильным, выносливым и активным. Лейцин — это не просто аминокислота, а ключ к здоровь...",
//     image: "/media-s3/articles/vq7qlz5j27hc79frw81fw1ytgnd0zt3u.jpg",
//     date: "2025-01-22",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 255,
//     slug: "khrupkie-kosti-kak-pobedit-osteoporoz-i-zhit-aktivno",
//     title: "Хрупкие кости: как победить остеопороз и жить активно?",
//     preview: "Представьте себе, что ваши кости — это крепкий каркас, который поддерживает все тело и позволяет вам двигаться, прыгать, танцевать и заниматься повседневными делами. Но что, есл...",
//     image: "/media-s3/articles/01v0r7etl35vikiiqxlpdoogr4c5ikov.jpg",
//     date: "2025-01-17",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 257,
//     slug: "profilaktika-parkinsona-sovety-kak-predotvratit-razvitie-bolezni",
//     title: "Забота о будущем: Как предотвратить болезнь Паркинсона с помощью эффективных мер профилактики?",
//     preview: "Болезнь Паркинсона — это хроническое нейродегенеративное заболевание. Оно характеризуется ухудшением контроля над мышцами, дрожанием, замедлением движений и другими симптомами.",
//     image: "/media-s3/articles/63qw18161irhjnhpq72pcsniylke0r47.webp",
//     date: "2023-11-28",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 256,
//     slug: "pravila-kotorye-dolzhen-znat-kazhdyy-sovety-nutritsiologa",
//     title: "Правила, которые должен знать каждый: советы нутрициолога",
//     preview: "Правило №1. Сон Возможно, Вы удивитесь, но Ваш вклад в здоровье ЖКТ начинается не с первого приема пищи, а с правильного режима сна.",
//     image: "/media-s3/articles/kfi4z0mar2ba6ustqnf9uujakoqnbkus.jpg",
//     date: "2025-01-17",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 258,
//     slug: "kak-antibiotiki-vliyayut-na-mikrofloru-kishechnika",
//     title: "Как антибиотики влияют на микрофлору кишечника",
//     preview: "Антибиотики являются мощным средством в борьбе с бактериальными инфекциями. Однако, вмешательство в мир бактерий не ограничивается только воздействием на патогенные микроорганизмы.",
//     image: "/media-s3/articles/t7ru4fhwapxfo8qnwlxxy3uvowlfgov2.webp",
//     date: "2023-11-15",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 260,
//     slug: "slizistaya-obolochka-kishechnika",
//     title: "Слизистая оболочка кишечника",
//     preview: "Слизистая оболочка является основным интерфейсом взаимодействия между всем, что находится внутри нашего кишечниках, и системами нашего тела. Слизистая от носа до ануса образовал...",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-17",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 259,
//     slug: "kak-ukrepit-immunitet-vzroslomu-cheloveku",
//     title: "Как поднять иммунитет взрослому человеку",
//     preview: "С наступлением осени, помимо тоски о том, что лето подошло к концу, наступает также беспокойство по поводу приближения самого подверженного простудам сезона. По данным статистик...",
//     image: "/media-s3/articles/wc9vainnu27amyyoqd0lt9ck47cy4mvo.webp",
//     date: "2023-11-15",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 262,
//     slug: "dieta-pri-zabolevaniyakh-kishechnika-so-vzdutiem",
//     title: "Диета при заболеваниях кишечника со вздутием",
//     preview: "При вздутии живота и болях в кишечнике диета может значительно снять дискомфорт. Часто от боли и метеоризма страдают из-за привычек в питании.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-08-15",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 261,
//     slug: "patogennaya-mikroflora-mozhet-vozvrashchatsya-esli-nepravilno-ot-nee-izbavlyatsya",
//     title: "Патогенная микрофлора может возвращаться, если неправильно от нее избавляться!",
//     preview: "Когда плохих бактерий в нашем кишечнике становится больше, чем хороших, то прием антибиотиков может убить микробиоту. Убить, но не избавить от проблемы!",
//     image: "/media-s3/articles/huz85iabjf8krfujyrspvg6x2mr0zlrp.webp",
//     date: "2023-08-16",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 263,
//     slug: "vagus-ili-bluzhdayushchiy-nerv",
//     title: "Вагус или блуждающий нерв",
//     preview: "Современный человек знает про стресс не понаслышке, но с точки зрения организма стресс это всего лишь состояние, в котором все тело мобилизуется для преодоления вызова. Стресс п...",
//     image: "/media-s3/articles/k1swwbj9kq8xpo3gvq6p1vj5ag6pvhpu.webp",
//     date: "2023-08-14",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 264,
//     slug: "https-www-youtube-com-watch-v-t9x6eymza88",
//     title: "День открытых дверей в клинике МЕДСИ",
//     preview: "",
//     image: "/media-s3/articles/k82ir52s8ikfw57raqah2i87t2z5kv52.webp",
//     date: "2023-08-13",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 266,
//     slug: "rol-produktov-funktsionalnogo-pitaniya-metabiotiki-v-sokhranenii-aktivnogo-dolgoletiya",
//     title: "Роль продуктов функционального питания. Метабиотики в сохранении активного долголетия.",
//     preview: "Шендеров Борис Аркадьевич Доктор медицинских наук, профессор, главный научный сотрудник ФГБУ «Центр стратегического планирования и управления медико-биологическими рисками здоро...",
//     image: "/media-s3/articles/8gq0qn8f3roiiimgcn1emswodng6tgtm.webp",
//     date: "2023-08-11",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 265,
//     slug: "bakterii-stroynosti",
//     title: "Бактерии стройности",
//     preview: "Диеты, тренировки, ограничения… Стремление к красивому стройному телу, оказывается, связано с качественным составом вашей микрофлоры!\\ud83d\\ude31 Знакомьтесь, Аккермансия и Крис...",
//     image: "/media-s3/articles/mwjhl9gw0qmyk3px66tmat9uromec3ji.webp",
//     date: "2023-08-12",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 267,
//     slug: "sovremennyy-vzglyad-na-khronicheskoe-vospalenie",
//     title: "Современный взгляд на хроническое воспаление",
//     preview: "Воспаление лишь в 21 веке стало обсуждаться как одна из основных причин большого количества неинфекционных заболеваний. Раньше доктора считали, что воспаление это характерная че...",
//     image: "/media-s3/articles/cwvimh55kuumra2gs1mhyym2jl3dr3gv.webp",
//     date: "2023-07-19",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 268,
//     slug: "beremennost-i-rody-uchenyy-dmitriy-alekseev",
//     title: "Беременность и роды - ученый Дмитрий Алексеев",
//     preview: "",
//     image: "/media-s3/articles/jy19yviekua343zutk0tfieu5u2galzd.webp",
//     date: "2023-07-18",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 269,
//     slug: "i-i-mechnikov-i-ego-teoriya-dolgoletiya",
//     title: "И.И. Мечников и его «Теория долголетия»",
//     preview: "Мечников Илья Ильич Русский и французский биолог (микробиолог, цитолог, эмбриолог, иммунолог, физиолог и патолог). Лауреат Нобелевской премии в области физиологии и медицины (19...",
//     image: "/media-s3/articles/7t59vhta8knivrj79b0fmftxvo9bf1uw.webp",
//     date: "2023-07-17",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 270,
//     slug: "kakie-sushchestvuyut-printsipy-korrektsii-i-podderzhki-mikroflory-kishechnika",
//     title: "Какие существуют принципы коррекции и поддержки микрофлоры кишечника?",
//     preview: "к.м.н. Марат Зиннатуллин Врач-гастроэнтеролог.",
//     image: "/media-s3/articles/hod4wzi7ksrenkria2u2y627idkio5uk.webp",
//     date: "2023-07-16",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 272,
//     slug: "sindrom-razdrazhennogo-kishechnika-srk-chto-eto",
//     title: "Синдром раздраженного кишечника (СРК) - что это?",
//     preview: "Синдром раздраженного кишечника (СРК) - это комплекс симптомов функциональных нарушений пищеварения в кишечнике. СРК относится к распространенным заболеваниям – около 15-30% люд...",
//     image: "/media-s3/articles/iuy5wxlu8p1qy3v2xhbdosnh1mrtohep.webp",
//     date: "2023-07-14",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 273,
//     slug: "diagnostika-disbioza-i-puti-korrektsii-mikrobnogo-sostava-polosti-rta-shevchenko-o-v",
//     title: "Диагностика дисбиоза и пути коррекции микробного состава полости рта. Шевченко О. В",
//     preview: "Шевченко Олесь Вячеславович Научный сотрудник отдела профилактики ФГБУ «ЦНИИСиЧЛХ», Вице-Президент Профессионального общества гигиенистов стоматологических, Председатель секции ...",
//     image: "/media-s3/articles/2wqs39dvr2zahe0a5rh9ha6pf8ap6xsx.webp",
//     date: "2023-07-13",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 274,
//     slug: "chto-takoe-mikrobiota-mikrobom",
//     title: "Что такое микробиота? Микробом.",
//     preview: "Хаммад Екатерина Викторовна к.м.н, терапевт, гастроэнтеролог, врач высшей категории, заведующая отделением терапии № 2 ФГАУ \"Лечебно-реабилитационный центр\" Минздрава РФ",
//     image: "/media-s3/articles/981qg6c45aor7njkwhnle9iyl2bnkkg1.webp",
//     date: "2023-07-12",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 271,
//     slug: "probiotiki-prebiotiki-sinbiotiki-i-metabiotiki-prostymi-slovami",
//     title: "Пробиотики, пребиотики, синбиотики и метабиотики простыми словами",
//     preview: "Пробиотики, пребиотики и метабиотики – простыми словами Эксперт по продукту Дайго – Елена Лебедева Как работает жкт ? Каков состав вашей микрофлоры ?",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-15",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "metabiotiki"
//     }
//   },
//   {
//     id: 275,
//     slug: "faringit-u-vzroslykh-simptomy-i-lechenie",
//     title: "Фарингит у взрослых: симптомы и лечение​",
//     preview: "Достаточно часто взрослые люди с наступлением холодов сталкиваются с сезонными заболеваниями. Одним из наиболее распространенных недугов являются фарингиты острой, хронической ф...",
//     image: "/media-s3/articles/bi9a1xd76mo2f3r2lq77ep6icyqmep2q.webp",
//     date: "2023-07-11",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 276,
//     slug: "problema-est-a-diagnoza-net-eto-o-sindrome-dyryavogo-kishechnika-",
//     title: "Проблема есть, а диагноза нет. Это о синдроме \"дырявого кишечника\".",
//     preview: "Еще несколько лет назад над врачами, которые о нем говорили, откровенно смеялись. А многие до сих пор называют синдром \"дырявого кишечника\" выдумкой\\ud83d\\ude27.",
//     image: "/media-s3/articles/qxva37ergmc6y2gk2dh9gpn6ul7cvt54.webp",
//     date: "2023-07-10",
//     time: 1,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 277,
//     slug: "perkhot-zud-vypadenie-volos-fokus-vnimaniya-na-mikrobiom-kozhi-golovy",
//     title: "Перхоть, зуд, выпадение волос: фокус внимания на микробиом кожи головы!",
//     preview: "Мы часто задумываемся о том, как ухаживать за волосами, выбираем шампуни, маски и кондиционеры, но редко обращаем внимание на то, что стоит в самом центре здоровья наших волос. ...",
//     image: "/media-s3/articles/ezga2l2sq35kchok6f89oncb2alhevd2.jpg",
//     date: "2025-02-12",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 278,
//     slug: "pochemu-vazhen-dlitelnyy-priem-daigo-rasskazyvaem-poetapno-kak-uluchshaetsya-zdorove-",
//     title: "Почему важен длительный прием Daigo: рассказываем поэтапно, как улучшается здоровье.",
//     preview: "В современном мире, где фармацевтические препараты часто предлагают быстрое, но кратковременное решение проблем со здоровьем, все больше людей обращают внимание на натуральные д...",
//     image: "/media-s3/articles/gi781102k9961wkctzpjsxkhk94atoa6.jpg",
//     date: "2025-02-12",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 279,
//     slug: "otkrytie-novogo-trenda-meditsiny-dolgoletiya-aminobiotiki-ot-daigo",
//     title: "Открытие нового тренда медицины долголетия - аминобиотики от Daigo",
//     preview: "7 февраля, в отеле The Carlton Moscow, состоялась презентация новых продуктов премиального бренда Daigo, который уже более 12 лет представляет на Российском рынке натуральные до...",
//     image: "/media-s3/articles/b8akt4102cnzg4r0s6865vr1rxe4n4k3.jpg",
//     date: "2025-02-11",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 282,
//     slug: "kogda-telo-krichit-o-pomoshchi-chto-takoe-fibromialgiya",
//     title: "Когда тело кричит о помощи: что такое фибромиалгия?",
//     preview: "Человеческий организм — это удивительная система, в которой до сих пор много неизученного. Иногда проблемы со здоровьем проявляются так, что даже врачи разводят руками: анализы ...",
//     image: "/media-s3/articles/o277hp8ncw1li92hwuymz6116cmkdw25.png",
//     date: "2025-02-03",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 281,
//     slug: "nauka-o-mozge-i-pitanii-chto-nuzhno-znat-o-neyrodietologii",
//     title: "Наука о мозге и питании: что нужно знать о нейродиетологии?",
//     preview: "Современная наука все чаще подтверждает, что питание не только обеспечивает наше тело энергией, но и играет ключевую роль в поддержании здоровья мозга и психики. Нейродиетология...",
//     image: "/media-s3/articles/hib3u871thu4ikgqip91zombma7owhf4.png",
//     date: "2025-02-03",
//     time: 7,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 280,
//     slug: "autizm-i-zdorove-kishechnika-realnye-istorii-i-mnenie-eksperta",
//     title: "Аутизм и здоровье кишечника: реальные истории и мнение эксперта",
//     preview: "Елена Валерьевна Доскина — врач-эндокринолог высшей категории, кандидат медицинских наук, доцент кафедры эндокринологии РМАНПО, обладатель статуса «Московский врач». Алина Ахмет...",
//     image: "/media-s3/articles/2428cwsef55098b0fmlgfsyzo17e1nod.png",
//     date: "2025-02-03",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 284,
//     slug: "sekret-molodosti-mozga-vazhnyy-neyroprotektor-kotoryy-vy-upuskaete",
//     title: "Секрет молодости мозга - важный нейропротектор, который Вы упускаете!",
//     preview: "Современный ритм жизни, стрессы и возрастные изменения сильно влияют на здоровье мозга. Чтобы сохранить ясный ум, хорошую память и когнитивные функции, важно своевременно поддер...",
//     image: "/media-s3/articles/yj2122l5q05yn2d6q2nedw632r14mot6.jpg",
//     date: "2025-01-31",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 283,
//     slug: "ozhirenie-ne-prigovor-kak-vernut-zdorove-i-kachestvo-zhizni",
//     title: "Ожирение — не приговор: как вернуть здоровье и качество жизни?",
//     preview: "Ожирение — это не просто цифры на весах или лишние сантиметры на талии. Это сложное заболевание, которое давно перестало быть индивидуальной проблемой и превратилось в глобальну...",
//     image: "/media-s3/articles/xs42iqc1oar8fuhwcqlvm1kfd6om91l2.png",
//     date: "2025-02-03",
//     time: 8,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 285,
//     slug: "sovety-ot-vracha-reproduktologa-zdorovaya-beremennost-i-mikrobiom",
//     title: "Советы от врача репродуктолога: здоровая беременность и микробиом",
//     preview: "Рождение ребенка – это и чудо, и важная задача, требующая от будущей мамы осознанного подхода к себе, так как процесс вынашивания влечёт за собой глубокие изменения в её организ...",
//     image: "/media-s3/articles/nj4a6ld5413qsfdji0szuiw2n7btg0lj.png",
//     date: "2025-01-29",
//     time: 6,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 287,
//     slug: "kak-vosstanovit-mikrobiotu-kishechnika",
//     title: "Как восстановить микробиоту кишечника",
//     preview: "Микробиота кишечника - это совокупность микроорганизмов, преимущественно бактерий, населяющих кишечник человека. Данное микробное сообщество играет важную роль в поддержании общ...",
//     image: "/media-s3/articles/s2n60nfypwmjsmdp4z2bqu71zgm9pyhu.webp",
//     date: "2024-02-21",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 288,
//     slug: "kak-mikroflora-kishechnika-vliyaet-na-immunitet",
//     title: "Как микрофлора кишечника влияет на иммунитет",
//     preview: "Кишечник обычно ассоциируется с процессами пищеварения, но оказывается, он является ключевым игроком в сложной системе человеческого иммунитета. Этот удивительный орган обладает...",
//     image: "/media-s3/articles/yot349iuaena0yvl9h7vc4aurp0fidgg.webp",
//     date: "2024-02-20",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 286,
//     slug: "biorevitalizatsiya-kak-vernut-kozhe-siyanie-i-uprugost",
//     title: "Биоревитализация: как вернуть коже сияние и упругость?",
//     preview: "В современном мире технологий и инноваций, когда возможности красоты и здоровья расширяются с каждым годом, старение больше не воспринимается как неизбежность. Сегодня у нас ест...",
//     image: "/media-s3/articles/0j9dildrkjh2h3cqid0w0shb00tx8iwi.png",
//     date: "2025-01-27",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 289,
//     slug: "kak-izbavitsya-ot-zapakha-izo-rta",
//     title: "Как избавиться от запаха изо рта",
//     preview: "Неприятный запах изо рта, или галитоз, является распространенной проблемой, с которой сталкиваются многие люди. Этот симптом вызывает дискомфорт и неудобство, негативно сказывае...",
//     image: "/media-s3/articles/fsznddl3s5d1if8xcflav5e6n25nwfc1.webp",
//     date: "2024-02-19",
//     time: 3,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 291,
//     slug: "probiotiki-dlya-kishechnika-pri-meteorizme",
//     title: "Метабиотики для кишечника при метеоризме",
//     preview: "Состояние, при котором в желудочно-кишечном тракте накапливаются и образуются избыточные количества газов называется «метеоризм». Он может сопровождаться ощущением вздутия и дис...",
//     image: "/media-s3/articles/dwtswpdy8pvwv0k2k2qpcpxsxt6812td.webp",
//     date: "2023-12-29",
//     time: 2,
//     views: 0,
//     comments: 0,
//     properties: {
//       napravlennost: "kishechnik-i-immunitet"
//     }
//   },
//   {
//     id: 292,
//     slug: "profilaktika-povysheniya-arterialnogo-davleniya",
//     title: "Профилактика повышения артериального давления",
//     preview: "Сердечно-сосудистые заболевания являются одной из наиболее распространенных и серьезных проблем в мире здравоохранения. К сожалению, нередко они становятся причиной значительног...",
//     image: "/media-s3/articles/08ej36dd8r6vbbvdcux8hsn77uo11443.webp",
//     date: "2023-12-29",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 290,
//     slug: "probiotiki-dlya-vosstanovleniya-mikroflory-polosti-rta",
//     title: "Пробиотики для восстановления микрофлоры полости рта",
//     preview: "Абсолютная норма, что в нашей ротовой полости живет огромное количество разных микроорганизмов, среди которых есть условно-патогенные и патогенные. Однако, когда они преобладают...",
//     image: "/media-s3/articles/udetp86fmvjbd4nntboknll9dtoq6y98.webp",
//     date: "2024-02-18",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 293,
//     slug: "kak-predotvratit-bolezn-altsgeymera",
//     title: "Как предотвратить болезнь Альцгеймера?",
//     preview: "В связи с увеличением средней продолжительности жизни и числа пожилых людей, значительно возросло количество населения, страдающего болезнью Альцгеймера. Это хроническое нейроде...",
//     image: "/media-s3/articles/vi8p7g8ld2jfe2lbw5oxz25buscrkq1t.webp",
//     date: "2023-12-19",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 294,
//     slug: "dieta-pri-infektsii-helicobacter-pylori",
//     title: "Диета при инфекции Helicobacter pylori",
//     preview: "Соблюдение диеты при заболеваниях желудочно-кишечного тракта (ЖКТ) играет ключевую роль в процессе лечения и поддержания здоровья. Специально подобранный рацион питания снижает ...",
//     image: "/media-s3/articles/9wcg18c83ptpy0c5s1e55djsng5l0j2x.webp",
//     date: "2023-12-19",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 295,
//     slug: "kak-uskorit-vosstanovlenie-posle-travmy",
//     title: "Как ускорить восстановление после травмы?",
//     preview: "Наш организм - это совершенная система с большим количеством взаимосвязанных процессов, однако, это не исключает необходимости относиться к нему бережно и оказывать всяческую по...",
//     image: "/media-s3/articles/rf5gozt0alaqi5de1w0eu1bgoaww7ksv.webp",
//     date: "2023-12-18",
//     time: 4,
//     views: 0,
//     comments: 0,
//     properties: {}
//   },
//   {
//     id: 296,
//     slug: "klyuchevye-printsipy-diety-pri-ateroskleroze-sosudov-golovnogo-mozga",
//     title: "Ключевые принципы диеты при атеросклерозе сосудов головного мозга",
//     preview: "Внутри каждого из нас сосуды неустанно работают, обеспечивая постоянный поток кислорода и питательных веществ в самый важный орган — мозг. Сосуды головного мозга играют решающую...",
//     image: "/media-s3/articles/obz64sp7qycxhuuh4k363hnnfgyoq2i2.webp",
//     date: "2023-11-28",
//     time: 5,
//     views: 0,
//     comments: 0,
//     properties: {}
//   }

//   // {
//   //   id: 2,
//   //   slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu',
//   //   title: 'Как подготовить кожу к пляжному сезону?',
//   //   preview: 'Красота изнутри: как подготовить кожу за пару недель?',
//   //   image: '/images/articles/sec.jpg',
//   //   date: '2025-06-24',
//   //   time: 10,
//   //   views: 150,
//   //   comments: 4,
//   //   properties: { napravlennost: 'kozha-i-volosy' }
//   // },
//   // {
//   //   id: 3,
//   //   slug: 'sindrom-puteshestvennika',
//   //   title: 'Синдром путешественника',
//   //   preview: 'Как перелеты и смена климата влияют на микробиом?',
//   //   image: '/images/articles/th.jpg',
//   //   date: '2025-05-31',
//   //   time: 6,
//   //   views: 180,
//   //   comments: 2,
//   //   properties: { napravlennost: 'mozg-i-nervnaya-sistema' }
//   // }
// ]

// // какие ключи из query считаем “фильтрами” (можно расширять по твоим группам фильтров)
// const FILTER_KEYS = new Set([
//   'napravlennost', 'pomogaet-pri', 'klass-produkta', 'produkty',
//   'dlya-kogo', 'sostav', 'forma-vypuska', 'strana-proizvoditel'
// ])

// export default defineEventHandler((event) => {
//   const query = getQuery(event)
//   const page = Number(query.page || 1)
//     const perPage = 15 // синхронно со стором

//   // нормализуем: берём только разрешённые ключи фильтров, отбрасываем пустые значения
//   const activeFilters = Object.entries(query).reduce<Record<string, string[]>>((acc, [key, raw]) => {
//     if (key === 'page') return acc
//     if (!FILTER_KEYS.has(key)) return acc // игнорируем все “левые” ключи
//     const values = Array.isArray(raw)
//       ? raw.flatMap(v => String(v).split(','))
//       : String(raw || '').split(',')
//     const cleaned = values.map(v => v.trim()).filter(Boolean)
//     if (cleaned.length) acc[key] = cleaned
//     return acc
//   }, {})

//   const hasFilters = Object.keys(activeFilters).length > 0

//   const filtered = ALL.filter(article => {
//     if (!hasFilters) return true // нет фильтров — показываем всё
//     // каждый активный ключ должен матчиться хотя бы по одному значению
//     return Object.entries(activeFilters).every(([key, values]) => {
//       const articleValue = article.properties?.[key]
//       return articleValue ? values.includes(articleValue) : false
//     })
//   })

//   const total = filtered.length
//   const paginated = filtered.slice((page - 1) * perPage, page * perPage)

//   const payload: Paged<ArticleListItem> = { items: paginated, total }
//   return payload
// })
