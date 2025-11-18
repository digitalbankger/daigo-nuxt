export default defineNuxtPlugin(() => {
  if (process.client) {
    const script = document.createElement('script')
    script.src = '//widgets.mango-office.ru/site/31307'
    script.async = true
    document.head.appendChild(script)
  }
})
