import { api } from './api'

export interface RaffleCoupon {
  coupon_number: string
  raffle_name: string
  assigned_at: string
}

export interface RaffleCouponsResponse {
  coupons: RaffleCoupon[]
  total_count: number
}

export async function fetchUserRaffleCoupons(daigoId: number | string) {
  const { data } = await api.get<RaffleCouponsResponse>(
    `/v1/shop/raffle/coupons/user/${daigoId}`
  )
  return data
}
