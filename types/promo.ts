export interface Promotion {
  id: number | string
  title: string
  description: string
  image: string
  coupon?: string
  promo_type: 'discount' | 'gift' | 'code'
}