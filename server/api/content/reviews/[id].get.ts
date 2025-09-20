import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  // получаем сам отзыв
  const review = await fetchReviewById(id)
  if (!review) { event.node.res.statusCode = 404; return { message: 'Not found' } }

  const productIds: string[] = Array.isArray(review.productIds) ? review.productIds : []

  // тянем только нужные товары
  const products = productIds.length
    ? await fetchProductsByIds(productIds)
    : []

  return {
    id: review.id,
    author: review.author,
    content: review.contentHtml,
    date: review.date,
    products
  }
})
