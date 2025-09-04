import type { CatalogBanner } from '~/types/catalog'

export default defineEventHandler((): CatalogBanner => {
  return {
    id: 1,
    title_first: 'Как выбрать',
    title_second: 'правильный товар?',
    text: 'Чтобы подробнее узнать о товарах от Дайго, рекомендуем ознакомиться со статьями на нашем сайте',
    buttonText: 'Перейти к статьям',
    buttonLink: '/articles',
    imageDesktop: 'http://localhost:3000/images/mock/catalog/catalog-banner-new.png',
    imageTablet: 'http://localhost:3000/images/mock/catalog/catalog-banner-new.png',
    imageMobile: 'http://localhost:3000/images/mock/catalog/catalog-banner-mobile.webp'
  }
})
