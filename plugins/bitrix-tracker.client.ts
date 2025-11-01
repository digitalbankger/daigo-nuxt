export default defineNuxtPlugin(() => {
  if (process.client) {
    const s = document.createElement('script')
    s.src = 'https://cdn-ru.bitrix24.ru/b32263794/crm/tag/call.tracker.js?' + (Date.now() / 60000 | 0)
    s.async = true
    document.body.appendChild(s)
  }
})
