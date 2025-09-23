// types/promo.ts
export type PromoType = 'code' | 'discount' | 'notice' | '2plus1'

export interface RelatedProduct {
  product_id: string
  url_cpu: string
}

/** Как отдаёт API */
export interface ApiPromotionItem {
  banner: any
  id: number
  promo_type: PromoType
  banner_url: string
  name: string
  description: string
  coupon: string | null
  discount: string | null
  lable?: string | null
  related_products?: RelatedProduct[]   // <— NEW
}

/** Модель для UI */
export interface Promotion {
  id: number | string
  title: string
  description: string
  image: string
  coupon?: string | null
  discount?: string | null
  label?: string | null
  promo_type: PromoType
  /** то, что пришло от API */
  related_products?: RelatedProduct[]
  /** удобные шорткаты */
  product_slug?: string | null
  product_id?: string | null
}
