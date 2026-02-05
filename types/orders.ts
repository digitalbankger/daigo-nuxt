export interface OrderHistoryApiItem {
  history_id: number
  order_id: number
  order_date: string          
  status: string              // created|processing|waiting_payment|paid|shipped|delivered|canceled|failed
  total_amount: number
  bonus?: number | null
  ItemIDs: number[]           // список id товаров
  confirmation_url?: string | null
}

// то, что удобно для UI
export interface OrderListItem {
  id: number
  order_id?: number             
  number: string              // отформатированный order_id (например 8 знаков)
  date: string                // человекочитаемая дата
  status: string
  total: number
  bonus: number | null
  items: {
    id: number
    name: string
    image: string
    quantity: number
  }[]
  confirmationUrl?: string | null
}

/** Причины отмены заказа (фронт → бек) */
export type OrderCancelReason =
  | 'payment_issue'
  | 'order_mistake'
  | 'accidental_repeat'
  | 'other'

export const ORDER_CANCEL_REASONS: { value: OrderCancelReason; label: string }[] = [
  { value: 'payment_issue',     label: 'Проблемы с оплатой' },
  { value: 'order_mistake',     label: 'Ошибся(лась) при оформлении' },
  { value: 'accidental_repeat', label: 'Случайный повторный заказ' },
  { value: 'other',             label: 'Другое' },
]