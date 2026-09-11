import { trackUtmAuto } from '@/composables/useUtmTracker'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const router = useRouter()
  const route = useRoute()

  // afterEach не гарантирует обработку уже завершившейся первоначальной
  // навигации, поэтому сохраняем источник сразу при инициализации плагина.
  trackUtmAuto(route.query)

  router.afterEach((to) => {
    trackUtmAuto(to.query)
  })
})
