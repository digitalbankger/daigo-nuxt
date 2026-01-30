// services/guestPreorder.ts
import { useRuntimeConfig, useCookie } from '#imports'
import { getLastUtm } from '@/composables/useUtmTracker'

function buildUtmPayload() {
  const last = getLastUtm()
  if (!last) return undefined

  const utm: any = {
    source: last.source,
    medium: last.medium,
    campaign: last.campaign,
    content: last.content,
    term: last.term,
  }

  Object.keys(utm).forEach((k) => utm[k] === undefined && delete utm[k])
  const hasMeaningful = ['source', 'medium', 'campaign', 'content', 'term'].some((k) => k in utm)
  if (!hasMeaningful) return undefined
  return utm
}

/**
 * Fire-and-forget гостевой pre-order.
 * Ошибки глушим — лид не теряем, UI не блокируем.
 */
export function sendGuestPreorderFireAndForget (params: {
  sessionId: string
  fullName?: string
  phone?: string
}) {
  const { sessionId, fullName = '', phone = '' } = params
  const { public: { daigoApiBase } } = useRuntimeConfig()

  ;(async () => {
    try {
      const utm = buildUtmPayload()
      await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/pre-order`, {
        method: 'POST',
        body: {
          fio: (fullName || '').trim(),
          phone_number: String(phone || '').replace(/\D/g, ''),
          ...(utm ? { utm } : {}),
        }
      })
    } catch (e) {
      if (process.dev) console.warn('[guest-preorder] ignored error', e)
    }
  })()
}

/**
 * Получить/создать guest session id.
 * ⚠️ Совместимость: сначала читаем из localStorage (если уже использовался),
 * потом — из cookie. Если нет — создаём и пишем в оба места.
 */
export function ensureGuestSessionId (): string {
  let sid: string | null = null
  if (process.client) {
    sid = localStorage.getItem('guest_session_id')
    const c = useCookie<string | null>('guest_session_id', { sameSite: 'lax' })
    if (!sid) sid = c.value || null
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('guest_session_id', sid)
      c.value = sid
    } else {
      // выравниваем хранилища
      localStorage.setItem('guest_session_id', sid)
      if (!c.value) c.value = sid
    }
  }
  return sid || ''
}
