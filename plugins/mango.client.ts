export default defineNuxtPlugin(() => {
  if (!process.client) return

  const load = () => {
    if (document.querySelector('script[data-daigo-mango]')) return
    const script = document.createElement('script')
    script.src = '//widgets.mango-office.ru/site/31307'
    script.async = true
    script.dataset.daigoMango = '1'
    document.head.appendChild(script)
  }

  const schedule = () => window.setTimeout(load, 2500)
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
})
