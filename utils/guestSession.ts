const GUEST_SESSION_KEY = 'guest_session_id'

function storage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function fallbackUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function createGuestSessionId(): string {
  const cryptoApi = typeof globalThis !== 'undefined'
    ? (globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined)
    : undefined

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    cryptoApi.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return fallbackUuid()
}

export function getGuestSessionId(): string | null {
  try {
    return storage()?.getItem(GUEST_SESSION_KEY) || null
  } catch {
    return null
  }
}

export function setGuestSessionId(value: string): void {
  try {
    storage()?.setItem(GUEST_SESSION_KEY, value)
  } catch {
    // If storage is unavailable (private WebView / restricted browser),
    // the Pinia store still keeps the session id in memory for this page load.
  }
}

export function removeGuestSessionId(): void {
  try {
    storage()?.removeItem(GUEST_SESSION_KEY)
  } catch {
    // no-op
  }
}
