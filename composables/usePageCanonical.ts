import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useHead, useRoute } from '#imports'

const SITE_ORIGIN = 'https://daigo.ru'

function normalizeCanonicalPath(rawPath: string) {
  const withLeadingSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  if (withLeadingSlash === '/') return '/'
  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

/**
 * Adds one clean self-canonical URL and a matching og:url.
 * Query/hash are intentionally excluded from the canonical.
 */
export function usePageCanonical(path?: MaybeRefOrGetter<string | undefined>) {
  const route = useRoute()

  const canonical = computed(() => {
    const requested = path ? toValue(path) : route.path
    const cleanPath = normalizeCanonicalPath(String(requested || route.path || '/'))
    return `${SITE_ORIGIN}${cleanPath}`
  })

  useHead(() => ({
    link: [
      { key: 'canonical', rel: 'canonical', href: canonical.value },
    ],
    meta: [
      { key: 'og:url', property: 'og:url', content: canonical.value },
    ],
  }))

  return canonical
}
