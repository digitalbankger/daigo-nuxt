import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'
import { CATALOG_SEO_FILTER_KEYS, getCatalogSeoFilterKey, isCatalogSeoFilterValue } from '~/constants/catalogSeoFilters'
import { buildCatalogFilterLocation, parseCatalogFilterValues, type CatalogFilterValues } from '~/utils/catalogFilterRoute'

/** РЕЖИМ КАРТ:
 * 'oldToNew' — слева→направо (как в списке ниже)
 * 'newToOld' — справа→налево
 */
const MODE: 'oldToNew' | 'newToOld' = 'newToOld'

// --- 1) БАЗОВАЯ КАРТА (СТАРЫЕ → НОВЫЕ) ---
const RAW_PATH_REDIRECTS: Record<string, string> = {
  '/catalog/': '/novinki/',
  '/about/': '/history/',
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
  // короткие урлы
  '/otzyvy/': '/reviews/',
  '/profile/': '/personal/',
}

// --- 2) ПРАВИЛА С QUERY (СТАРЫЕ → НОВЫЕ)
// формат ключа: '/path?key1=val1&key2=val2'
// Старые query->path SEO-переезды вынесены ниже в отдельный временный блок 307.
// Не добавлять их в инвертируемую карту MODE: иначе новый ЧПУ снова уедет в query.
const RAW_QUERY_REDIRECTS: Record<string, string> = {}


// Старый Bitrix-каталог
// /catalog/<раздел>/<slug-товара>/, 
// текущие карточки на
// /catalog/<slug-товара>. 
const LEGACY_PRODUCT_TEST_REDIRECTS: Record<string, string> = Object.fromEntries(
  Object.entries(RAW_PATH_REDIRECTS)
    .filter(([currentPath, legacyPath]) => {
      const currentSegments = currentPath.split('/').filter(Boolean)
      const legacySegments = legacyPath.split('/').filter(Boolean)
      return (
        currentSegments.length === 2 &&
        currentSegments[0] === 'catalog' &&
        legacySegments.length >= 3 &&
        legacySegments[0] === 'catalog'
      )
    })
    .map(([currentPath, legacyPath]) => [
      legacyPath.replace(/\/+$/, ''),
      currentPath.replace(/\/+$/, ''),
    ]),
)

// ===== УТИЛИТЫ =====
const withSlash = (p: string) => (p === '/' ? '/' : p.endsWith('/') ? p : `${p}/`)
const invert = (obj: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))

// нормализация ключей
const normalizePathMap = (map: Record<string, string>) => {
  const out: Record<string, string> = {}
  for (const [from, to] of Object.entries(map)) {
    out[withSlash(from)] = withSlash(to)
    // учет варианта без завершающего слэша
    out[from.replace(/\/$/, '')] = withSlash(to)
  }
  return out
}

// парсинг строки правила с query
function parseRuleKey(ruleKey: string): { path: string; params: URLSearchParams } {
  const [rawPath, rawQuery = ''] = ruleKey.split('?', 2)
  return { path: rawPath, params: new URLSearchParams(rawQuery) }
}

// проверка: (для себя)
function matchesParams(actual: URLSearchParams, required: URLSearchParams) {
  for (const [k, v] of required.entries()) {
    if (actual.get(k) !== v) return false
  }
  return true
}

const CATALOG_QUERY_KEYS_TO_DROP = new Set(['empty', 'page'])

function isCatalogPath(pathname: string) {
  return pathname === '/catalog' || pathname.startsWith('/catalog/')
}

function buildRedirectLocation(pathname: string, params: URLSearchParams) {
  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

// ===== ВРЕМЕННЫЕ SEO-РЕДИРЕКТЫ: ТОЛЬКО 307 ДЛЯ ТЕСТА =====
// После проверки этот блок можно механически переключить на 301.
const SEO_TEST_REDIRECT_CODE = 301

const REMOVED_CATALOG_FILTER_KEYS = new Set(['klass-produkta'])
const CATALOG_SERVICE_KEYS = new Set(['page', 'empty', 'page_size', 'limit', 'no_total', 'for'])

function collectSeoFilters(params: URLSearchParams): CatalogFilterValues {
  const result: CatalogFilterValues = {}

  for (const key of CATALOG_SEO_FILTER_KEYS) {
    const values = params.getAll(key)
      .flatMap(value => parseCatalogFilterValues(value))
      .filter(value => isCatalogSeoFilterValue(key, value))

    if (values.length) result[key] = Array.from(new Set(values))
  }

  return result
}

function buildCatalogQueryRedirect(url: URL, pathname: string) {
  if (pathname !== '/catalog' && pathname !== '/catalog/') return null

  const hasSeoQuery = CATALOG_SEO_FILTER_KEYS.some(key => url.searchParams.has(key))
  const hasRemovedFilter = [...REMOVED_CATALOG_FILTER_KEYS].some(key => url.searchParams.has(key))
  const hasServiceQuery = [...CATALOG_SERVICE_KEYS].some(key => url.searchParams.has(key))
  if (!hasSeoQuery && !hasRemovedFilter && !hasServiceQuery) return null

  const seoFilters = collectSeoFilters(url.searchParams)
  const location = buildCatalogFilterLocation(seoFilters)
  const kept = new URLSearchParams(url.searchParams)

  for (const key of CATALOG_SEO_FILTER_KEYS) kept.delete(key)
  for (const key of REMOVED_CATALOG_FILTER_KEYS) kept.delete(key)
  for (const key of CATALOG_SERVICE_KEYS) kept.delete(key)

  // Не теряем остальные UX-фильтры и рекламные метки.
  for (const [key, value] of Object.entries(location.query)) kept.set(key, value)
  return buildRedirectLocation(location.path, kept)
}

function buildLegacyCatalogFilterRedirect(url: URL, pathname: string) {
  if (!pathname.startsWith('/catalog/filter/')) return null

  const segments = pathname.slice('/catalog/filter/'.length).split('/').filter(Boolean)
  const filters: CatalogFilterValues = {}

  for (let i = 0; i < segments.length; i += 2) {
    const key = decodeURIComponent(segments[i] || '')
    const rawValue = decodeURIComponent(segments[i + 1] || '')
    if (!key || !rawValue || REMOVED_CATALOG_FILTER_KEYS.has(key)) continue
    filters[key] = parseCatalogFilterValues(rawValue)
  }

  const location = buildCatalogFilterLocation(filters)
  const kept = new URLSearchParams(url.searchParams)
  for (const [key, value] of Object.entries(location.query)) kept.set(key, value)
  return buildRedirectLocation(location.path, kept)
}

function canonicalCatalogSeoLocation(pathname: string) {
  const clean = pathname.replace(/\/+$/, '')
  if (!clean.startsWith('/catalog/')) return null

  const segments = clean.slice('/catalog/'.length).split('/').filter(Boolean)
  if (!segments.length) return null

  const filters: CatalogFilterValues = {}
  for (const segment of segments) {
    const value = decodeURIComponent(segment)
    const key = getCatalogSeoFilterKey(value)
    if (!key || !isCatalogSeoFilterValue(key, value)) return null
    filters[key] = Array.from(new Set([...(filters[key] || []), value]))
  }

  const location = buildCatalogFilterLocation(filters)
  const hasExtraPathSegments = segments.length > 1
  const pathChanged = location.path !== clean

  // Один корректный /catalog/<seo-slug> уже каноничен.
  if (!hasExtraPathSegments && !pathChanged) return null

  return location
}


function buildLegacyProductRedirect(url: URL, pathname: string) {
  const cleanPath = pathname.replace(/\/+$/, '')
  const target = LEGACY_PRODUCT_TEST_REDIRECTS[cleanPath]
  if (!target) return null
  return `${target}${url.search || ''}`
}

function buildArticleTrailingSlashRedirect(url: URL, pathname: string) {
  if (!pathname.endsWith('/')) return null
  if (pathname !== '/articles/' && !pathname.startsWith('/articles/')) return null

  const cleanPath = pathname.replace(/\/+$/, '') || '/articles'
  return buildRedirectLocation(cleanPath, new URLSearchParams(url.searchParams))
}


function buildCatalogTrailingSlashRedirect(url: URL, pathname: string) {
  if (!pathname.endsWith('/')) return null
  if (pathname !== '/catalog/' && !pathname.startsWith('/catalog/')) return null

  const cleanPath = pathname.replace(/\/+$/, '') || '/catalog'
  return buildRedirectLocation(cleanPath, new URLSearchParams(url.searchParams))
}

function buildArticlesPaginationRedirect(url: URL, pathname: string) {
  if ((pathname === '/articles' || pathname === '/articles/') && url.searchParams.has('page')) {
    const page = Math.max(1, Math.floor(Number(url.searchParams.get('page')) || 1))
    const kept = new URLSearchParams(url.searchParams)
    kept.delete('page')
    return buildRedirectLocation(page <= 1 ? '/articles' : `/articles/page${page}`, kept)
  }

  const match = pathname.match(/^\/articles\/page(\d+)\/?$/)
  if (!match) return null

  const page = Math.max(1, Math.floor(Number(match[1]) || 1))
  const cleanPath = page <= 1 ? '/articles' : `/articles/page${page}`
  if (pathname === cleanPath && page > 1) return null
  return buildRedirectLocation(cleanPath, new URLSearchParams(url.searchParams))
}

// ===== ПОДГОТОВКА КАРТ С УЧЁТОМ MODE =====
const BASE_PATH_REDIRECTS = normalizePathMap(
  MODE === 'oldToNew' ? RAW_PATH_REDIRECTS : invert(RAW_PATH_REDIRECTS)
)

// ДОП. АЛИАС: shop → catalog (без дубля ключа в RAW)
const EXTRA_ALIAS =
  MODE === 'oldToNew'
    ? { '/catalog/': '/shop/' }   // после invert получилось /shop/ → /catalog/
    : { '/shop/': '/catalog/' }   // при текущем MODE='newToOld' нужно финально /shop/ → /catalog/

const PATH_REDIRECTS = {
  ...BASE_PATH_REDIRECTS,
  ...normalizePathMap(EXTRA_ALIAS),
}

const QUERY_REDIRECTS = MODE === 'oldToNew' ? RAW_QUERY_REDIRECTS : invert(RAW_QUERY_REDIRECTS)

// ===== MIDDLEWARE =====
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const pathname = decodeURI(url.pathname)

  // --- START: временный отдельный блок новых SEO redirect rules (307) ---
  const articlePaginationTarget = buildArticlesPaginationRedirect(url, pathname)
  if (articlePaginationTarget) {
    return sendRedirect(event, articlePaginationTarget, SEO_TEST_REDIRECT_CODE)
  }

  const articleTrailingSlashTarget = buildArticleTrailingSlashRedirect(url, pathname)
  if (articleTrailingSlashTarget) return sendRedirect(event, articleTrailingSlashTarget, SEO_TEST_REDIRECT_CODE)

  const legacyProductTarget = buildLegacyProductRedirect(url, pathname)
  if (legacyProductTarget) return sendRedirect(event, legacyProductTarget, SEO_TEST_REDIRECT_CODE)

  const legacyFilterTarget = buildLegacyCatalogFilterRedirect(url, pathname)
  if (legacyFilterTarget) return sendRedirect(event, legacyFilterTarget, SEO_TEST_REDIRECT_CODE)

  const catalogQueryTarget = buildCatalogQueryRedirect(url, pathname)
  if (catalogQueryTarget) return sendRedirect(event, catalogQueryTarget, SEO_TEST_REDIRECT_CODE)

  const canonicalSeoLocation = canonicalCatalogSeoLocation(pathname)
  if (canonicalSeoLocation) {
    const kept = new URLSearchParams(url.searchParams)

    // Фильтры, которые раньше были вторым/третьим path-сегментом,
    // переносим в query. Они сохраняют UX-фильтрацию, но не участвуют в SEO.
    for (const [key, value] of Object.entries(canonicalSeoLocation.query)) {
      kept.set(key, value)
    }

    return sendRedirect(
      event,
      buildRedirectLocation(canonicalSeoLocation.path, kept),
      SEO_TEST_REDIRECT_CODE,
    )
  }


  // Единый формат URL каталога: без завершающего слэша.
  // после legacy/query/SEO-нормализации, чтобы не создавать цепочки редиректов.
  const catalogTrailingSlashTarget = buildCatalogTrailingSlashRedirect(url, pathname)
  if (catalogTrailingSlashTarget) {
    return sendRedirect(event, catalogTrailingSlashTarget, SEO_TEST_REDIRECT_CODE)
  }
  // --- END: временный отдельный блок новых SEO redirect rules (307) ---

  // Evolution: новый SEO URL.
  // Правило не зависит от MODE, чтобы не инвертировалось вместе с общей картой редиректов.
  const evolutionPath = pathname.replace(/\/+$/, '')
  if (evolutionPath === '/catalog/evolution-mg') {
    const target = `/catalog/meta-napitok-daigo-evolution-mg10${url.search}`
    return sendRedirect(event, target, 301)
  }

  //      (не зависит от MODE, работает для /WD, /WD/, /wd, /wd/)
  // 0.1) /WD → /womens-day?utm_source=share&utm_campaign=080326&utm_content=landing
  const pNorm = pathname.replace(/\/+$/, '')
  if (pNorm.toLowerCase() === '/wd') {
    const qs = new URLSearchParams(url.searchParams)

    // гарантируем нужные UTM
    qs.set('utm_source', 'share')
    qs.set('utm_campaign', '080326')
    qs.set('utm_content', 'landing')

    const location = `/womens-day?${qs.toString()}`
    return sendRedirect(event, location, 301)
  }

  // 0.2) Нормализация битых рекламных URL вида:
  //      /catalog/metabiotik-daigo&page=1&utm_source=...
  //      Первый GET-параметр ошибочно попал в pathname через &, поэтому переносим хвост в query.
  const brokenQueryMatch = pathname.match(/^(.+?)&([A-Za-z0-9_.~-]+)=([^#]*)$/)
  const brokenPath = brokenQueryMatch?.[1] || ''
  const brokenQueryKey = brokenQueryMatch?.[2] || ''
  const brokenQueryValue = brokenQueryMatch?.[3] || ''

  if (brokenQueryMatch && isCatalogPath(brokenPath)) {
    const fixedPath = brokenPath.replace(/\/+$/, '') || '/'
    const movedParams = new URLSearchParams(`${brokenQueryKey}=${brokenQueryValue}`)
    const qs = new URLSearchParams(url.searchParams)

    for (const [key, value] of movedParams.entries()) {
      if (!qs.has(key)) qs.set(key, value)
    }

    for (const key of CATALOG_QUERY_KEYS_TO_DROP) {
      qs.delete(key)
    }

    return sendRedirect(event, buildRedirectLocation(fixedPath, qs), 301)
  }

  // 0.3) У каталога больше нет страниц. Служебные page/empty убираем из входящих URL,
  //      чтобы они не попадали в canonical и не влияли на ленивую подгрузку.
  if (isCatalogPath(pathname)) {
    const qs = new URLSearchParams(url.searchParams)
    let hasDeprecatedCatalogParam = false

    for (const key of CATALOG_QUERY_KEYS_TO_DROP) {
      if (qs.has(key)) {
        qs.delete(key)
        hasDeprecatedCatalogParam = true
      }
    }

    if (hasDeprecatedCatalogParam) {
      return sendRedirect(event, buildRedirectLocation(pathname, qs), 301)
    }
  }

  // 0) Нормализация битых query вида:
  //    /catalog?napravlennost=.../?ysclid=XXX&page=1
  // Идея: если значение ЛЮБОГО параметра содержит подстроку "/?...", то:
  //  - отрезаем хвост после "/?" из значения;
  //  - парсим хвост как дополнительные query-параметры и добавляем их в строку запроса;
  //  - убираем лишние косые черты в конце значения (../value/ -> ../value).
  let changed = false
  const params = new URLSearchParams(url.searchParams) // копия

  for (const [key, valRaw] of [...params.entries()]) {
    if (!valRaw) continue
    // ловим "/?..." внутри значения
    const idx = valRaw.indexOf('/?')
    if (idx !== -1) {
      const cleanVal = valRaw.slice(0, idx).replace(/\/+$/, '') // убираем хвост и завершающие слэши
      const tail = valRaw.slice(idx + 2) // всё, что после "/?"
      params.set(key, cleanVal)

      // распарсим хвост как query-строку и вольём в params
      const tailParams = new URLSearchParams(tail)
      for (const [tk, tv] of tailParams.entries()) {
        // не перетираем уже существующие ключи (на случай дубликатов)
        if (!params.has(tk)) params.set(tk, tv)
      }
      changed = true
    } else {
      // если значение закончилось слэшем — уберём (редкий кейс)
      if (/\/$/.test(valRaw)) {
        params.set(key, valRaw.replace(/\/+$/, ''))
        changed = true
      }
    }
  }

  if (changed) {
    const qs = params.toString()
    const fixed = qs ? `${pathname}?${qs}` : pathname
    return sendRedirect(event, fixed, 301)
  }

  // 1) Простые пути (карта PATH_REDIRECTS)
  const targetPath = PATH_REDIRECTS[pathname] || PATH_REDIRECTS[withSlash(pathname)]
  if (targetPath) {
    // сохраняем все исходные query (utm и пр.)
    const location = `${targetPath}${url.search || ''}`
    return sendRedirect(event, location, 301)
  }

  // 2) Правила с query (карта QUERY_REDIRECTS)
  for (const [ruleKey, to] of Object.entries(QUERY_REDIRECTS)) {
    const { path: rulePath, params: required } = parseRuleKey(ruleKey)

    // путь должен совпасть (с учётом и без слэша)
    const pathOk = rulePath === pathname || withSlash(rulePath) === withSlash(pathname)
    if (!pathOk) continue

    if (!matchesParams(url.searchParams, required)) continue

    // сохраняем прочие query (например utm_*), но удаляем совпавшие из правила
    const kept = new URLSearchParams(url.searchParams)
    for (const k of required.keys()) kept.delete(k)

    const qs = kept.toString()
    const location = qs ? `${withSlash(to)}?${qs}` : withSlash(to)
    return sendRedirect(event, location, 301)
  }

  // иначе пропускаем дальше
})