// types/ytm.ts
export type Currency = 'RUB' | 'USD' | 'EUR' | string

export interface GeoObject {
  country?: string
  country_id?: number
  region?: string
  region_id?: number
  city?: string
  city_id?: number
}

export interface UserObject {
  user_id?: number | string
  visitor_id?: number | string
  user_type: 'guest' | 'user' | 'worker'
  email?: string
  email_MD5?: string
  is_subscribed?: boolean
  transaction_count?: number
  transaction_summ?: number
  transaction_last_date?: string // ISO8601
  segments?: string[]
}

export interface ProductObject {
  id: number | string
  group_id?: number | string
  price: number
  quantity?: number
  position?: number
  cross_sell?: Array<number | string>
  up_sell?: Array<number | string>
  list?: string
  sku?: string
  name?: string
  price_old?: number
  discount?: number
  category?: string[]
  categoryId?: number[]
  brand?: string
  brand_id?: number
  url?: string
  image_url?: string
  thumbnail_url?: string
  coupon?: string
  color?: string
  size?: string
  variant?: string[]
  isActive?: boolean
}

export interface ListingObject {
  currency?: Currency
  category?: string[]
  category_id?: number[]
  brand?: string
  brand_id?: number
  items: ProductObject[]
  query?: string
  result_count?: number
  page_count?: number
  current_page?: number
}

export interface DetailObject {
  currency: Currency
  category?: string[]
  categoryId?: number[]
  brand?: string
  brandId?: number
  items: ProductObject[]
  recommend_items?: ProductObject[]
}

export interface CartObject {
  currency: Currency
  total: number
  count: number
  items: ProductObject[] | null
  recommend?: ProductObject[]
  cart_id?: number | string
}

export interface CheckoutObject {
  step: number
  option?: string
  products?: ProductObject
}

export interface TransactionObject {
  currency: Currency
  id: number | string
  affiliation?: string
  revenue: number
  shipping?: number
  items: ProductObject[]
  recommend?: ProductObject[]
  shipping_type?: string
  payment_type?: string
  coupon?: string
  tax?: number
}

export interface EventEcommerce {
  currency?: Currency
  items?: ProductObject[]
  source?: string
  list_name?: string
  list_id?: string
}

export interface EventPayload {
  // Базовые поля
  event?: string
  page_type?: string
  page_version?: number
  geo?: GeoObject
  user?: UserObject
  listing?: ListingObject
  detail?: DetailObject
  cart?: CartObject
  checkout?: CheckoutObject
  transaction?: TransactionObject
  // ecom
  event_ecommerce?: EventEcommerce
  event_data?: Record<string, any>
}
