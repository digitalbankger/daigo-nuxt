export interface OrderHistoryApiItem {
  history_id: number
  order_id: number
  order_date: string          
  status: string              // "created" | "pending" | "waiting_payment" | "payment_received" | "delivered" | "canceled" | "failed"
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
