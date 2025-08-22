import { defineStore } from 'pinia'
import type {
  CheckoutState,
  CheckoutSummary,
  DeliveryOption,
  PaymentMethod,
  Address,
  Recipient,
} from '~/types/checkout'

export const useCheckoutStore = defineStore('checkout', () => {
  const state = ref<CheckoutState>({
    recipient: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
    },
    address: { city: '', street: '', private_house: false },
    deliveryId: null,
    payment: null,
    comment: '',
    orderForAnotherPerson: false,
  })

  const deliveryOptions = ref<DeliveryOption[]>([])
  const summary = ref<CheckoutSummary>({
    itemsCount: 0,
    productsTotal: 0,
    deliveryPrice: 0,
    discountPercent: 0,
    bonusesAccrue: 0,
    total: 0,
  })

  async function loadOptions() {
    const data = await $fetch<{ delivery: DeliveryOption[]; summary: CheckoutSummary }>(
      '/api/checkout/options'
    )
    deliveryOptions.value = data.delivery
    summary.value = data.summary
    if (!state.value.deliveryId && deliveryOptions.value.length) {
      state.value.deliveryId = deliveryOptions.value[0].id
    }
  }

  function setRecipient(payload: Partial<Recipient>) {
    state.value.recipient = { ...state.value.recipient, ...payload }
  }

  function setAddress(payload: Partial<Address>) {
    state.value.address = { ...state.value.address, ...payload }
  }

  function setDelivery(id: string) {
    state.value.deliveryId = id
    const opt = deliveryOptions.value.find(o => o.id === id)
    summary.value.deliveryPrice = opt ? opt.price : 0
    recalc()
  }

  function setPayment(method: PaymentMethod) {
    state.value.payment = method
  }

  function setComment(comment: string) {
    state.value.comment = comment
  }

  function toggleOrderForAnotherPerson(val: boolean) {
    state.value.orderForAnotherPerson = val
  }

  function recalc() {
    const productsMinusDiscount = Math.round(
      summary.value.productsTotal * (1 - summary.value.discountPercent / 100)
    )
    summary.value.total = productsMinusDiscount + summary.value.deliveryPrice
  }

  async function submit() {
    const res = await $fetch<{ order_id: string }>(
      '/api/checkout/submit',
      { method: 'POST', body: state.value }
    )
    return res
  }

  return {
    state,
    deliveryOptions,
    summary,
    loadOptions,
    setRecipient,
    setAddress,
    setDelivery,
    setPayment,
    setComment,
    toggleOrderForAnotherPerson,
    recalc,
    submit,
  }
})
