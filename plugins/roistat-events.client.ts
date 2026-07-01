import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getRoistatVisitId } from '@/utils/roistat'

type AnyRecord = Record<string, any>
type PendingEvent = { id: string; data?: AnyRecord }

const ROISTAT_RETRY_DELAY = 300
const ROISTAT_MAX_RETRIES = 40
const RECENT_EVENT_TTL_MS = 700

function toRecord(value: unknown): AnyRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : {}
}

function getPageMeta() {
  return {
    url: window.location.href,
    path: `${window.location.pathname}${window.location.search}`,
    title: document.title,
  }
}

function shouldSkipDataLayerEvent(eventName: string) {
  // Системные события контейнеров не являются бизнес-целями и только засоряют Roistat.
  return ['gtm.js', 'gtm.dom', 'gtm.load', 'gtm.historyChange'].includes(eventName)
}

function normalizeRoistatEventId(
  eventName: string,
  prefix: string,
  eventIdMap: Record<string, string>,
) {
  return eventIdMap[eventName] || `${prefix || ''}${eventName}`
}

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const config = useRuntimeConfig()
  const roistatConfig = config.public as any
  const enabledYmGoals = roistatConfig.roistatBridgeYmGoals !== false
  const enabledDataLayerEvents = roistatConfig.roistatBridgeDataLayerEvents !== false
  const eventPrefix = String(roistatConfig.roistatEventPrefix || '')
  const eventIdMap = toRecord(roistatConfig.roistatEventIdMap) as Record<string, string>

  const w = window as any
  const pending: PendingEvent[] = []
  const recent = new Map<string, number>()
  let retryTimer: ReturnType<typeof window.setTimeout> | null = null
  let retryCount = 0

  const makeDedupKey = (id: string, source: string) => `${source}:${id}`

  const isRecentlySent = (id: string, source: string) => {
    const key = makeDedupKey(id, source)
    const now = Date.now()
    const prev = recent.get(key) || 0

    if (prev && now - prev < RECENT_EVENT_TTL_MS) return true

    recent.set(key, now)
    return false
  }

  const flushPending = () => {
    const roistatSend = w.roistat?.event?.send

    if (typeof roistatSend !== 'function') {
      if (retryCount >= ROISTAT_MAX_RETRIES || retryTimer) return

      retryCount += 1
      retryTimer = window.setTimeout(() => {
        retryTimer = null
        flushPending()
      }, ROISTAT_RETRY_DELAY)
      return
    }

    while (pending.length) {
      const item = pending.shift()
      if (!item) continue

      try {
        roistatSend.call(w.roistat.event, item.id, item.data)
      } catch (error) {
        console.warn('[roistat-events] Не удалось отправить событие в Roistat', item.id, error)
      }
    }
  }

  const sendRoistatEvent = (rawEventName: string, payload?: AnyRecord, source = 'site') => {
    const eventName = String(rawEventName || '').trim()
    if (!eventName) return

    const id = normalizeRoistatEventId(eventName, eventPrefix, eventIdMap)
    if (!id || isRecentlySent(id, source)) return

    const visit = getRoistatVisitId('')
    const data = {
      ...(visit ? { visit } : {}),
      data: {
        source,
        event: eventName,
        ...getPageMeta(),
        ...(payload || {}),
      },
    }

    pending.push({ id, data })
    flushPending()
  }

  const handleYmArgs = (args: any[]) => {
    if (!enabledYmGoals) return

    const [, method, goalName, params] = args
    if (method !== 'reachGoal' || typeof goalName !== 'string') return

    sendRoistatEvent(goalName, { params: toRecord(params) }, 'yandex_metrika')
  }

  const handleDataLayerItem = (item: unknown) => {
    if (!enabledDataLayerEvents) return

    const payload = toRecord(item)
    const eventName = typeof payload.event === 'string' ? payload.event.trim() : ''

    if (!eventName || shouldSkipDataLayerEvent(eventName)) return

    sendRoistatEvent(eventName, { payload }, 'data_layer')
  }

  w.__daigoSendRoistatEvent = sendRoistatEvent

  // 1) Захватываем будущие прямые цели Метрики: ym(counterId, 'reachGoal', 'goal_id', params)
  const patchYm = () => {
    const currentYm = typeof w.ym === 'function' ? w.ym : null
    if (!currentYm || (currentYm as any).__roistatBridgeWrapped) return Boolean(currentYm)

    const wrappedYm = (...args: any[]) => {
      handleYmArgs(args)
      return currentYm(...args)
    }

    Object.assign(wrappedYm, currentYm)
    ;(wrappedYm as any).__roistatBridgeWrapped = true
    w.ym = wrappedYm
    return true
  }

  if (!patchYm()) {
    let patchAttempts = 0
    const patchTimer = window.setInterval(() => {
      patchAttempts += 1
      if (patchYm() || patchAttempts >= ROISTAT_MAX_RETRIES) {
        window.clearInterval(patchTimer)
      }
    }, ROISTAT_RETRY_DELAY)
  }

  // 2) Захватываем события, которые проект передает в Yandex Tag Manager / dataLayer.
  w.dataLayer = Array.isArray(w.dataLayer) ? w.dataLayer : []

  w.dataLayer.forEach((item: unknown) => handleDataLayerItem(item))

  const originalPush = w.dataLayer.push.bind(w.dataLayer)
  w.dataLayer.push = (...items: any[]) => {
    items.forEach((item) => handleDataLayerItem(item))
    return originalPush(...items)
  }
})
