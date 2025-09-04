export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const daigoId = query.daigoId as string

  if (!daigoId) {
    throw createError({
      statusCode: 400,
      message: 'Не указан daigoId',
    })
  }

  return [
    {
      operation_type: 'credit',
      value: 150,
      date: '2025-07-25',
      order_id: 'ORD-3021',
      order_price: 1500,
      description: 'Начисление за заказ',
    },
    {
      operation_type: 'debit',
      value: 50,
      date: '2025-07-28',
      order_id: 'ORD-3050',
      order_price: 1500,
      description: 'Списание при покупке',
    },
  ]
})
