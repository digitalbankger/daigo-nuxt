// server/middleware/redirects.global.ts
import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

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
  '/catalog/pol-goda-zdorovya-ot-daygo/': '/catalog/nabory/pol-goda-zdorovya-ot-daygo/', // <-- fixed "ot"
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
const RAW_QUERY_REDIRECTS: Record<string, string> = {
  '/catalog?napravlennost=kishechnik-i-immunitet': '/catalog/kishechnik-i-immunitet/',
}

// ===== УТИЛИТЫ =====
const withSlash = (p: string) => (p === '/' ? '/' : p.endsWith('/') ? p : `${p}/`)
const invert = (obj: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))

// нормализация ключей (чтобы '/catalog' и '/catalog/' считались одним и тем же)
const normalizePathMap = (map: Record<string, string>) => {
  const out: Record<string, string> = {}
  for (const [from, to] of Object.entries(map)) {
    out[withSlash(from)] = withSlash(to)
    // также учтём вариант без завершающего слэша
    out[from.replace(/\/$/, '')] = withSlash(to)
  }
  return out
}

// парсинг строки правила с query
function parseRuleKey(ruleKey: string): { path: string; params: URLSearchParams } {
  const [rawPath, rawQuery = ''] = ruleKey.split('?', 2)
  return { path: rawPath, params: new URLSearchParams(rawQuery) }
}

// проверка: все требуемые параметры совпадают
function matchesParams(actual: URLSearchParams, required: URLSearchParams) {
  for (const [k, v] of required.entries()) {
    if (actual.get(k) !== v) return false
  }
  return true
}

// ===== ПОДГОТОВКА КАРТ С УЧЁТОМ MODE =====
const PATH_REDIRECTS = normalizePathMap(MODE === 'oldToNew' ? RAW_PATH_REDIRECTS : invert(RAW_PATH_REDIRECTS))
const QUERY_REDIRECTS = MODE === 'oldToNew' ? RAW_QUERY_REDIRECTS : invert(RAW_QUERY_REDIRECTS)

// ===== MIDDLEWARE =====
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const pathname = decodeURI(url.pathname)

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
