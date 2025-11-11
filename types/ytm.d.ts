export {}

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export interface GeoObject { country?: string; region?: string; city?: string }
export interface UserObject { id?: string|number; type?: 'guest'|'user'; email_hash?: string }

export interface ProductObject {
  id: string|number; name: string; price: number; quantity?: number;
  brand?: string; category?: string; variant?: string;
}
export interface ListingObject { list_id: string; products: ProductObject[] }
export interface DetailObject { product: ProductObject }
export interface CartObject { products: ProductObject[]; value?: number; currency?: string }
export interface CheckoutObject { step: number; option?: string; products: ProductObject[]; value?: number; currency?: string }
export interface TransactionObject {
  id: string|number; affiliation?: string; value: number; tax?: number; shipping?: number;
  coupon?: string; currency?: string; products: ProductObject[];
}

export interface EventEcommerce {
  event: string
  page_type?: string
  geo?: GeoObject
  user?: UserObject
  listing?: ListingObject
  detail?: DetailObject
  cart?: CartObject
  checkout?: CheckoutObject
  transaction?: TransactionObject
  product?: ProductObject
  event_data?: Record<string, any>
}
