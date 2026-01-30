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

export function normalizePhoneDigits(s: string) {
  return (s || '').replace(/\D/g, '')
}

export async function fetchPhoneRaffleCoupons(phone: string) {
  const digits = normalizePhoneDigits(phone)

  // Если у тебя в профиле хранится +7..., то digits будет 11 цифр (7XXXXXXXXXX)
  // Если вдруг приходит 10 цифр — можно допилить автодобавление 7, но лучше держать единый формат.
  const { data } = await api.get<RaffleCouponsResponse>(
    `/v1/shop/raffle/coupons/phone/${encodeURIComponent(digits)}`
  )
  return data
}
