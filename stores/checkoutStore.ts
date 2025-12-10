import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { useCartStore } from '~/stores/cartStore'
import { createOrder } from '~/services/orderService'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '@/composables/useYtm'

export type DeliveryKind = 'courier' | 'pvz' | 'pickup' | 'todoor'
export type PaymentMethod =
  | 'sbp'
  | 'tbank'
  | 'dolyame'
  | 'bank_card'
  | 'courier_card'
  | 'cash'

// Опция доставки для UI
export interface DeliveryOption {
  id: string
  kind: DeliveryKind
  title: string
  subtitle?: string
  eta?: string
  // для курьера: провайдер
  provider?: 'daigo' | 'major' | 'cdek'
  // метод для бэкенда (например, sdek_todoor)
  method?: string
}

interface StateShape {
  recipient: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
  }
  // другой получатель
  otherRecipientEnabled: boolean
  otherRecipientName: string
  otherRecipientPhone: string
  otherRecipientEmail: string

  address: {
    city?: string
    street?: string
    house?: string
    apartment?: string
    entrance?: string
    floor?: string
    intercom?: string
    private_house?: boolean
    // для ПВЗ/самовывоза — строка/идентификатор
    pvzAddress?: string
    pvzId?: string
    pickupAddress?: string
    pickupSchedule?: string

    // ⬇️ Дополнительно: базовая строка адреса (единая для всех видов)
    address_line?: string // ⬅️ CHANGED: пояснение, поле используется как общий текст адреса
    block?: string        // ⬅️ CHANGED
    postal_code?: string  // ⬅️ CHANGED
  }

  orderForAnotherPerson: boolean // оставляю для обратной совместимости с текущим UI (чекбокс)
  deliveryId: string | null
  paymentMethod: PaymentMethod

  comment?: string
}

export const useCheckoutStore = defineStore('checkout', () => {
  const auth = useAuthStore()
  const user = useUserStore()
  const cart = useCartStore()

  // ---- UI-опции доставки ----
  const deliveryOptions = ref<DeliveryOption[]>([
    {
      id: 'courier_daigo',
      kind: 'courier',
      title: 'Курьером Daigo',
      subtitle: 'Бесплатная доставка по городу',
      provider: 'daigo'
    },
    {
      id: 'courier_major',
      kind: 'courier',
      title: 'Курьером Major',
      subtitle: 'Доставка партнёром',
      provider: 'major'
    },
    {
      id: 'todoor_cdek',
      kind: 'todoor',
      title: 'СДЭК до двери',
      subtitle: 'Курьерская доставка до вашей двери',
      provider: 'cdek'
    },
    {
      id: 'pvz_cdek',
      kind: 'pvz',
      title: 'ПВЗ СДЭК',
      subtitle: 'Выбрать пункт выдачи на карте'
    },
    {
      id: 'pickup_office',
      kind: 'pickup',
      title: 'Самовывоз',
      subtitle: 'г. Москва, Большой Сухаревский пер., д. 21, стр. 2',
      eta: 'пн–пт, с 9:00 до 18:00'
    }
  ])

  // ---- Состояние checkout ----
  const state = reactive<StateShape>({
    recipient: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: ''
    },

    otherRecipientEnabled: false,
    otherRecipientName: '',
    otherRecipientPhone: '',
    otherRecipientEmail: '',

    address: {
      city: '',
      street: '',
      house: '',
      apartment: '',
      entrance: '',
      floor: '',
      intercom: '',
      private_house: false,
      pvzAddress: '',
      pvzId: '',
      pickupAddress: 'г. Москва, Большой Сухаревский пер., д. 21, стр. 2',
      pickupSchedule: 'пн–пт, с 9:00 до 18:00',

      // ⬇️ Единый адрес для всех видов
      address_line: '',   // ⬅️ CHANGED: используется и курьером, и ПВЗ
      block: '',          // ⬅️ CHANGED
      postal_code: ''     // ⬅️ CHANGED
    },

    orderForAnotherPerson: false, // синхронизирован с otherRecipientEnabled (см. ниже)
    deliveryId: deliveryOptions.value[0]?.id || null,
    paymentMethod: 'sbp',

    comment: ''
  })

  // Синхронизируем старый флаг (из UI) с новым
  watchFlagSync()
  function watchFlagSync() {
    // При изменении старого флага — меняем новый
    Object.defineProperty(state, 'orderForAnotherPerson', {
      get: () => state.otherRecipientEnabled,
      set: (v: boolean) => {
        state.otherRecipientEnabled = v
        if (!v) {
          state.otherRecipientName = ''
          state.otherRecipientPhone = ''
          state.otherRecipientEmail = ''
        }
      }
    })
  }

  // Доп. указатели (используются в DeliverySelector)
  const pvzAddress = ref<string>('') // историческое поле — оставляю для совместимости
  const pickupAddress = ref<string>(state.address.pickupAddress || '')
  const pickupSchedule = ref<string>(state.address.pickupSchedule || '')

  // ---- Ошибки формы + баннер ----
  const errors = reactive({
    recipient: {
      first_name: '' as string,
      last_name: '' as string,
      phone_number: '' as string,
      email: '' as string,
      city: '' as string, // город сейчас задаётся как часть address, но ошибка удобнее тут
    },
    other: {
      name: '' as string,
      phone: '' as string,
      email: '' as string,
    },
    address: {
      city: '' as string,
      street: '' as string,
      house: '' as string,
      pvzAddress: '' as string,
      pickupAddress: '' as string,
    },
    payment: '' as string,
  })
  const lastError = ref<string>('')

  function clearErrors() {
    errors.recipient.first_name = ''
    errors.recipient.last_name = ''
    errors.recipient.phone_number = ''
    errors.recipient.email = ''
    errors.recipient.city = ''
    errors.other.name = ''
    errors.other.phone = ''
    errors.other.email = ''
    errors.address.city = ''
    errors.address.street = ''
    errors.address.house = ''
    errors.address.pvzAddress = ''
    errors.address.pickupAddress = ''
    errors.payment = ''
    lastError.value = ''
  }

  function isEmail(s: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
  }
  function normalizePhoneDigits(s: string) {
    return (s || '').replace(/\D/g, '')
  }

  // ---- Mutations ----
  function setAddress(partial: Partial<StateShape['address']>) {
    Object.assign(state.address, partial)
  }
  function setDelivery(optionId: string) {
    state.deliveryId = optionId
  }

  // ---- Prefill из профиля/корзины ----
  async function loadOptions() {
    try {
      if (auth.isAuthenticated && !user.profile) {
        await user.loadProfile()
      }
      const p = user.profile
      if (p) {
        if (!state.recipient.first_name && (p.first_name || p.last_name)) {
          state.recipient.first_name = p.first_name || ''
          state.recipient.last_name = p.last_name || ''
        }
        if (!state.recipient.phone_number && p.phone_number) {
          state.recipient.phone_number = p.phone_number
        }
        if (!state.recipient.email && p.email) {
          state.recipient.email = p.email
        }
        if (!state.address.city && (p as any).city) {
          state.address.city = (p as any).city
        }
      }

      // Фоллбек из формы корзины (если пользователь вводил до авторизации)
      if (!state.recipient.first_name && cart.userForm.fullName) {
        const parts = cart.userForm.fullName.trim().split(/\s+/)
        state.recipient.first_name = parts.shift() || ''
        state.recipient.last_name = parts.join(' ')
      }
      if (!state.recipient.phone_number && cart.userForm.phone) {
        state.recipient.phone_number = cart.userForm.phone
      }
    } catch (e) {
      console.warn('[checkout] loadOptions failed', e)
    }
  }

  // ---- Вспомогательное: построить delivery payload из выбранной опции ----
  function buildDeliveryPayload() {
    const opt = deliveryOptions.value.find(o => o.id === state.deliveryId) || deliveryOptions.value[0]
    if (!opt) return { type: 'courier', provider: 'daigo' }

    // ЕДИНЫЙ адресной объект для courier и pvz  ⬇️⬇️⬇️
    const baseAddress = {
      address_line: state.address.address_line || [state.address.city, state.address.street].filter(Boolean).join(', '), // ⬅️ CHANGED
      city: state.address.city || '',
      street: state.address.street || '',
      house: state.address.house || '',           // ⬅️ CHANGED
      block: state.address.block || '',           // ⬅️ CHANGED
      postal_code: state.address.postal_code || '', // ⬅️ CHANGED
      apartment: state.address.private_house ? '' : (state.address.apartment || ''),
      entrance: state.address.private_house ? '' : (state.address.entrance || ''),
      floor: state.address.private_house ? '' : (state.address.floor || ''),
      intercom: state.address.private_house ? '' : (state.address.intercom || ''),
      is_private: !!state.address.private_house && opt.kind !== 'pvz' // для ПВЗ принудительно false валидацией UI ⬅️ CHANGED
    }

    if (opt.kind === 'courier') {
      return {
        type: 'courier',
        provider: opt.provider || 'daigo',
        ...baseAddress
      }
    }

    if (opt.kind === 'todoor') {
      return {
        type: 'todoor',
        provider: opt.provider || 'cdek',
        ...baseAddress
      }
    }

    if (opt.kind === 'pvz') {
      return {
        type: 'pvz',
        provider: 'cdek',
        ...baseAddress,
        is_private: false 
      }
    }

    // pickup
    return {
      type: 'pickup',
      address: state.address.pickupAddress || pickupAddress.value,
      schedule: state.address.pickupSchedule || pickupSchedule.value
    }
  }

  // ---- Валидация ----
  function validate(): boolean {
    clearErrors()

    const fn = (state.recipient.first_name || '').trim()
    const ln = (state.recipient.last_name || '').trim()
    const ph = normalizePhoneDigits(state.recipient.phone_number || '')
    const em = (state.recipient.email || '').trim()
    const city = (state.address.city || '').trim()

    if (!fn && !ln) {
      errors.recipient.first_name = 'Укажите имя'
      errors.recipient.last_name = ''
    }
    if (!ph || ph.length < 10) errors.recipient.phone_number = 'Укажите телефон'
    if (!em || !isEmail(em)) errors.recipient.email = 'Введите корректный email'
    if (!city) errors.recipient.city = 'Укажите город'

    if (state.otherRecipientEnabled) {
      const on = (state.otherRecipientName || '').trim()
      const op = normalizePhoneDigits(state.otherRecipientPhone || '')
      const oe = (state.otherRecipientEmail || '').trim()
      if (!on) errors.other.name = 'Укажите ФИО другого получателя'
      if (!op || op.length < 10) errors.other.phone = 'Укажите телефон другого получателя'
      if (oe && !isEmail(oe)) errors.other.email = 'Email другого получателя некорректен'
    }

    const opt = deliveryOptions.value.find(o => o.id === state.deliveryId) || deliveryOptions.value[0]
    if (opt?.kind === 'courier' || opt?.kind === 'pvz') { // ⬅️ единые правила для курьера и ПВЗ
      // Требуем хотя бы улицу или address_line
      const line = (state.address.address_line || '').trim()
      const street = (state.address.street || '').trim()
      if (!line && !street) {
        errors.address.street = 'Укажите улицу'
      }
      // Отдельно требуем дом (из отдельного поля)
      const house = (state.address.house || '').trim()
      if (!house) {
        errors.address.house = 'Укажите дом'
      }
      // ПВЗ-специфичную проверку pvzAddress убираем
      errors.address.pvzAddress = ''
    } else if (opt?.kind === 'pickup') {
      if (!(state.address.pickupAddress || pickupAddress.value)?.trim()) {
        errors.address.pickupAddress = 'Укажите адрес самовывоза'
      }
    }


    if (!state.paymentMethod) {
      errors.payment = 'Выберите способ оплаты'
    }

    const hasErrors =
      !!errors.recipient.first_name ||
      !!errors.recipient.last_name ||
      !!errors.recipient.phone_number ||
      !!errors.recipient.email ||
      !!errors.recipient.city ||
      !!errors.other.name ||
      !!errors.other.phone ||
      !!errors.other.email ||
      !!errors.address.street ||
      !!errors.address.house ||
      !!errors.address.pvzAddress || // остаётся для совместимости, но теперь не должен заполняться
      !!errors.address.pickupAddress ||
      !!errors.payment

    if (hasErrors) {
      lastError.value = 'Проверьте форму — есть ошибки.'
      return false
    }
    return true
  }

  // ---- Отправка заказа ----
  async function submit() {
    try {
      lastError.value = ''

      if (!auth.userId) {
        lastError.value = 'Необходима авторизация'
        throw new Error('AUTH_REQUIRED')
      }

      if (!validate()) {
        return
      }

      // Формируем список товаров из cartStore (без подарков и пустых id)
      const items = (cart.items || [])
        .filter(i => i?.id)
        .map(i => ({
          product_id: String(i.id),
          name: i.title,
          quantity: i.quantity,
          price: i.price,
          amo_id: (i as any).amo_id ?? null
        }))

      if (!items.length) {
        lastError.value = 'В корзине нет товаров'
        throw new Error('EMPTY_CART')
      }

      const payload = {
        daigo_id: auth.userId,
        recipient: {
          name: [state.recipient.first_name, state.recipient.last_name].filter(Boolean).join(' ').trim(),
          phone: state.recipient.phone_number.replace(/\D/g, ''),
          email: state.recipient.email,
          city: state.address.city
        },
        other_recipient: state.otherRecipientEnabled ? {
          enabled: true,
          name: state.otherRecipientName || undefined,
          phone: state.otherRecipientPhone.replace(/\D/g, '') || undefined,
          email: state.otherRecipientEmail || undefined
        } : { enabled: false },
        delivery: buildDeliveryPayload(),
        payment_method: state.paymentMethod,
        comment: state.comment || undefined,
        items
      }

      const res = await createOrder(payload as any)

      // === YM: ecommerce purchase ===
      const analytics = useAnalytics()
      try {
        if (process.client && (res as any)?.order_id) {
          const orderId = String((res as any).order_id)
          const sentKey = `purchase_sent_${orderId}`

          if (!localStorage.getItem(sentKey)) {
            const products = (cart.items || [])
              .filter((i: any) => i?.id)
              .map((i: any) => ({
                id: String(i.id),
                name: i.title || i.name,
                price: Number(i.price ?? 0),
                quantity: Number(i.quantity ?? 1),
              }))

            const revenue = Number.isFinite(Number(cart.total)) ? Number(cart.total) : 0

            analytics.purchase({
              id: orderId,
              revenue,
              currency: 'RUB',
              products,
            })

            const ytm = useYtm()
            ytm.purchase({
              currency: 'RUB',
              id: orderId,
              revenue,
              shipping: 0,
              items: products,
              shipping_type: state.deliveryId || undefined,
              coupon: cart.couponInfo?.code || undefined,
              tax: 0,
              payment_type: state.paymentMethod,
            })

            localStorage.setItem(sentKey, '1')
          }
        }
      } catch {
        // no-op
      }

      // 👉 Никаких редиректов здесь больше нет
      const url = (res as any)?.confirmation?.confirmation_url || null

      // Возвращаем ответ + доп. поле confirmationUrl
      return {
        ...(res as any),
        confirmationUrl: url,
      }
    } catch (e: any) {
      console.warn('ORDER_SUBMIT_FAIL', e)
      if (!lastError.value) lastError.value = e?.message || 'Не удалось оформить заказ. Попробуйте позже.'
    }
  }

  return {
    // state
    state,
    deliveryOptions,
    pvzAddress,
    pickupAddress,
    pickupSchedule,

    // ошибки
    errors,
    lastError,

    // methods
    setAddress,
    setDelivery,
    loadOptions,
    submit
  }
})
