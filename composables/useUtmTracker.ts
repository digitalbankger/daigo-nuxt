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
