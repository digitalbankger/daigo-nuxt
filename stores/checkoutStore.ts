import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { useCartStore } from '~/stores/cartStore'
import { createOrder } from '~/services/orderService'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '@/composables/useYtm'
import { getLastUtm } from '@/composables/useUtmTracker'

function buildUtmPayload() {
  const last = getLastUtm()
  if (!last) return undefined

  const utm: any = {
    source: last.source,
    medium: last.medium,
    campaign: last.campaign,
    content: last.content,
    term: last.term,
  }

  Object.keys(utm).forEach((k) => utm[k] === undefined && delete utm[k])
  const hasMeaningful = ['source', 'medium', 'campaign', 'content', 'term'].some((k) => k in utm)
  if (!hasMeaningful) return undefined
  return utm
}

export type DeliveryKind = 'courier' | 'pvz' | 'pickup' | 'todoor'
export type PaymentMethod =
  | 'sbp'
  | 'tpay_card'
  | 'tpay_qr'
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

export interface SavedCheckoutAddress {
  index: number
  label: string
  city: string
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  block?: string
  postal_code?: string
  address_line?: string
  raw: any
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
    cdekPvz?: {
      code: string
      uuid?: string
      city_code?: number
      city?: string
      address: string
      work_time?: string
      nearest_station?: string
      latitude?: number
      longitude?: number
      address_comment?: string
    } | null

    // ⬇️ Дополнительно: базовая строка адреса (единая для всех видов)
    address_line?: string // ⬅️ CHANGED: пояснение, поле используется как общий текст адреса
    block?: string        // ⬅️ CHANGED
    postal_code?: string  // ⬅️ CHANGED
    city_fias_id?: string | null
    region?: string | null
    geo_lat?: number | null
    geo_lon?: number | null
  }

  orderForAnotherPerson: boolean // оставляю для обратной совместимости с текущим UI (чекбокс)
  deliveryId: string | null
  paymentMethod: PaymentMethod

  // списание бонусов (1 бонус = 1 рубль), отправляется в payload заказа
  bonuses_to_use?: number

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
      cdekPvz: null,

      // ⬇️ Единый адрес для всех видов
      address_line: '',   // ⬅️ CHANGED: используется и курьером, и ПВЗ
      block: '',          // ⬅️ CHANGED
      postal_code: ''     // ⬅️ CHANGED
    },

    orderForAnotherPerson: false, // синхронизирован с otherRecipientEnabled (см. ниже)
    deliveryId: deliveryOptions.value[0]?.id || null,
    paymentMethod: 'sbp',

    bonuses_to_use: 0,

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
  const isApplyingSavedAddress = ref(false)
  const saveAddressLoading = ref(false)
  const saveAddressMessage = ref('')
  const saveAddressError = ref('')
  let savedAddressApplyTimer: ReturnType<typeof setTimeout> | undefined

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

  function cleanAddressPart(value: any): string {
    return String(value ?? '').replace(/\s+/g, ' ').trim()
  }

  function pickAddressField(raw: any, keys: string[]): string {
    if (!raw || typeof raw !== 'object') return ''
    for (const key of keys) {
      const value = cleanAddressPart(raw[key])
      if (value) return value
    }
    return ''
  }

  function stripAddressPrefix(value: string, prefixes: string[]): string {
    let result = cleanAddressPart(value)
    for (const prefix of prefixes) {
      result = result.replace(new RegExp(`^${prefix}\\.?\\s*`, 'i'), '')
    }
    return cleanAddressPart(result)
  }

  function parseStreet(raw: string): string {
    return stripAddressPrefix(raw, [
      'ул', 'улица', 'проспект', 'пр-кт', 'пр\\.', 'пер', 'переулок',
      'шоссе', 'бульвар', 'бул', 'наб', 'набережная', 'проезд', 'мкр', 'микрорайон'
    ])
  }

  function parseCity(raw: string): string {
    return stripAddressPrefix(raw, ['г', 'город', 'пос', 'поселок', 'посёлок', 'д', 'деревня', 'с', 'село', 'рп', 'пгт'])
  }

  function parseHouseBlock(raw: string) {
    const text = cleanAddressPart(raw)
    const houseMatch = text.match(/(?:^|\s)(?:д|дом|вл|владение)\.?\s*([^,;]+)/i)
    const value = houseMatch?.[1] || text
    const house = cleanAddressPart(value)
      .replace(/\s*(?:к|корп|корпус|стр|строение)\.?\s*.*$/i, '')
      .replace(/^№\s*/, '')
    const blockMatch = text.match(/(?:к|корп|корпус|стр|строение)\.?\s*([^,;]+)/i)
    return {
      house: cleanAddressPart(house),
      block: cleanAddressPart(blockMatch?.[1] || ''),
    }
  }

  function parseSavedAddress(raw: any, index: number): SavedCheckoutAddress | null {
    if (!raw) return null

    const rawString = typeof raw === 'string'
      ? raw
      : pickAddressField(raw, ['address', 'address_line', 'addressLine', 'full_address', 'fullAddress', 'value', 'label', 'title', 'street'])

    const parts = cleanAddressPart(rawString)
      .split(',')
      .map(part => cleanAddressPart(part))
      .filter(Boolean)

    let postal = pickAddressField(raw, ['postal_code', 'postalCode', 'zip'])
    let city = pickAddressField(raw, ['city', 'town', 'settlement', 'locality'])
    let street = pickAddressField(raw, ['street', 'street_name', 'streetName'])
    let house = pickAddressField(raw, ['house', 'building', 'home'])
    let block = pickAddressField(raw, ['block', 'corpus', 'building_block'])
    let apartment = pickAddressField(raw, ['apartment', 'flat', 'office', 'apt'])
    let entrance = pickAddressField(raw, ['entrance', 'porch'])
    let floor = pickAddressField(raw, ['floor'])
    let intercom = pickAddressField(raw, ['intercom', 'doorphone'])

    for (const part of parts) {
      if (!postal && /^\d{5,6}$/.test(part)) {
        postal = part
        continue
      }

      if (!city && /^(г\.?|город|пос\.?|поселок|посёлок|д\.?|деревня|с\.?|село|рп\.?|пгт\.?)/i.test(part)) {
        city = parseCity(part)
        continue
      }

      if (!street && /(ул\.?|улица|проспект|пр-кт|пер\.?|переулок|шоссе|бульвар|бул\.?|наб\.?|набережная|проезд|мкр|микрорайон)/i.test(part)) {
        street = parseStreet(part)
        continue
      }

      if (!house && /^(д\.?|дом|вл\.?|владение)\s*/i.test(part)) {
        const parsed = parseHouseBlock(part)
        house = parsed.house
        if (!block) block = parsed.block
        continue
      }

      if (!apartment && /^(кв\.?|квартира|оф\.?|офис|пом\.?|помещение|апарт)/i.test(part)) {
        apartment = stripAddressPrefix(part, ['кв', 'квартира', 'оф', 'офис', 'пом', 'помещение', 'апарт'])
        continue
      }

      if (!entrance && /подъезд/i.test(part)) {
        entrance = stripAddressPrefix(part, ['подъезд'])
        continue
      }

      if (!floor && /этаж/i.test(part)) {
        floor = stripAddressPrefix(part, ['этаж'])
        continue
      }

      if (!intercom && /домофон/i.test(part)) {
        intercom = stripAddressPrefix(part, ['домофон'])
      }
    }

    // Если город явно не найден, берём первую часть, которая не похожа на область/индекс/улицу/дом.
    if (!city) {
      const candidate = parts.find(part =>
        !/^\d{5,6}$/.test(part) &&
        !/(обл|край|район|р-н|ул\.?|улица|проспект|пр-кт|пер\.?|шоссе|д\.?|дом|кв\.?)/i.test(part)
      )
      city = parseCity(candidate || '')
    }

    const addressLine = [street, house ? `д. ${house}` : ''].filter(Boolean).join(', ')
    const label = pickAddressField(raw, ['label', 'title']) || [city, street, house ? `д. ${house}` : '', apartment ? `кв. ${apartment}` : '']
      .filter(Boolean)
      .join(', ') || rawString

    if (!label && !city && !street && !house) return null

    return {
      index,
      label,
      city,
      street,
      house,
      apartment: apartment || undefined,
      entrance: entrance || undefined,
      floor: floor || undefined,
      intercom: intercom || undefined,
      block: block || undefined,
      postal_code: postal || undefined,
      address_line: addressLine || street || rawString,
      raw,
    }
  }

  const savedAddresses = computed<SavedCheckoutAddress[]>(() => {
    const rawAddresses = Array.isArray(user.profile?.addresses) ? user.profile.addresses : []
    return rawAddresses
      .map((address, index) => parseSavedAddress(address, index))
      .filter(Boolean) as SavedCheckoutAddress[]
  })

  function applySavedAddress(index: number) {
    const selected = savedAddresses.value.find(address => address.index === index)
    if (!selected) return

    isApplyingSavedAddress.value = true
    if (savedAddressApplyTimer) clearTimeout(savedAddressApplyTimer)

    const current = deliveryOptions.value.find(option => option.id === state.deliveryId)
    if (!current || current.kind === 'pickup') {
      const firstCourier = deliveryOptions.value.find(option => option.kind === 'courier' || option.kind === 'todoor')
      if (firstCourier) state.deliveryId = firstCourier.id
    }

    setAddress({
      city: selected.city || state.address.city || '',
      city_fias_id: null,
      street: selected.street || '',
      house: selected.house || '',
      block: selected.block || '',
      postal_code: selected.postal_code || '',
      apartment: selected.apartment || '',
      entrance: selected.entrance || '',
      floor: selected.floor || '',
      intercom: selected.intercom || '',
      address_line: selected.address_line || selected.street || '',
      private_house: false,
    })

    savedAddressApplyTimer = setTimeout(() => {
      isApplyingSavedAddress.value = false
    }, 350)
  }

  // ---- Mutations ----
  function setAddress(partial: Partial<StateShape['address']>) {
    Object.assign(state.address, partial)
  }
  function setDelivery(optionId: string) {
    state.deliveryId = optionId
  }

  function setCdekPvz(office: any | null) {
    if (!office) {
      state.address.cdekPvz = null
      state.address.pvzId = ''
      state.address.pvzAddress = ''
      return
    }

    const location = office.location || {}
    state.address.cdekPvz = {
      code: String(office.code || ''),
      uuid: office.uuid || undefined,
      city_code: Number(location.city_code || office.city_code || 0) || undefined,
      city: String(location.city || office.city || state.address.city || ''),
      address: String(location.address || office.address || ''),
      work_time: office.work_time || undefined,
      nearest_station: office.nearest_station || undefined,
      latitude: Number(location.latitude || office.latitude || 0) || undefined,
      longitude: Number(location.longitude || office.longitude || 0) || undefined,
      address_comment: office.address_comment || undefined,
    }
    state.address.pvzId = state.address.cdekPvz.code
    state.address.pvzAddress = state.address.cdekPvz.address
    state.address.address_line = state.address.cdekPvz.address
    state.address.street = state.address.cdekPvz.address
    state.address.house = state.address.house || '-'
    state.address.city = state.address.cdekPvz.city || state.address.city
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
      house: state.address.house || '',
      block: state.address.block || '',
      postal_code: state.address.postal_code || '',
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
        pvz_id: state.address.cdekPvz?.code || state.address.pvzId || '',
        pvz_code: state.address.cdekPvz?.code || state.address.pvzId || '',
        pvz_uuid: state.address.cdekPvz?.uuid || undefined,
        pvz_address: state.address.cdekPvz?.address || state.address.pvzAddress || baseAddress.address_line,
        cdek_city_code: state.address.cdekPvz?.city_code || undefined,
        work_time: state.address.cdekPvz?.work_time || undefined,
        location: state.address.cdekPvz ? {
          latitude: state.address.cdekPvz.latitude,
          longitude: state.address.cdekPvz.longitude,
        } : undefined,
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

  function getAuthHeaders() {
    const token = auth.token
    return token ? { Authorization: `Bearer ${token}` } : undefined
  }

  function getCurrentDeliveryOption() {
    return deliveryOptions.value.find(o => o.id === state.deliveryId) || deliveryOptions.value[0]
  }

  function buildSaveAddressPayload() {
    const opt = getCurrentDeliveryOption()

    if (opt?.kind === 'pvz') {
      const pvz = state.address.cdekPvz
      return {
        address_type: 'pvz',
        pvz_code: pvz?.code || state.address.pvzId || '',
        pvz_name: pvz?.nearest_station || (pvz?.code ? `СДЭК ${pvz.code}` : 'СДЭК Пункт'),
        pvz_address: pvz?.address || state.address.pvzAddress || state.address.address_line || '',
        is_default: false,
      }
    }

    return {
      address_type: 'personal',
      city: state.address.city || '',
      street: state.address.address_line || state.address.street || '',
      house: state.address.house || '',
      apartment: state.address.private_house ? '' : (state.address.apartment || ''),
      entrance: state.address.private_house ? '' : (state.address.entrance || ''),
      floor: state.address.private_house ? '' : (state.address.floor || ''),
      intercom: state.address.private_house ? '' : (state.address.intercom || ''),
      is_default: true,
    }
  }

  function validateAddressForSave() {
    saveAddressError.value = ''

    if (!auth.userId || !auth.token) {
      saveAddressError.value = 'Авторизуйтесь, чтобы сохранить адрес.'
      return false
    }

    const opt = getCurrentDeliveryOption()

    if (opt?.kind === 'pvz') {
      if (!state.address.cdekPvz?.code && !(state.address.pvzId || '').trim()) {
        saveAddressError.value = 'Сначала выберите пункт выдачи СДЭК.'
        return false
      }
      return true
    }

    if (opt?.kind === 'pickup') {
      saveAddressError.value = 'Адрес самовывоза сохранять не нужно.'
      return false
    }

    if (!(state.address.city || '').trim()) {
      saveAddressError.value = 'Сначала укажите город.'
      return false
    }

    if (!(state.address.address_line || state.address.street || '').trim()) {
      saveAddressError.value = 'Сначала укажите улицу.'
      return false
    }

    if (!(state.address.house || '').trim()) {
      saveAddressError.value = 'Сначала укажите дом.'
      return false
    }

    return true
  }

  async function saveCurrentAddress() {
    saveAddressMessage.value = ''
    saveAddressError.value = ''

    if (!validateAddressForSave()) return false

    const { public: { daigoApiBase } } = useRuntimeConfig()
    const payload = buildSaveAddressPayload()

    try {
      saveAddressLoading.value = true
      await $fetch(`${daigoApiBase}/v1/auth/user/${auth.userId}/addresses`, {
        method: 'POST',
        body: payload,
        headers: getAuthHeaders(),
      })

      saveAddressMessage.value = 'Адрес сохранён.'
      try {
        await user.loadProfile()
      } catch {
        // Сохранение уже прошло успешно; обновление профиля не блокируем.
      }
      return true
    } catch (e: any) {
      saveAddressError.value = e?.data?.message || e?.message || 'Не удалось сохранить адрес.'
      return false
    } finally {
      saveAddressLoading.value = false
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

    if (!fn) {
      errors.recipient.first_name = 'Укажите имя'
    }
    if (!ln) {
      errors.recipient.last_name = 'Укажите фамилию'
    }
    if (!ph || ph.length !== 11) errors.recipient.phone_number = 'Укажите телефон (11 цифр)'
    if (!em || !isEmail(em)) errors.recipient.email = 'Введите корректный email'
    if (!city) errors.recipient.city = 'Укажите город'

    if (state.otherRecipientEnabled) {
      const on = (state.otherRecipientName || '').trim()
      const op = normalizePhoneDigits(state.otherRecipientPhone || '')
      const oe = (state.otherRecipientEmail || '').trim()
      if (!on) errors.other.name = 'Укажите ФИО другого получателя'
      if (!op || op.length !== 11) errors.other.phone = 'Укажите телефон другого получателя (11 цифр)'
      if (oe && !isEmail(oe)) errors.other.email = 'Email другого получателя некорректен'
    }

    const opt = deliveryOptions.value.find(o => o.id === state.deliveryId) || deliveryOptions.value[0]
    if (opt?.kind === 'courier' || opt?.kind === 'todoor') {
      const line = (state.address.address_line || '').trim()
      const street = (state.address.street || '').trim()
      if (!line && !street) errors.address.street = 'Укажите улицу'
      const house = (state.address.house || '').trim()
      if (!house) errors.address.house = 'Укажите дом'
      errors.address.pvzAddress = ''
    } else if (opt?.kind === 'pvz') {
      if (!state.address.cdekPvz?.code && !(state.address.pvzId || '').trim()) {
        errors.address.pvzAddress = 'Выберите пункт выдачи СДЭК'
      }
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

      const utm = buildUtmPayload()

      const payload = {
        daigo_id: auth.userId,
        bonuses_to_use: Number(state.bonuses_to_use || 0),
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
        items,
        ...(utm ? { utm } : {})
      }

// === YM goals: payment type (fires only when user clicked "Оформить заказ" and validation passed) ===
try {
  const analytics = useAnalytics()
  const pm = state.paymentMethod

  const goal =
    (pm === 'sbp' || pm === 'bank_card' || pm === 'tpay_card' || pm === 'tpay_qr')
      ? 'onlinepay'
      : (pm === 'courier_card' || pm === 'cash')
        ? 'offlinepay'
        : (pm === 'dolyame' || pm === 'tbank')
          ? 'paylater'
          : null

  if (goal) {
    analytics.reach(goal, {
      payment_method: pm,
      delivery_id: state.deliveryId || undefined
    })
  }
} catch {
  // no-op
}

      const res = await createOrder(payload as any)

      // === YM: ecommerce purchase ===

      const analytics = useAnalytics()

      try {
        const isSuccess = (res as any)?.status === 'success'
        const orderIdRaw = (res as any)?.order_id

        if (process.client && isSuccess) {
          if (!orderIdRaw) {
            console.warn('[analytics] purchase skipped: status=success but order_id is missing', res)
          } else {
            const orderId = String(orderIdRaw)
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
        }
      } catch {
        // no-op
      }

      // Никаких редиректов здесь больше нет
      const url = (res as any)?.confirmation?.confirmation_url || null

      // Возвращаем ответ + доп. поле confirmationUrl
      return {
        ...(res as any),
        confirmationUrl: url,
      }
    } catch (e: any) {
      console.warn('ORDER_SUBMIT_FAIL', e)
      // определяем stage ошибки для пользовательского сообщения
      if (!lastError.value) {
        const stage = (e as any)?.stage
        if (stage === 'order_placement') {
          // заказ создан, но не удалось оплатить
          lastError.value = 'Проблема с оплатой. Заказ создан, мы свяжемся с вами.'
        } else if (stage === 'order_creation') {
          // заказ не был создан
          lastError.value = 'Не удалось создать заказ, свяжитесь с менеджером.'
        } else {
          lastError.value = e?.message || 'Не удалось оформить заказ. Попробуйте позже.'
        }
      }
    }
  }

  return {
    // state
    state,
    deliveryOptions,
    savedAddresses,
    isApplyingSavedAddress,
    saveAddressLoading,
    saveAddressMessage,
    saveAddressError,
    pvzAddress,
    pickupAddress,
    pickupSchedule,

    // ошибки
    errors,
    lastError,

    // methods
    setAddress,
    setDelivery,
    setCdekPvz,
    applySavedAddress,
    saveCurrentAddress,
    loadOptions,
    submit
  }
})
