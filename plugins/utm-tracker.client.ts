import { trackUtmFromQuery } from '@/composables/useUtmTracker'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const router = useRouter()

  router.afterEach((to) => {
    trackUtmFromQuery(to.query)
  })
})
