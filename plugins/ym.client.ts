export default defineNuxtPlugin(() => {
  if (process.server) return

  ;(window as any).dataLayer = (window as any).dataLayer || []

  if (document.querySelector('script[src="https://mc.yandex.ru/metrika/tag.js"]')) return

  ;(function (m: any, e: any, t: any, r: any, i: any, k?: any, a?: any) {
    m[i] =
      m[i] ||
      function () {
        ;(m[i].a = m[i].a || []).push(arguments)
      }
    m[i].l = Date.now()

    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return
    }

    k = e.createElement(t)
    a = e.getElementsByTagName(t)[0]
    k.async = 1
    k.src = r
    a.parentNode.insertBefore(k, a)
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')

  ;(window as any).ym?.(31773751, 'init', {
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })
})