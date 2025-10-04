import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

// Карта редиректов: ключ может быть просто path или path+query
const redirects: Record<string, string> = {
  '/outlet/': '/',
  '/catalog/metabiotik-daigo-lux/': '/catalog/metabiotik/metabiotik-daigo-lux/',
  '/catalog/daigo-dermic/': '/catalog/aminobiotiki/daigo-dermic/',
  '/catalog/daigo-brain/': '/catalog/aminobiotiki/daigo-brain/',
  '/catalog/daigo-jointic/': '/catalog/aminobiotiki/daigo-jointic/',
  '/catalog/zhir-pecheni-treski-omega-3/': '/catalog/vitaminy/zhir-pecheni-treski-omega-3/',
  '/catalog/zubnaya-pasta-daigo-dent/': '/catalog/gigiena/zubnaya-pasta-daigo-dent/',
  '/catalog/daigo-shampoo/': '/catalog/gigiena/daigo-shampoo/',
  '/catalog/3-mesyatsa-priema-daygo-9-korobok/': '/catalog/kursy/3-mesyatsa-priema-daygo-9-korobok/',
  '/catalog/1-mesyats-priema-daygo-3-korobki/': '/catalog/kursy/1-mesyats-priema-daygo-3-korobki/',
  '/catalog/metabiotik-daigo/': '/catalog/metabiotik/metabiotik-daigo/',
  '/catalog/metabiotik-daigo-10ml/': '/catalog/metabiotik/metabiotik-daigo-10ml/',
  '/catalog/lactis-zoo/': '/catalog/metabiotik/lactis-zoo/',
  '/catalog/tamotsu/': '/catalog/plazmogeny/tamotsu/',
  '/tamotsu/': '/catalog/plazmogeny/tamotsu/',
  '/catalog/sertifikat-50-000/': '/catalog/sertifikaty/sertifikat-50-000/',
  '/catalog/beauty-box/': '/catalog/nabory/beauty-box/',
  '/catalog/usilennyy-kurs-kishechnik-mozg/': '/catalog/nabory/usilennyy-kurs-kishechnik-mozg/',
  '/catalog/vosstanovlenie-kognitivnykh-funktsiy/': '/catalog/nabory/vosstanovlenie-kognitivnykh-funktsiy/',
  '/catalog/polnyy-nabor-zdorovya-ot-daygo/': '/catalog/nabory/polnyy-nabor-zdorovya-ot-daygo/',
  '/catalog/pol-goda-zdorovya-ot-daygo/': '/catalog/nabory/pol-goda-zdorovya-ot-daygo/',
  '/catalog/12-mesyatsev-priema-daigo/': '/catalog/metabiotik/12-mesyatsev-priema-daigo/',
  '/catalog/podarochnyy-nabor-daigo-samurai/': '/catalog/nabory/podarochnyy-nabor-daigo-samurai/',
  '/catalog/business-box/': '/catalog/nabory/business-box/',
  '/catalog/sport-box/': '/catalog/nabory/sport-box/',

  '/otzyvy/': '/reviews/',
  '/profile/': '/personal/',

  // редирект по query
  '/catalog?napravlennost=kishechnik-i-immunitet': '/catalog/kishechnik-i-immunitet/',
}

function withTrailingSlash(p: string) {
  if (p === '/') return '/'
  return p.endsWith('/') ? p : `${p}/`
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const { pathname, searchParams } = url

  // проверяем обычные пути
  const normalized = withTrailingSlash(decodeURI(pathname))
  if (redirects[normalized]) {
    return sendRedirect(event, redirects[normalized], 301)
  }

  // проверяем правила с query
  for (const [from, to] of Object.entries(redirects)) {
    if (from.includes('?')) {
      const [path, query] = from.split('?')
      if (path === pathname) {
        const [key, value] = query.split('=')
        if (searchParams.get(key) === value) {
          return sendRedirect(event, to, 301)
        }
      }
    }
  }
})
