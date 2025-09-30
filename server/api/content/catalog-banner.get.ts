import type { CatalogBanner } from '~/types/catalog'

export default defineEventHandler((): CatalogBanner => {
  return {
    id: 1,
    title_first: 'Как выбрать',
    title_second: 'правильный товар?',
    text: 'Чтобы подробнее узнать о товарах от Дайго, рекомендуем ознакомиться со статьями на нашем сайте',
    buttonText: 'Перейти к статьям',
    buttonLink: '/articles',
    imageDesktop: 'https://nuxt.daigo.ru/images/mock/catalog/catalog-banner-new.png',
    imageTablet: 'https://nuxt.daigo.ru/images/mock/catalog/catalog-banner-new.png',
    imageMobile: 'https://nuxt.daigo.ru/images/mock/catalog/catalog-banner-mobile.webp'
  }
})
