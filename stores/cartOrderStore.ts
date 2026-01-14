import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useCartStore } from '~/stores/cartStore'

// Типы для различных сущностей, используемых при оформлении заказа.
export type LoyaltyStatus = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'
export type DeliveryKind = 'courier' | 'pvz' | 'pickup'
export type PaymentMethod = 'installments' | 'card_online' | 'card_courier' | 'cash_courier' | 'credit'

/**
 * Описание товара в процессе оформления заказа. id строковый, чтобы
 * поддерживать как числовые, так и UUID-идентификаторы. qty — количество
 * единиц, price — цена за штуку, img — миниатюра, tag — флаг (например,
 * «Бесплатно» или «x2»).
 */
export interface CartItem {
  id: string
  title: string
  price: number
  qty: number
  img?: string
  tag?: string
}

/**
 * Получатель заказа. Для основного получателя email необязателен,
 * но может быть необходим на этапе оформления реального заказа.
 */
export interface Recipient {
  full_name: string
  phone_number: string
  email?: string
}

/**
 * Структура адреса доставки. Поддерживает как квартиры, так и
 * частные дома. Все поля, кроме city и street, необязательны.
 */
export interface Address {
  city: string
  street: string
  house?: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  private_house?: boolean
}

/**
 * Состояние корзины на этапе оформления заказа. Включает в себя
 * список товаров, параметры скидки, бонусные начисления, информацию
 * о промокоде, получателя и альтернативного получателя, способ доставки,
 * выбранную курьерскую службу, адрес, метод оплаты и стоимость доставки.
 */
export interface CartOrderState {
  items: CartItem[]
  discountPercent: number
  bonusesAccrue: number
  promoCode?: string | null
  recipient: Recipient
  orderForAnotherPerson: boolean
  altRecipient: Recipient | null
  deliveryKind: DeliveryKind
  courier: { daigo: boolean; major: boolean }
  address: Address
  payment: PaymentMethod | null
  deliveryPrice: number
}

export const useCartOrderStore = defineStore('cartOrder', () => {
  // Reactive состояние заказа. Используем ref, чтобы иметь доступ к
  // state.value, что упрощает работу с реактивными структурами и
  // позволяет присваивать новое значение целиком.
  const cartStore = useCartStore()

  const state = ref<CartOrderState>({
    items: [],
    discountPercent: 0,
    bonusesAccrue: 0,
    promoCode: null,
    recipient: { full_name: '', phone_number: '', email: '' },
    orderForAnotherPerson: false,
    altRecipient: { full_name: '', phone_number: '' },
    deliveryKind: 'courier',
    courier: { daigo: true, major: false },
    address: { city: '', street: '' },
    payment: null,
    deliveryPrice: 0,
  })

  // Количество единиц товаров в корзине (с учётом qty).
  const itemsCount = computed(() => state.value.items.reduce((s, i) => s + i.qty, 0))
  // Общая стоимость всех товаров без учёта доставки и скидки.
  const productsTotal = computed(() => state.value.items.reduce((s, i) => s + i.price * i.qty, 0))
  // Итоговая стоимость с учётом скидки и стоимости доставки.
  const total = computed(() => Number((cartStore as any).total || productsTotal.value))

  /**
   * Загрузка корзины с сервера. Этот метод можно вызывать при
   * переходе на страницу оформления заказа, чтобы получить актуальные
   * данные (список товаров, скидки, бонусы, стоимость доставки и т.д.).
   * Ожидает, что API /api/cart/get вернёт структуру аналогичную
   * стубовой реализации: { items, gifts, promo_notice }. Если API
   * содержит иные поля (например, бонусные баллы), их также следует
   * обработать и проставить в state.
   */
  async function loadCart() {
    try {
      // Используем единственный источник истины по корзине — cartStore (реальный бэкенд).
      await cartStore.loadCart()

      state.value.items = (cartStore.items || []).map((i: any) => ({
        id: String(i.id),
        title: i.title,
        price: Number(i.price || 0),
        qty: Number(i.quantity ?? i.qty ?? i.qty_order ?? i.qtyOrder ?? i.qty_in_cart ?? i.qtyInCart ?? i.qty ?? 1),
        img: i.image || i.img || i.picture || i.photo || undefined,
        tag: (i.tag || i.badge || i.label) ?? undefined,
      }))

      // Для совместимости оставляем discountPercent/deliveryPrice в состоянии, но расчёт total идёт из cartStore.total.
      state.value.discountPercent = 0
      state.value.deliveryPrice = 0
    } catch (e) {
      console.warn('Не удалось загрузить корзину для оформления заказа', e)
      state.value.items = []
      state.value.discountPercent = 0
      state.value.deliveryPrice = 0
    }
  }

  /**
   * Устанавливаем тип доставки и пересчитываем стоимость доставки
   * в зависимости от выбранного варианта и курьерской службы. В
   * реальном проекте этот метод может отправлять запрос к API для
   * получения стоимости доставки.
   */
  function setDeliveryKind(kind: DeliveryKind) {
    state.value.deliveryKind = kind
    // Пример: для курьерской доставки у Daigo — бесплатно, у стороннего курьера — 12500, остальные — бесплатно
    if (kind === 'courier') {
      state.value.deliveryPrice = state.value.courier.daigo ? 0 : 12500
    } else {
      state.value.deliveryPrice = 0
    }
  }

  /**
   * Переключает использование собственной курьерской службы Daigo или
   * сторонней. Гарантирует, что всегда выбран хотя бы один вариант.
   */
  function toggleCourier(which: 'daigo' | 'major', v: boolean) {
    state.value.courier[which] = v
    // Снимаем флаг у другой службы, если обе были выключены
    if (!state.value.courier.daigo && !state.value.courier.major) state.value.courier.daigo = true
    // Обновляем стоимость доставки
    setDeliveryKind('courier')
  }

  /**
   * Обновляет данные основного получателя заказа. Допускает передачу
   * частичных данных для обновления только отдельных полей.
   */
  function setRecipient(p: Partial<Recipient>) {
    state.value.recipient = { ...state.value.recipient, ...p }
  }
  /**
   * Обновляет данные альтернативного получателя (если заказ оформляется
   * на другого человека). Если altRecipient ранее был null, создаём
   * объект по умолчанию.
   */
  function setAltRecipient(p: Partial<Recipient>) {
    state.value.altRecipient = {
      ...(state.value.altRecipient || { full_name: '', phone_number: '', email: '' }),
      ...p,
    }
  }
  /**
   * Обновляет адрес доставки. Допускает передачу частичных данных.
   */
  function setAddress(p: Partial<Address>) {
    state.value.address = { ...state.value.address, ...p }
  }

  /**
   * Применяет промокод к корзине. Сначала сохраняет введённый код в
   * состоянии, затем отправляет запрос на сервер. В ответе ожидается,
   * что сервер вернёт объект promo_notice или поля со скидкой. При
   * успешной обработке скидка обновляется. В противном случае скидка
   * сбрасывается в ноль. Возвращается успех или ошибка.
   */
  async function applyPromo(code: string) {
    state.value.promoCode = code
    try {
      const res: any = await $fetch('/api/cart/apply-coupon', {
        method: 'POST',
        body: { code },
      })
      if (res && res.success && res.promo_notice) {
        // Если сервер вернул скидку, устанавливаем её в процентах
        if (res.promo_notice.discount) state.value.discountPercent = res.promo_notice.discount
        // Дополнительно можно сохранять название промокода (res.promo_notice.couponName)
        return { success: true }
      }
      // Если промокод недействителен — сбрасываем скидку и возвращаем false
      state.value.discountPercent = 0
      return { success: false, message: res?.message || 'Промокод недействителен' }
    } catch (e: any) {
      state.value.discountPercent = 0
      return { success: false, message: e?.message || 'Ошибка применения промокода' }
    }
  }

  /**
   * Отправляет заказ на сервер. Сериализует текущее состояние state
   * (включая список товаров) и отправляет POST-запрос на API /api/checkout/submit.
   * Ожидается, что сервер вернёт идентификатор заказа. При ошибке
   * вызывающий код должен обработать исключение или сообщение об ошибке.
   */
  async function submitOrder() {
    const payload = { ...state.value, items: state.value.items }
    // В данном примере предполагаем, что endpoint возвращает объект с
    // полем order_id. В реальной реализации структура может отличаться.
    return await $fetch<{ order_id: string }>('/api/checkout/submit', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    state,
    itemsCount,
    productsTotal,
    total,
    loadCart,
    setDeliveryKind,
    toggleCourier,
    setRecipient,
    setAltRecipient,
    setAddress,
    applyPromo,
    submitOrder,
  }
})