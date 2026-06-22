export function isCouponApplySuccess(res: any): boolean {
  return (
    res === true ||
    res?.success === true ||
    res?.applied === true ||
    res?.coupon_info?.applied === true ||
    (Array.isArray(res?.coupons) && res.coupons.some((coupon: any) => coupon?.applied === true))
  )
}

export function getCouponApplyMessage(res: any): string {
  const raw = String(res?.validation_error || res?.message || '').trim()
  const lower = raw.toLowerCase()

  if (lower.includes('first order')) {
    return 'Промокод действует только для первого заказа'
  }

  return raw || 'Не удалось применить промокод'
}
