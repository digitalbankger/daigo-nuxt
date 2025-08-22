import type { H3Event } from 'h3'
import type { DeliveryOption, CheckoutSummary } from '~/types/checkout'

export default defineEventHandler((_event: H3Event) => {
  const delivery: DeliveryOption[] = [
    {
      id: 'courier_daigo',
      kind: 'courier',
      title: 'Курьером Дайго',
      subtitle: 'день в день',
      price: 7400,
      eta: 'Сегодня',
    },
    {
      id: 'courier_major',
      kind: 'courier',
      title: 'Курьером Major',
      subtitle: 'до 3 дней',
      price: 12500,
      eta: '1–3 дня',
    },
    { id: 'pvz', kind: 'pvz', title: 'ПВЗ', price: 0, eta: '2–4 дня' },
    { id: 'pickup', kind: 'pickup', title: 'Самовывоз', price: 0, eta: 'Сегодня' },
  ]

  const summary: CheckoutSummary = {
    itemsCount: 2,
    productsTotal: 67500,
    deliveryPrice: delivery[0].price,
    discountPercent: 15,
    bonusesAccrue: 100,
    total: Math.round(67500 * (1 - 0.15)) + delivery[0].price,
  }

  return { delivery, summary }
})