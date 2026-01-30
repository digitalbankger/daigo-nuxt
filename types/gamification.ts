// types/gamification.ts

export type PrizeType = 'coupon' | 'discount' | 'gift' | 'none'

export interface WheelSegment {
  id: number              // 1–16
  label: string
  type: PrizeType
  value?: string | number // купон / % / id подарка
  weight?: number         // вероятность (на будущее)
  color?: string          // для визуала, если нужно
}

export interface WheelResult {
  segmentId: number
  type: PrizeType
  value?: string | number
  title: string           // человекочитаемое название подарка
  description?: string
}

// для таймера подарка (если будешь использовать GiftTimer)
export interface GiftOption {
  id: string
  label: string
}

export interface GiftClaim {
  giftId: string
  expiresAt: string // ISO
}

export interface GamificationState {
  // wheel
  wheelSpunAt?: string | null
  wheelResult?: WheelResult | null
  // gift
  giftSelected?: string | null
  giftExpiresAt?: string | null
  giftClaimed?: boolean
}
