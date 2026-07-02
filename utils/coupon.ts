export function isCouponApplySuccess(res: any): boolean {
  return (
    res === true ||
    res?.success === true ||
    res?.applied === true ||
    res?.coupon?.applied === true ||
    res?.coupon_info?.applied === true ||
    (Array.isArray(res?.coupons) && res.coupons.some((coupon: any) => coupon?.applied === true))
  )
}

function normalizeCouponMessage(raw: string): string {
  const text = String(raw || '').trim()
  const lower = text.toLowerCase()

  if (!text) return ''

  if (lower.includes('invalid coupon code') || lower.includes('coupon not found')) {
    return 'Промокод недействителен'
  }

  if (lower.includes('first order')) {
    return 'Промокод действует только для первого заказа'
  }

  if (lower.includes('expired')) {
    return 'Срок действия промокода истёк'
  }

  if (lower.includes('already applied')) {
    return 'Промокод уже применён'
  }

  return text
}

export function getCouponApplyMessage(res: any): string {
  const raw =
    res?.coupon?.validation_error ||
    res?.coupon_info?.validation_error ||
    res?.validation_error ||
    res?.coupon?.message ||
    res?.coupon_info?.message ||
    res?.message ||
    ''

  return normalizeCouponMessage(raw) || 'Не удалось применить промокод'
}
