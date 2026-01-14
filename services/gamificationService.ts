// services/gamificationService.ts
import { api } from '@/services/api'
import type {
  PrizeType,
  WheelResult,
  WheelSegment
} from '~/types/gamification'

/**
 * prize_type с бэка
 */
export type ApiPrizeType = 'discount_coupon' | 'discount_gift'

/**
 * Ответ проверки доступных спинов:
 * GET /v1/shop/fortune/spins/{phone_number}
 */
interface ApiAvailableSpinsResponse {
  available_spins: number
}

/**
 * Полезные поля из user_prize
 */
interface ApiUserPrize {
  user_prize_id: number
  phone_number: string
  prize_id: number
  prize_type: ApiPrizeType
  product_id: number | null
  coupon_code: string | null
  status: string
  won_at: string
  expires_at: string
  used_at: string | null
  order_id: number | null
  prize: {
    prize_id: number
    prize_type: ApiPrizeType
    prize_name: string
    prize_description: string
    prize_image: string
    product_id: number | null
    promotion_id: number
    is_active: boolean
    first_order_only: boolean
    created_at: string
    updated_at: string
  }
}

interface ApiSpinHistoryItem {
  spin_id: number
  phone_number: string
  user_prize_id: number
  spun_at: string
  created_at: string
  user_prize: ApiUserPrize
}

/**
 * POST /v1/shop/fortune/spins/{phone_number}
 */
interface ApiSpinResponse {
  user_prize: ApiUserPrize
  remaining_spins: number
}

/**
 * То, что возвращаем в твой код после спина
 * (используется lastSpin.value, prizeName и т.п.)
 */
export interface WheelSpinResponse {
  segmentId: number             // prize_id — сектор колеса
  prizeName: string             // prize.prize_name
  prizeDescription: string      // prize.prize_description
  prizeType: ApiPrizeType       // 'discount_coupon' | 'discount_gift'
  couponCode?: string | null    // coupon_code, если купон
  productId?: number | null     // product_id, если подарок-товар
  remainingSpins: number
  raw: ApiSpinResponse          // весь ответ, если нужно ещё что-то
}

export interface SpinHistoryItem {
  spinId: number
  spunAt: string
  prizeName: string
  prizeDescription: string
  prizeType: ApiPrizeType
  couponCode?: string | null
  productId?: number | null
  status: string
  expiresAt: string
}

/**
 * Результат проверки номера (используется в модалке)
 */
export interface CheckWheelPhoneResult {
  canSpin: boolean
  availableSpins: number
  reason?: 'already_spun' | 'no_spins' | 'error'
}

// Последний введённый номер — спин делаем именно по нему
let lastPhone: string | null = null

// =====================================================
//   1) Проверка телефона: есть ли доступные спины
//      GET /v1/shop/fortune/spins/{phone_number}
// =====================================================

function normalizePhoneForApi(raw: string): string {
  // выкидываем всё, кроме цифр
  let digits = raw.replace(/\D/g, '')

  // варианты:
  // 8XXXXXXXXXX или 7XXXXXXXXXX → приводим к 7XXXXXXXXXX
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    digits = '7' + digits.slice(1)
  }

  // 10 цифр (без кода страны) → добавляем 7
  if (digits.length === 10) {
    digits = '7' + digits
  }

  if (digits.length !== 11 || !digits.startsWith('7')) {
    throw new Error('invalid phone number format')
  }

  return digits
}

export async function checkWheelPhone(phone: string): Promise<CheckWheelPhoneResult> {
  let normalized: string

  try {
    normalized = normalizePhoneForApi(phone)
  } catch (e) {
    console.error('checkWheelPhone normalize error', e)
    return {
      canSpin: false,
      availableSpins: 0,
      reason: 'error'
    }
  }

  lastPhone = normalized

  try {
    const { data } = await api.get<ApiAvailableSpinsResponse>(
      `/v1/shop/fortune/spins/${normalized}`
    )

    if (data.available_spins > 0) {
      return {
        canSpin: true,
        availableSpins: data.available_spins
      }
    }

    return {
      canSpin: false,
      availableSpins: 0,
      reason: 'already_spun'
    }
  } catch (error) {
    console.error('checkWheelPhone error', error)
    return {
      canSpin: false,
      availableSpins: 0,
      reason: 'error'
    }
  }
}


// =====================================================
//   2) Сам спин:
//      POST /v1/shop/fortune/spins/{phone_number}
// =====================================================

// !!! теперь spinWheel может принимать телефон сразу
export async function spinWheel(phoneRaw?: string): Promise<WheelSpinResponse> {
  let normalized: string

  if (phoneRaw) {
    // пришёл номер из формы — нормализуем и запоминаем
    normalized = normalizePhoneForApi(phoneRaw)
    lastPhone = normalized
  } else {
    // режим обратной совместимости (если вдруг где-то ещё зовёшь без телефона)
    if (!lastPhone) {
      throw new Error(
        'spinWheel: phone is not set. Сначала передай номер телефона.'
      )
    }
    normalized = lastPhone
  }

  const { data } = await api.post<ApiSpinResponse>(
    `/v1/shop/fortune/spins/${normalized}`
  )

  const p = data.user_prize

  return {
    segmentId: p.prize_id,
    prizeName: p.prize?.prize_name ?? '',
    prizeDescription: p.prize?.prize_description ?? '',
    prizeType: p.prize_type,
    couponCode: p.coupon_code ?? undefined,
    productId: p.product_id ?? undefined,
    remainingSpins: data.remaining_spins,
    raw: data
  }
}


export async function getSpinHistory(
  phone: string,
  opts?: { limit?: number; offset?: number }
): Promise<SpinHistoryItem[]> {
  const normalized = normalizePhoneForApi(phone)

  const { data } = await api.get<ApiSpinHistoryItem[]>(
    `/v1/shop/fortune/spins/${normalized}/history`,
    {
      params: {
        limit: opts?.limit ?? 20,
        offset: opts?.offset ?? 0
      }
    }
  )

  return data.map((item) => {
    const p = item.user_prize
    return {
      spinId: item.spin_id,
      spunAt: item.spun_at,
      prizeName: p.prize?.prize_name ?? '',
      prizeDescription: p.prize?.prize_description ?? '',
      prizeType: p.prize_type,
      couponCode: p.coupon_code ?? undefined,
      productId: p.product_id ?? undefined,
      status: p.status,
      expiresAt: p.expires_at
    }
  })
}


// =====================================================
//   3) Маппинг результата спина к твоему WheelResult
//      (для gamificationStore.setWheelResult)
// =====================================================

export function mapSpinToWheelResult(spin: WheelSpinResponse): WheelResult {
  let type: PrizeType = 'none'

  if (spin.prizeType === 'discount_coupon') {
    type = 'coupon'
  } else if (spin.prizeType === 'discount_gift') {
    type = 'gift'
  }

  // value:
  //  - для купона — сам промокод
  //  - для подарка — productId
  //  - при желании можно хранить ещё что-то в store
  const value =
    spin.prizeType === 'discount_coupon'
      ? (spin.couponCode ?? '')
      : (spin.productId ?? '')

  return {
    segmentId: String(spin.segmentId),
    type,
    value
  }
}

// =====================================================
//   4) Сегменты колеса (16 штук, как ты и говорил)
//   Здесь только id 1–16, подписи/типы можно
//   потом подправить под реальные призы
// =====================================================

export const WHEEL_SEGMENTS: WheelSegment[] = Array.from(
  { length: 16 },
  (_, i) => ({
    id: String(i + 1),
    label: `Приз ${i + 1}`,
    type: 'none'
  })
)
