import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import {
  createError,
  defineEventHandler,
  getHeader,
  getQuery,
  setResponseHeader,
} from 'h3'
import {
  clearCatalogSnapshot,
  getCatalogCacheStatus,
  refreshCatalogSnapshot,
} from '~/server/utils/catalogSnapshot'

const MUTATION_COOLDOWN_MS = 5000
let lastMutationAt = 0

function isLoopback(value: string) {
  return value === '127.0.0.1' || value === '::1' || value === '::ffff:127.0.0.1'
}

function safeEqual(left: string, right: string) {
  if (!left || !right) return false
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function canMutateCache(event: H3Event, providedKey: string) {
  const forwardedFor = String(getHeader(event, 'x-forwarded-for') || '').trim()
  const remoteAddress = String(event.node.req.socket.remoteAddress || '')

  // Прямой curl на внутренний Nitro (127.0.0.1:3004) разрешён без ключа.
  // Запрос, прошедший через Nginx, всегда имеет X-Forwarded-For и сюда не попадёт.
  if (!forwardedFor && isLoopback(remoteAddress)) return true

  const configuredKey = String(useRuntimeConfig(event).catalogCacheResetKey || '')
  return Boolean(configuredKey) && safeEqual(configuredKey, providedKey)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = String(query.action || 'status').trim().toLowerCase()
  const providedKey = String(
    getHeader(event, 'x-catalog-cache-key') || query.key || '',
  ).trim()

  setResponseHeader(event, 'Cache-Control', 'no-store')

  if (action === 'status') {
    return {
      action: 'status',
      ...(await getCatalogCacheStatus(event)),
    }
  }

  if (!['clear', 'refresh', 'warm'].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown catalog cache action' })
  }

  if (!canMutateCache(event, providedKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Catalog cache mutation is not allowed' })
  }

  const now = Date.now()
  if (now - lastMutationAt < MUTATION_COOLDOWN_MS) {
    throw createError({ statusCode: 429, statusMessage: 'Catalog cache mutation cooldown' })
  }
  lastMutationAt = now

  if (action === 'clear') {
    await clearCatalogSnapshot()
    return {
      action: 'clear',
      cleared: true,
      ...(await getCatalogCacheStatus(event)),
    }
  }

  const snapshot = await refreshCatalogSnapshot(event)
  return {
    action: 'refresh',
    refreshed: true,
    generatedAt: snapshot.generatedAt,
    expiresAt: snapshot.expiresAtMs > 0
      ? new Date(snapshot.expiresAtMs).toISOString()
      : null,
    productCount: snapshot.products.length,
    countKeys: Object.keys(snapshot.baseCounts || {}).length,
  }
})
