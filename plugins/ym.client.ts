import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const { public: { ymCounterId } } = useRuntimeConfig()
  const counterId = Number(ymCounterId)
  const hasCounter = Number.isFinite(counterId) && counterId > 0
  if (!hasCounter) {
    console.warn('[YM] counter id is missing or invalid')
    return
  }

  // dataLayer (для ecommerce)
  ;(window as any).dataLayer = (window as any).dataLayer || []

  // shim ym и грузим скрипт без IIFE — для TS
  const w = window as any
  if (typeof w.ym !== 'function') {
    const ymQueue: any[] = []
    w.ym = (...args: any[]) => { ymQueue.push(args) }
    ;(w.ym as any).a = ymQueue
    ;(w.ym as any).l = Date.now()
  }

  if (!document.getElementById('ym-tag')) {
    const s = document.createElement('script')
    s.id = 'ym-tag'
    s.async = true
    s.src = 'https://mc.yandex.ru/metrika/tag.js'
    document.head.appendChild(s)
  }

  // Инициализируем
  w.ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer, 
    url: location.href, 
  })

  // SPA-хиты
  const router = useRouter()
  const sendHit = () => {
    const rt = router.currentRoute.value
    queueMicrotask(() => {
      w.ym(counterId, 'hit', rt.fullPath, { title: document.title })
    })
  }

  sendHit()
  router.afterEach(() => sendHit())

  // Клики по тел:
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null
    if (!a) return
    const isHeader = a.dataset.ym === 'header-phone'
    w.ym(counterId, 'reachGoal', isHeader ? 'header_phone_click' : 'call_click')
  }
  document.addEventListener('click', onClick, { capture: true })

  // форымы
  const onFormSuccess = (ev: Event) => {
    const detail = (ev as CustomEvent).detail || {}
    w.ym(counterId, 'reachGoal', 'form_submit', { form: detail?.name || detail?.form || 'unknown' })
  }
  window.addEventListener('form:success', onFormSuccess)

  // чистка слушателей хуком ()
  // window.addEventListener('beforeunload', () => {
  //   document.removeEventListener('click', onClick, { capture: true } as any)
  //   window.removeEventListener('form:success', onFormSuccess as any)
  // })
})
