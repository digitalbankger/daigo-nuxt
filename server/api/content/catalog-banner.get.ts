import type { CatalogBanner } from '~/types/catalog'

export default defineEventHandler((): CatalogBanner => {
  return {
    id: 1,
    title_first: 'Как выбрать',
    title_second: 'правильный товар?',
    text: 'Чтобы подробнее узнать о товарах от Дайго, рекомендуем ознакомиться со статьями на нашем сайте',
    buttonText: 'Перейти к статьям',
    buttonLink: '/articles',
    imageDesktop: 'https://daigo.ru/images/mock/catalog/catalog-banner-bf.jpg',
    imageTablet: 'https://daigo.ru/images/mock/catalog/catalog-banner-bf.jpg',
    imageMobile: 'https://daigo.ru/images/mock/catalog/catalog-banner-mobile-bf.jpg'
  }
})
