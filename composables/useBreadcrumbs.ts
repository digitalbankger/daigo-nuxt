import { computed, unref } from 'vue'
import { useRoute } from '#imports'

export type Crumb = { label: string; to?: string }

type Category = { slug: string; name: string }
type ProductLike = {
  slug: string
  title: string
  // Массив от корня к листу: [/catalog], [/catalog/food], [/catalog/food/snacks]
  categoriesPath?: Category[]
}

export function useBreadcrumbs(productRef: any, baseCatalogPath = '/catalog') {
  const route = useRoute()

  const breadcrumbs = computed<Crumb[]>(() => {
    const product: ProductLike | undefined = unref(productRef) || undefined
    const crumbs: Crumb[] = [
      { label: 'Главная', to: '/' },
      { label: 'Каталог', to: baseCatalogPath },
    ]

    // если у товара есть путь категорий — собираем цепочку
    if (product?.categoriesPath?.length) {
      let acc = baseCatalogPath.replace(/\/$/, '')
      for (const c of product.categoriesPath) {
        acc += `/${encodeURIComponent(c.slug)}`
        crumbs.push({ label: c.name, to: acc })
      }
    }

    // последним — сам товар (без ссылки)
    if (product) crumbs.push({ label: product.title })

    // Фолбэк: если зашли не на товар (на всякий)
    if (!product && route?.params?.slug) {
      crumbs.push({ label: String(route.params.slug) })
    }
    return crumbs
  })

  // JSON-LD для SEO
  const jsonLd = computed(() => {
    const items = breadcrumbs.value.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: c.to
        ? { '@id': c.to, name: c.label }
        : { name: c.label },
    }))
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    }
  })

  return { breadcrumbs, jsonLd }
}
