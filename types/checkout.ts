export type LoyaltyStatus = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Recipient {
  first_name: string
  last_name: string
  phone_number: string
  email: string
  birth_day?: string
}

export interface Address {
  city: string
  street: string
  house?: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  private_house?: boolean
}

export type DeliveryKind = 'courier' | 'pvz' | 'pickup'

export interface DeliveryOption {
  id: string
  kind: DeliveryKind
  title: string
  subtitle?: string
  price: number // в копейках/центах, но для простоты — в рублях
  eta: string
}

export type PaymentMethod =
  | 'installments' // Оплата покупок частями
  | 'card_online'
  | 'tpay_card'
  | 'tpay_qr'
  | 'card_courier'
  | 'cash_courier'
  | 'credit'

export interface CheckoutState {
  recipient: Recipient
  address: Address
  deliveryId: string | null
  payment: PaymentMethod | null
  comment?: string
  orderForAnotherPerson?: boolean
  loyalty_status?: LoyaltyStatus
  bonuses_to_accrue?: number
}

export interface CheckoutSummary {
  itemsCount: number
  productsTotal: number
  deliveryPrice: number
  discountPercent: number
  bonusesAccrue: number
  total: number
}
