// plugins/ytm-route.client.ts
import { defineNuxtPlugin, useRouter } from '#imports'
import { useYtm } from '@/composables/useYtm'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const ytm = useYtm()

  const mapPageType = (path: string): string => {
    if (path === '/' || path.startsWith('/index')) return 'home'

    // product проверяем ПЕРВЫМ (иначе всегда попадёт в category)
    if (/^\/catalog\/[^/]+$/.test(path)) return 'product'

    if (
      path.startsWith('/catalog') ||
      path.startsWith('/aminobiotics') ||
      path.startsWith('/plasmalogens')
    ) {
      return 'category'
    }

    if (path.startsWith('/cart')) return 'cart'
    if (path.startsWith('/order') || path.startsWith('/checkout')) return 'checkout'
    if (path.startsWith('/articles')) return 'content'
    if (path.startsWith('/akcii')) return 'promolist'
    if (path.startsWith('/otzyvy')) return 'reviews'
    if (path.startsWith('/contacts')) return 'contacts'
    return 'other'
  }

  const send = (path: string) => {
    const page_type = mapPageType(path)

    // дедуп: чтобы не слать повторно на тот же url
    try {
      const key = 'ytm_last_view_page'
      const last = sessionStorage.getItem(key)
      const next = `${location.pathname}${location.search}`
      if (last === next) return
      sessionStorage.setItem(key, next)
    } catch {
      // ignore
    }

    ytm.setPageType(page_type)
  }

  // initial
  if (process.client) {
    send(location.pathname)
  }

  router.afterEach(to => {
    if (!process.client) return
    send(to.path)
  })
})
