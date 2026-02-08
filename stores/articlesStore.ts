import { defineStore } from 'pinia'
import type {
  ArticleListItem,
  ArticleDetail,
  ArticleComment,
  ArticleFAQ,
  Paged
} from '~/types/articles'
import type { FilterGroup } from '~/types/filter'
import type { ProductMini } from '~/types/product'

type LoadingMap = Record<string, boolean | undefined>
type ErrorMap = Record<string, string | null | undefined>

const TTL = 60_000 // 60s: клиентский кэш (серверное кеширование на ручках отдельно)

export const useArticlesStore = defineStore('articles', () => {
  // list
  const list = ref<ArticleListItem[]>([])
  const page = ref(1)
  const perPage = 15
  const totalPages = ref(1)

  // filters + counts
  const filters = ref<FilterGroup[]>([])
  const counts = ref<Record<string, number>>({})

  // detail cache
  const detailBySlug = ref<Record<string, { data: ArticleDetail; ts: number }>>({})
  const relatedBySlug = ref<Record<string, { data: ArticleListItem[]; ts: number }>>({})
  const faqBySlug = ref<Record<string, { data: ArticleFAQ[]; ts: number }>>({})
  const commentsBySlug = ref<Record<string, { data: ArticleComment[]; ts: number }>>({})
  const bundledBySlug = ref<Record<string, { data: ProductMini[]; ts: number }>>({})
  const topFive = ref<ArticleListItem[] | null>(null)

  // loading & errors
  const loading: LoadingMap = reactive({})
  const errors: ErrorMap = reactive({})

  // alias для обратной совместимости (страница читает articlesStore.articles)
  const articles = computed(() => list.value)

  function setLoading(key: string, val: boolean) {
    loading[key] = val
  }
  function setError(key: string, msg: string | null) {
    errors[key] = msg
  }
  function isFresh(entryTs?: number) {
    return !!entryTs && Date.now() - entryTs < TTL
  }

  function setPage(val: number) { page.value = val }

  // утилита: очистка пустых query-параметров
  function cleanQuery(obj: Record<string, string> = {}) {
    return Object.fromEntries(
      Object.entries(obj).filter(([k, v]) => k === 'page' || (typeof v === 'string' && v.trim() !== ''))
    )
  }

  // LIST
  async function fetchArticles(query: Record<string, string>) {
    const key = 'list'
    try {
      setLoading(key, true)
      const cleaned = cleanQuery(query)
      const response = await $fetch<any>('/api/articles', { query: cleaned })
      const items = response?.items ?? response?.data ?? (Array.isArray(response) ? response : [])
      const total = response?.total ?? response?.count ?? items.length

      list.value = Array.isArray(items) ? items : []
      totalPages.value = Math.max(1, Math.ceil(Number(total) / perPage))
      setError(key, null)
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch articles')
    } finally {
      setLoading(key, false)
    }
  }

  // FILTERS + COUNTS
  async function fetchFilters() {
    const key = 'filters'
    try {
      setLoading(key, true)
      const result = await $fetch<FilterGroup[]>('/api/shop/filters')
      filters.value = result || []
      setError(key, null)
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch filters')
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchCounts(baseQuery: Record<string, string[]> = {}) {
    const key = 'counts'
    try {
      setLoading(key, true)

      const q: Record<string, string> = {}
      for (const [k, v] of Object.entries(baseQuery)) {
        if (Array.isArray(v) && v.length) q[k] = v.join(',')
      }

      const { counts: result } = await $fetch<{ counts: Record<string, number> }>('/api/articles/counts', { query: q })
      counts.value = result || {}

      setError(key, null)
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch counts')
    } finally {
      setLoading(key, false)
    }
  }

  // DETAIL
  async function fetchArticle(slug: string, force = false) {
    const key = `detail:${slug}`
    if (!force && isFresh(detailBySlug.value[slug]?.ts)) return detailBySlug.value[slug].data
    try {
      setLoading(key, true)
      const data = await $fetch<ArticleDetail>(`/api/articles/${slug}`)
      detailBySlug.value[slug] = { data, ts: Date.now() }
      setError(key, null)
      return data
    } catch (e: any) {
      setError(key, e?.statusMessage || e?.message || 'Failed to fetch article')
      throw e
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchRelated(slug: string, force = false) {
    const key = `related:${slug}`
    if (!force && isFresh(relatedBySlug.value[slug]?.ts)) return relatedBySlug.value[slug].data
    try {
      setLoading(key, true)
      const { items } = await $fetch<Paged<ArticleListItem>>('/api/articles/related', { query: { slug } })
      const data = items || []
      relatedBySlug.value[slug] = { data, ts: Date.now() }
      setError(key, null)
      return data
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch related')
      return []
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchFaq(slug: string, force = false) {
    const key = `faq:${slug}`
    if (!force && isFresh(faqBySlug.value[slug]?.ts)) return faqBySlug.value[slug].data
    try {
      setLoading(key, true)
      const data = await $fetch<ArticleFAQ[]>('/api/articles/faq', { query: { slug } })
      faqBySlug.value[slug] = { data, ts: Date.now() }
      setError(key, null)
      return data
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch faq')
      return []
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchTop(force = false) {
    const key = 'top'
    if (!force && topFive.value?.length) return topFive.value
    try {
      setLoading(key, true)
      const { items } = await $fetch<Paged<ArticleListItem>>('/api/articles/top')
      topFive.value = items || []
      setError(key, null)
      return topFive.value
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch top')
      return []
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchComments(slug: string, force = false) {
    const key = `comments:${slug}`
    if (!force && isFresh(commentsBySlug.value[slug]?.ts)) return commentsBySlug.value[slug].data
    try {
      setLoading(key, true)
      const data = await $fetch<ArticleComment[]>('/api/articles/comments', { query: { slug } })
      commentsBySlug.value[slug] = { data, ts: Date.now() }
      setError(key, null)
      return data
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch comments')
      return []
    } finally {
      setLoading(key, false)
    }
  }

  async function addComment(slug: string, message: string, name?: string) {
    const key = `comments:add:${slug}`
    try {
      setLoading(key, true)
      const { comment } = await $fetch<{ ok: true; comment: ArticleComment }>('/api/articles/comments', {
        method: 'POST',
        body: { slug, message, name }
      })
      const current = commentsBySlug.value[slug]?.data ?? []
      commentsBySlug.value[slug] = { data: [comment, ...current], ts: Date.now() }
      setError(key, null)
      return comment
    } catch (e: any) {
      setError(key, e?.message || 'Failed to add comment')
      throw e
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchBundledProducts(slug: string, force = false) {
    const key = `bundled:${slug}`
    if (!force && isFresh(bundledBySlug.value[slug]?.ts)) return bundledBySlug.value[slug].data
    try {
      setLoading(key, true)
      // исправлен путь: /api/products/bundled
      const data = await $fetch<ProductMini[]>('/api/products/bundled', { query: { slug } })
      bundledBySlug.value[slug] = { data, ts: Date.now() }
      setError(key, null)
      return data
    } catch (e: any) {
      setError(key, e?.message || 'Failed to fetch bundled products')
      return []
    } finally {
      setLoading(key, false)
    }
  }

  function invalidate(slug?: string) {
    if (slug) {
      delete detailBySlug.value[slug]
      delete relatedBySlug.value[slug]
      delete faqBySlug.value[slug]
      delete commentsBySlug.value[slug]
      delete bundledBySlug.value[slug]
    } else {
      detailBySlug.value = {}
      relatedBySlug.value = {}
      faqBySlug.value = {}
      commentsBySlug.value = {}
      bundledBySlug.value = {}
      topFive.value = null
    }
  }

  return {
    // state
    list,
    articles, // алиас
    page,
    perPage,
    totalPages,
    filters,
    counts,
    detailBySlug,
    relatedBySlug,
    faqBySlug,
    commentsBySlug,
    bundledBySlug,
    topFive,
    loading,
    errors,

    // actions
    setPage,
    fetchArticles,
    fetchFilters,
    fetchCounts,
    fetchArticle,
    fetchRelated,
    fetchFaq,
    fetchTop,
    fetchComments,
    addComment,
    fetchBundledProducts,
    invalidate
  }
})
