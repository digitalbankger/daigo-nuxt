import { computed, toValue, watch, onBeforeUnmount, type MaybeRefOrGetter } from 'vue'
import type { Product } from '~/types/product'

type Id = string | number
type IdsSrc = MaybeRefOrGetter<Id[] | undefined>

export function useProductsByIds(idsSource: IdsSrc) {
  const items = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)

  let abortCtrl: AbortController | null = null

  const normalizedIds = computed<string[]>(() =>
    (toValue(idsSource) ?? []).map(String).filter(Boolean)
  )

  async function load() {
    items.value = []
    error.value = null
    if (!normalizedIds.value.length) return

    try { abortCtrl?.abort() } catch {}
    abortCtrl = new AbortController()
    loading.value = true
    try {
      const data = await $fetch<{ items: Product[] }>('/api/shop/products', {
        query: { ids: normalizedIds.value.join(',') },
        signal: abortCtrl.signal
      })
      items.value = data?.items ?? []
    } catch (e: any) {
      if (e?.name !== 'AbortError') error.value = e
    } finally {
      loading.value = false
    }
  }

  watch(normalizedIds, load, { immediate: true })
  onBeforeUnmount(() => { try { abortCtrl?.abort() } catch {} })

  return { items, loading, error, reload: load }
}
