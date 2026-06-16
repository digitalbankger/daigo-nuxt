import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchOrderHistory, cancelOrder } from '~/services/orderService'
import type { OrderHistoryApiItem, OrderListItem, OrderCancelReason } from '~/types/orders'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

const API_HOST = (path: string) => {
  const url = normalizeMediaUrl(path)
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/media-s3/') || url.startsWith('/images/') || url.startsWith('/icons/')) return url
  return `https://api.daigo.ru${url.startsWith('/') ? url : `/${url}`}`
}

export const useOrderStore = defineStore('orderStore', () => {
  const orders = ref<OrderListItem[]>([])
  const isLoading = ref(false)
  const error = ref<unknown>(null)

  async function loadOrderHistory() {
    const user = useUserStore()
    const auth = useAuthStore()

    const daigoId =
      auth.userId ??
      (user.profile as any)?.daigo_id ??
      (user.profile as any)?.id ??
      null

    if (!daigoId) {
      console.warn('[orders] daigoId not found (auth.userId/profile.daigo_id)')
      orders.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const raw = await fetchOrderHistory(Number(daigoId)) as any

      const list: OrderHistoryApiItem[] =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.orders) ? raw.orders :
        []

      console.debug('[orders] raw length:', Array.isArray(raw) ? raw.length : 'object', raw)

      const catalog = useCatalogStore()
      if (!catalog.products?.length && typeof catalog.fetchProducts === 'function') {
        try { await catalog.fetchProducts({}) } catch {}
      }

      orders.value = transformOrders(list, catalog)
      console.debug('[orders] mapped length:', orders.value.length, orders.value)
    } catch (e) {
      error.value = e
      console.error('[orderStore] loadOrderHistory error', e)
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  function transformOrders(data: OrderHistoryApiItem[], catalog?: any): OrderListItem[] {
    return (data || []).map((entry) => {
      const itemIds: number[] =
        entry.ItemIDs ??
        (entry as any).item_ids ??
        ((entry as any).items ? ((entry as any).items as any[]).map(i => i.product_id ?? i.id).filter(Boolean) : []) ??
        []

        const mapped = itemIds.map((id) => {
        const p = catalog?.products?.find((x: any) => {
          const a = String(x.product_id ?? x.id)
          const b = String(id)
          return a === b
        })
        const firstImage =
          p?.images?.[0]?.image_url ||
          p?.image ||
          p?.images?.[0] ||
          null

        return {
          id,
          name: p?.name || 'Товар',
          image: firstImage ? API_HOST(firstImage) : '/images/placeholder-product.webp',
          quantity: 1
        }
      })

      const number = String(entry.order_id ?? (entry as any).id ?? 0).padStart(8, '0')
      const date = formatDate(entry.order_date as any)

      return {
        id: (entry as any).history_id ?? (entry as any).id ?? Number(entry.order_id) ?? Math.random(),
        order_id: Number(entry.order_id ?? (entry as any).order_id ?? 0) || undefined,
        number,
        date,
        // статус может приходить под разными ключами в зависимости от версии бэка
        status:
          (entry as any).status ??
          (entry as any).order_status ??
          (entry as any).orderStatus ??
          (entry as any).state ??
          (entry as any).status_code ??
          (entry as any).statusCode ??
          'processing',
        total: Number((entry as any).total_amount ?? (entry as any).total ?? 0),
        bonus: (entry as any).bonus ?? null,
        items: mapped,
        confirmationUrl: (entry as any).confirmation_url ?? null
      }
    })
  }

  function formatDate(s?: string) {
    if (!s) return ''
    let d: Date
    if (/\d{4}-\d{2}-\d{2}/.test(s)) d = new Date(s)
    else if (/\d{2}\.\d{2}\.\d{4}/.test(s)) {
      const [dd, mm, yyyy] = s.split('.')
      d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    } else d = new Date(s)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  async function cancel(
    orderNumberOrId: number | string,
    reason: OrderCancelReason,
    comment?: string
  ) {
    const numericId = typeof orderNumberOrId === 'string'
      ? Number(orderNumberOrId.replace(/^0+/, ''))
      : orderNumberOrId

    await cancelOrder(numericId, reason, comment)
    await loadOrderHistory()
  }

  return { orders, isLoading, error, loadOrderHistory, cancel }
})
