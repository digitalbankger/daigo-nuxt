import { computed } from 'vue'

export function useReviewModal() {
  const route = useRoute()
  const router = useRouter()

  const openedId = computed(() => {
    const r = route.query.review
    return Array.isArray(r) ? r[0] : r || null
  })

  function open(id: string) {
    router.push({ query: { ...route.query, review: id } })
  }
  function close() {
    const { review, ...rest } = route.query
    router.push({ query: { ...rest } })
  }

  return { openedId, open, close }
}
