export default defineNuxtRouteMiddleware((to) => {
  const source = to.query.utm_source
  const medium = to.query.utm_medium
  const campaign = to.query.utm_campaign
  const content = to.query.utm_content
  const term = to.query.utm_term

  // ?utm_source=vip+card&utm_medium=offline&utm_campaign=art+catalogue+card&utm_content=vip&utm_term=vip
  const isVipLanding =
    source === 'vip card' &&           // 'vip+card' в URL → 'vip card' после декодинга
    medium === 'offline' &&
    campaign === 'art catalogue card' &&
    content === 'vip' &&
    term === 'vip'

  if (!isVipLanding) return

  // помечаем, что это переход с VIP-карты
  const vipCookie = useCookie<string | null>('vip_from_card', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  })

  vipCookie.value = '1'

  // всегда ведём в личный кабинет, НО сохраняем query (UTM)
  if (to.path !== '/profile') {
    return navigateTo({
      path: '/profile',
      query: to.query, // <-- UTM остаются в адресе
    })
  }
})
