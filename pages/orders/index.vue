<script setup lang="ts">
definePageMeta({ layout: 'main', ssr: false })

import { onMounted, computed, ref } from 'vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useOrderStore } from '@/stores/orderStore'
import { statusLabel } from '@/composables/useOrderStatus'
import { ORDER_CANCEL_REASONS, type OrderCancelReason } from '~/types/orders'

const store = useOrderStore()
const busyId = ref<number | string | null>(null)

onMounted(() => { store.loadOrderHistory() })

const orders = computed(() => store.orders)
const isLoading = computed(() => store.isLoading)
const hasData = computed(() => !isLoading.value && orders.value.length > 0)

// ---- состояние модалки отмены ----
const showCancelModal = ref(false)
const cancelOrderId = ref<number | string | null>(null)
const selectedReason = ref<OrderCancelReason | null>(null)
const otherComment = ref('')
const isSubmittingCancel = ref(false)

/** Достаём числовой «номер заказа» для сортировки */
const orderNo = (o: any): number => {
  if (typeof o?.order_id === 'number') return o.order_id
  const raw = o?.number ?? o?.orderNumber ?? o?.order_no
  if (raw != null) {
    const n = parseInt(String(raw).replace(/\D/g, ''), 10)
    if (!Number.isNaN(n)) return n
  }
  if (typeof o?.id === 'number') return o.id
  return 0
}

/** Обратная сортировка по номеру: больше → выше */
const sortedOrders = computed(() =>
  [...orders.value].sort((a, b) => orderNo(b) - orderNo(a))
)

function fmtPrice(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

const isOtherReason = computed(() => selectedReason.value === 'other')

const canSubmitCancel = computed(() => {
  if (!cancelOrderId.value || !selectedReason.value) return false
  if (isOtherReason.value && !otherComment.value.trim()) return false
  return true
})

function openCancelModal(o: any) {
  const idForApi = o.order_id ?? o.id ?? o.number
  cancelOrderId.value = idForApi
  selectedReason.value = null
  otherComment.value = ''
  showCancelModal.value = true
}

// старая cancelOrder переименуем в confirmCancel
async function confirmCancel() {
  if (!canSubmitCancel.value || !cancelOrderId.value || !selectedReason.value) return

  try {
    isSubmittingCancel.value = true
    const id = cancelOrderId.value
    // для busyId используем тот же id, что и раньше
    busyId.value = id
    await store.cancel(
      id,
      selectedReason.value,
      isOtherReason.value ? otherComment.value.trim() : undefined
    )
    closeCancelModal()
  } catch (e) {
    alert((e as Error).message || 'Не удалось отменить заказ')
  } finally {
    isSubmittingCancel.value = false
    busyId.value = null
  }
}

function closeCancelModal() {
  showCancelModal.value = false
  cancelOrderId.value = null
}
</script>

<template>
  <BaseContainer>
    <section class="py-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6 text-lg">
        <img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> Вернуться назад
      </NuxtLink>

      <h1 class="text-[clamp(2.2rem,6vw,3.6rem)] font-medium mb-2">История заказов</h1>

      <div v-if="isLoading" class="text-gray-500">Загружаем заказы…</div>
      <div v-else-if="!hasData" class="text-gray-500">Заказов пока нет.</div>

      <div v-else class="space-y-6">
        <article
          v-for="o in sortedOrders"
          :key="o.id ?? o.order_id ?? o.number"
          class="flex flex-col gap-4 bg-white py-10 border-b border-gray-200"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-xl font-medium">Заказ от {{ o.date }}</div>
            <div class="text-primary px-4 py-2 border border-primary rounded-lg capitalize">
              <span>Статус: {{ statusLabel(o.status) }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div class="text-lg">№ {{ o.number ?? o.order_id }}</div>
            <div class="text-lg">Товаров: {{ Array.isArray(o.items) ? o.items.length : (o.item_count ?? 0) }}</div>
            <div class="text-2xl font-medium">Сумма {{ fmtPrice(o.total ?? o.total_amount) }}</div>
            <div v-if="o.bonus != null" class="text-primary">Бонусов начислено: {{ o.bonus }}</div>
          </div>

          <div class="flex gap-3 overflow-x-auto py-2" v-if="Array.isArray(o.items) && o.items.length">
            <div
              v-for="it in o.items"
              :key="it.id"
              class="w-[84px] h-[84px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
            >
              <img :src="it.image" :alt="it.name" class="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <NuxtLink
              v-if="o.confirmationUrl || o.confirmation_url"
              :to="o.confirmationUrl || o.confirmation_url"
              class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Оплатить / Подтвердить
            </NuxtLink>

            <button
              class="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50"
              :disabled="['delivered','canceled','failed','payment_received'].includes(o.status) || busyId===(o.id ?? o.order_id ?? o.number)"
              @click="openCancelModal(o)"
            >
              {{ busyId===(o.id ?? o.order_id ?? o.number) ? 'Отменяем…' : 'Отменить заказ' }}
            </button>

          </div>
        </article>
      </div>
    </section>

    <!-- Модалка отмены заказа -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 class="text-2xl font-medium">
          Отмена заказа
        </h2>

        <p class="text-sm text-gray-600">
          Пожалуйста, выберите причину отмены:
        </p>

        <div class="space-y-3">
          <label
            v-for="reason in ORDER_CANCEL_REASONS"
            :key="reason.value"
            class="flex items-start gap-2 cursor-pointer"
          >
            <input
              type="radio"
              class="mt-1"
              :value="reason.value"
              v-model="selectedReason"
              :disabled="isSubmittingCancel"
            />
            <span class="text-sm">
              {{ reason.label }}
            </span>
          </label>
        </div>

        <div v-if="isOtherReason" class="space-y-2">
          <label class="text-sm text-gray-700">
            Уточните причину
          </label>
          <textarea
            v-model="otherComment"
            rows="3"
            class="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            :disabled="isSubmittingCancel"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="text-sm px-3 py-2 rounded-lg border hover:bg-hoverbtn transition"
            :disabled="isSubmittingCancel"
            @click="closeCancelModal"
          >
            Отмена
          </button>

          <button
            type="button"
            class="text-sm px-4 py-2 rounded-lg bg-primary hover:bg-hoverbtn hover:text-black transition text-white disabled:bg-gray-400"
            :disabled="!canSubmitCancel || isSubmittingCancel"
            @click="confirmCancel"
          >
            <span v-if="!isSubmittingCancel">Подтвердить</span>
            <span v-else>Отправка…</span>
          </button>
        </div>
      </div>
    </div>
  </BaseContainer>
</template>
