import type { CatalogBanner } from '~/types/catalog'

export default defineEventHandler((): CatalogBanner => {
  return {
    id: 1,
    title_first: 'Как выбрать',
    title_second: 'правильный товар?',
    text: 'Чтобы подробнее узнать о товарах от Дайго, рекомендуем ознакомиться со статьями на нашем сайте',
    buttonText: 'Перейти к статьям',
    buttonLink: '/articles',
    imageDesktop: '/images/evolution/cat-act.webp',
    imageTablet: '/images/evolution/cat-act.webp',
    imageMobile: '/images/evolution/cat-act.webp'
  }
})
