import { defineNuxtPlugin, useRouter } from '#imports'
import { useYtm } from '@/composables/useYtm'
import { useUserStore } from '@/stores/userStore'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const ytm = useYtm()
  const userStore = useUserStore()

  const mapPageType = (path: string): string => {
    if (path === '/' || path.startsWith('/index')) return 'home'
    if (path.startsWith('/catalog') || path.startsWith('/aminobiotics') || path.startsWith('/plasmalogens')) return 'category'
    if (/^\/catalog\/[^/]+$/.test(path)) return 'product'
    if (path.startsWith('/cart')) return 'cart'
    if (path.startsWith('/order')) return 'checkout'
    if (path.startsWith('/articles')) return 'content'
    return 'other'
  }

  router.afterEach(to => {
    const page_type = mapPageType(to.path)
    const user = userStore?.profile?.id ? { id: String(userStore.profile.id), type: 'user' as const } : { type: 'guest' as const }
    ytm.setPageType(page_type, { user })
  })
})
