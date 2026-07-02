import { Banner } from '~/types/content'

export default defineEventHandler((): Banner[] => {
  return [
    {
      id: 1,
      image: `/images/mock/main.webp`,
      imageMobile: '/images/mock/main-mobile.jpg',
      mobileHeight: '405px',
      tags: [
        { label: 'Кишечник и иммунитет', color: '#FFF05D' },
        { label: 'Кожа и волосы',        color: '#9AFF9F' },
        { label: 'Зубы и десны',         color: '#FFBCD8' },
        { label: 'Кости и мышцы',        color: '#89DEFF' },
        { label: 'Нервная система и мозг', color: '#9AFF9F' }
      ],
      title: 'DAIGO — натуральные БАДы из Японии ',
      titleSize: '5em',
      descWidth: '550px',
      html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма</p>',
      buttonText: 'Узнать больше о Дайго',
      mobileButtonText: 'Больше о Дайго',
      buttonLink: '/catalog'
    },
    {
      id: 'observational-program',
      image: '/images/mock/banners/observational-program.jpg',
      imageDesktop: '/images/mock/banners/observational-program.jpg',
      imageTablet: '/images/mock/banners/observational-program.jpg',
      imageMobile: '/images/mock/banners/ob-mob.jpg',
      mobileHeight: '420px',
      tabletHeight: '360px',

      title: 'Наблюдательная программа',
      titleSize: '3.5em',
      titleSizeMobile: '1.55rem',

      descWidth: '550px',
      html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] py-3">Применение метабиотика Daigo в реальной практике врачей амбулаторного звена</p>',

      buttonText: 'Принять участие',
      mobileButtonText: 'Принять участие',
      buttonLink: 'https://res.daigo.ru',

      external: true,
      imageOnly: false,

      alt: 'Наблюдательная программа. Применение метабиотика Daigo в реальной практике врачей амбулаторного звена',
      variant: 'medical'
    }
    // {
    //   id: 2,
    //   image: '/images/mock/main.webp',
    //   imageMobile: '/images/mock/main-mobile.jpg',
    //   mobileHeight: '405px',
    //   tags: [
    //     { label: 'Кишечник и иммунитет', color: '#FFF05D' },
    //     { label: 'Кожа и волосы',        color: '#9AFF9F' },
    //     { label: 'Зубы и десны',         color: '#FFBCD8' },
    //     { label: 'Кости и мышцы',        color: '#89DEFF' },
    //     { label: 'Нервная система и мозг', color: '#9AFF9F' }
    //   ],
    //   title: 'DAIGO — натуральные БАДы из Японии ',
    //   titleSize: '5em',
    //   descWidth: '550px',
    //   html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма',
    //   buttonText: 'Узнать больше о Дайго',
    //   mobileButtonText: 'Больше о Дайго',
    //   buttonLink: '/catalog'
    // },
  ]
})



// export default defineEventHandler(async (event) => {
//   const cfg = useRuntimeConfig(event) as any

//   const apiBase: string =
//     cfg?.public?.daigoApiBase ||
//     'https://api.daigo.ru'

//   const filesBase: string =
//     cfg?.public?.daigoFilesBase ||
//     apiBase

//   const url = `${apiBase}/v1/shop/content/main-banners`

//   // Делает абсолютный URL для относительных путей
//   const normalizeImg = (src: any): string | null => {
//     if (!src) return null
//     const s = String(src)
//     if (s.startsWith('http') || s.startsWith('data:')) return s
//     const root = filesBase.replace(/\/$/, '')
//     return root + (s.startsWith('/') ? s : `/${s}`)
//   }

//   const toBanner = (b: any, idx: number) => {
//     // соберём сырые значения из возможных ключей
//     const desktopRaw =
//       b?.image_desktop ??
//       b?.image ??
//       b?.image_url ??
//       b?.desktop_image ??
//       b?.desktopImage

//     const mobileRaw =
//       b?.image_mobile ??
//       b?.mobile_image ??
//       b?.mobileImage ??
//       b?.imageMobile

//     const tabletRaw =
//       b?.image_tablet ??
//       b?.tablet_image ??
//       b?.tabletImage ??
//       b?.imageTablet

//     // нормализуем и проставим фолбэки
//     const desktop = normalizeImg(desktopRaw)
//     const mobile  = normalizeImg(mobileRaw)  || desktop
//     const tablet  = normalizeImg(tabletRaw)  || desktop

//     const placeholder = '/images/placeholder-banner.jpg'

//     // теги могут прийти строками или объектами — унифицируем
//     const tags = Array.isArray(b?.tags)
//       ? b.tags.map((t: any) =>
//           typeof t === 'string'
//             ? { label: t, color: '#FFF05D' }
//             : {
//                 label: t?.label ?? t?.title ?? '',
//                 color: t?.color ?? t?.hex ?? '#FFF05D',
//                 href:  t?.href  ?? t?.to   ?? undefined
//               }
//         )
//       : []

//     return {
//       id: b?.id ?? b?.banner_id ?? idx,

//       // для обратной совместимости
//       image: desktop || placeholder,

//       // явные каналы
//       imageDesktop: desktop || placeholder,
//       imageTablet:  tablet  || desktop || placeholder,
//       imageMobile:  mobile  || desktop || placeholder,

//       // размеры/тексты
//       mobileHeight: b?.mobile_height ?? b?.mobileHeight ?? '405px',
//       tabletHeight: b?.tablet_height ?? b?.tabletHeight ?? '500px',

//       title: b?.title ?? '',
//       titleSize: b?.title_size ?? b?.titleSize ?? '5em',
//       descWidth: b?.desc_width ?? b?.descWidth ?? '550px',

//       html: b?.html ?? b?.description_html ?? b?.descriptionHtml ?? '',

//       buttonText:       b?.button_text ?? b?.buttonText ?? 'Узнать больше',
//       mobileButtonText: b?.mobile_button_text ?? b?.mobileButtonText ?? b?.buttonText ?? 'Узнать больше',
//       buttonLink:       b?.button_link ?? b?.buttonLink ?? b?.link ?? '/catalog',

//       tags
//     }
//   }

//   try {
//     const raw: any = await $fetch(url, { timeout: 8000 })
//     const list: any[] = Array.isArray(raw) ? raw : (raw?.banners ?? [])
//     return list.map(toBanner)
//   } catch (e: any) {
//     if (import.meta.dev) {
//       console.error('[banner] upstream error', e?.response ?? e)
//     }
//     // не ломаем главную
//     return []
//   }
// })
