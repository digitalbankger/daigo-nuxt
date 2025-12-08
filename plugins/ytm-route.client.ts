// plugins/ytm-route.client.ts
import { defineNuxtPlugin, useRouter } from '#imports'
import { useYtm } from '@/composables/useYtm'
import { useUserStore } from '@/stores/userStore'
import type { UserObject } from '@/types/ytm'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const ytm = useYtm()
  const userStore = useUserStore()

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
    if (path.startsWith('/order')) return 'checkout'
    if (path.startsWith('/articles')) return 'content'
    if (path.startsWith('/akcii')) return 'promolist'
    return 'other'
  }

  router.afterEach(to => {
    const page_type = mapPageType(to.path)

    const user: UserObject = userStore?.profile?.id
      ? {
          user_id: String(userStore.profile.id),
          user_type: 'user'
        }
      : {
          user_type: 'guest'
        }

    ytm.setPageType(page_type, { user })
  })
})
