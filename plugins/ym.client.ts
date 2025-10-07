// plugins/ym.client.ts
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'

// ВАЖНО: не дублируем глобальные типы, если они уже есть в types/analytics.d.ts.
// Если нет — можно раскомментировать блок ниже и он не будет конфликтовать.
// declare global {
//   interface Window {
//     ym?: (id: number, method: string, ...rest: any[]) => void
//     dataLayer?: any[] // делаем опциональным, чтобы не конфликтовать
//   }
// }

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const { public: { ymCounterId } } = useRuntimeConfig()
  const counterId = Number(ymCounterId)
  const hasCounter = Number.isFinite(counterId) && counterId > 0
  if (!hasCounter) {
    console.warn('[YM] counter id is missing or invalid')
    return
  }

  // 1) Гарантируем наличие dataLayer (для ecommerce)
  ;(window as any).dataLayer = (window as any).dataLayer || []

  // 2) Ставим shim ym и грузим скрипт без IIFE — проще и безопаснее для TS
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

  // 3) Инициализируем счётчик (ecommerce через dataLayer)
  w.ym(counterId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    defer: true,
    trackHash: true,
    webvisor: true,
    ecommerce: 'dataLayer',
  })

  // 4) SPA-хиты — берём роутер правильно
  const router = useRouter()
  const sendHit = () => {
    const rt = router.currentRoute.value
    queueMicrotask(() => {
      w.ym(counterId, 'hit', rt.fullPath, { title: document.title })
    })
  }

  // первый hit после монтирования страницы
  sendHit()
  // и все последующие после навигации
  router.afterEach(() => sendHit())

  // 5) Клики по tel:
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null
    if (!a) return
    // пометь ссылку в хедере: <a href="tel:+7..." data-ym="header-phone">
    const isHeader = a.dataset.ym === 'header-phone'
    w.ym(counterId, 'reachGoal', isHeader ? 'header_phone_click' : 'call_click')
  }
  document.addEventListener('click', onClick, { capture: true })

  // 6) Агрегатор отправок форм: window.dispatchEvent(new CustomEvent('form:success', { detail: { name: 'contact' } }))
  const onFormSuccess = (ev: Event) => {
    const detail = (ev as CustomEvent).detail || {}
    w.ym(counterId, 'reachGoal', 'form_submit', { form: detail?.name || detail?.form || 'unknown' })
  }
  window.addEventListener('form:success', onFormSuccess)

  // Очистку слушателей через специальный nuxt-хук можно не делать.
  // Если очень нужно — раскомментируй beforeunload:
  // window.addEventListener('beforeunload', () => {
  //   document.removeEventListener('click', onClick, { capture: true } as any)
  //   window.removeEventListener('form:success', onFormSuccess as any)
  // })
})
