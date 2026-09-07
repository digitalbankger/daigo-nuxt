export default defineNuxtPlugin(() => {
  if (!process.client) return

  const load = () => {
    if (document.querySelector('script[data-daigo-bitrix-tracker]')) return
    const script = document.createElement('script')
    script.src = 'https://cdn-ru.bitrix24.ru/b32263794/crm/tag/call.tracker.js?' + (Date.now() / 60000 | 0)
    script.async = true
    script.dataset.daigoBitrixTracker = '1'
    document.body.appendChild(script)
  }

  const schedule = () => window.setTimeout(load, 2500)
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
})
