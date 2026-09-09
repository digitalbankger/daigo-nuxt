import { EventHandler, getQuery } from 'h3'
import type { ProductMini } from '~/types/product'

// «Покупают вместе» — под статью / продукт
const BY_ARTICLE_SLUG: Record<string, ProductMini[]> = {
  'printsip-dejstviya-metabiotikov': [
    { id: 1, title: 'Daigo Lux', image: '/images/mock/catalog/daigo-lux.png', price: 95700, url: '/catalog/daigo-lux', badge: 'Хит' },
    { id: 5, title: 'Tamotsu', image: '/images/mock/catalog/tamotsu.png', price: 67500, url: '/catalog/tamotsu' }
  ]
}

export default cachedEventHandler(async (event) => {
  const { slug } = getQuery(event)
  return BY_ARTICLE_SLUG[String(slug)] ?? []
}, { maxAge: 60 })
