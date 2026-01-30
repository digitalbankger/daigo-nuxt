import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface UtmData {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

export interface StoredUtmSet extends UtmData {
  ts: number // timestamp
}

const FIRST_KEY = 'utm_first'
const LAST_KEY = 'utm_last'

const SEARCH_ENGINES: Array<{ match: (host: string) => boolean; source: string }> = [
  // Google
  { match: (h) => h.includes('google.'), source: 'google' },
  // Yandex: yandex.* + ya.ru
  { match: (h) => h === 'ya.ru' || h.includes('yandex.'), source: 'yandex' },
  // Dzen: dzen.ru + zen.yandex.ru
  { match: (h) => h === 'dzen.ru' || h.endsWith('.dzen.ru') || h === 'zen.yandex.ru', source: 'dzen' },
  // Bing
  { match: (h) => h.includes('bing.com'), source: 'bing' },
  // DuckDuckGo
  { match: (h) => h.includes('duckduckgo.com'), source: 'duckduckgo' },
]

function readUtmFromStorage(key: string): StoredUtmSet | null {
  if (!process.client) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as StoredUtmSet
  } catch {
    return null
  }
}

function writeUtmToStorage(key: string, data: StoredUtmSet) {
  if (!process.client) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function normalizeUtmFromObject(query: Record<string, any>): UtmData | null {
  const toStr = (v: any) => (Array.isArray(v) ? v[0] : v) as string | undefined

  const data: UtmData = {
    source: toStr(query.utm_source),
    medium: toStr(query.utm_medium),
    campaign: toStr(query.utm_campaign),
    content: toStr(query.utm_content),
    term: toStr(query.utm_term)
  }

  if (!data.source && !data.medium && !data.campaign && !data.content && !data.term) {
    return null
  }

  return data
}

function safeHostnameFromReferrer(referrer: string): string | null {
  try {
    const u = new URL(referrer)
    return (u.hostname || '').replace(/^www\./, '') || null
  } catch {
    return null
  }
}

function detectSearchSource(host: string): string | null {
  const h = host.toLowerCase()
  const found = SEARCH_ENGINES.find(s => s.match(h))
  return found ? found.source : null
}

/**
 * Если UTM в URL нет, пытаемся определить источник по referrer.
 * - direct/none: прямой заход (referrer пуст)
 * - organic: поисковики
 * - referral: домен источника
 */
function deriveUtmFromReferrer(): UtmData {
  if (!process.client) return {}

  const ref = document.referrer || ''
  const host = ref ? safeHostnameFromReferrer(ref) : null

  if (!host) {
    return { source: 'direct', medium: 'none' }
  }

  const searchSource = detectSearchSource(host)
  if (searchSource) {
    return { source: searchSource, medium: 'organic' }
  }

  return { source: host, medium: 'referral' }
}

/**
 * Ядро: сохранить UTM first/last на основе объекта query.
 * Используется и плагином, и вручную при необходимости.
 */
export function trackUtmFromQuery(query: RouteLocationNormalizedLoaded['query'] | Record<string, any>) {
  if (!process.client) return

  const utm = normalizeUtmFromObject(query as Record<string, any>)
  if (!utm) return

  const now = Date.now()
  const newSet: StoredUtmSet = { ...utm, ts: now }

  if (!readUtmFromStorage(FIRST_KEY)) {
    writeUtmToStorage(FIRST_KEY, newSet)
  }

  writeUtmToStorage(LAST_KEY, newSet)
}

/**
 * Авто-трекинг:
 * - если в URL есть UTM → сохраняем как раньше (first/last)
 * - если UTM нет:
 *   - если last уже есть → ничего не делаем (это и есть "предыдущий источник")
 *   - иначе сохраняем источник по referrer / direct
 */
export function trackUtmAuto(query: RouteLocationNormalizedLoaded['query'] | Record<string, any>) {
  if (!process.client) return

  const hasQueryUtm = !!normalizeUtmFromObject(query as Record<string, any>)
  if (hasQueryUtm) {
    trackUtmFromQuery(query)
    return
  }

  // если уже есть last — оставляем прежний источник
  if (readUtmFromStorage(LAST_KEY)) return

  const derived = deriveUtmFromReferrer()
  const now = Date.now()
  const newSet: StoredUtmSet = { ...derived, ts: now }

  if (!readUtmFromStorage(FIRST_KEY)) {
    writeUtmToStorage(FIRST_KEY, newSet)
  }
  writeUtmToStorage(LAST_KEY, newSet)
}

export function getFirstUtm(): StoredUtmSet | null {
  return readUtmFromStorage(FIRST_KEY)
}

export function getLastUtm(): StoredUtmSet | null {
  return readUtmFromStorage(LAST_KEY)
}

/**
 * Композабл, если нужно получать данные реактивно в компонентах.
 */
export function useUtmTracker() {
  const first = computed<StoredUtmSet | null>(() => readUtmFromStorage(FIRST_KEY))
  const last = computed<StoredUtmSet | null>(() => readUtmFromStorage(LAST_KEY))

  return {
    first,
    last,
    getFirstUtm,
    getLastUtm
  }
}
