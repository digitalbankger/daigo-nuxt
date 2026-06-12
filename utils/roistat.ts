import { useCookie } from '#imports'

export const ROISTAT_COOKIE_NAME = 'roistat_visit'
export const ROISTAT_DEFAULT_VALUE = 'nocookie'

/**
 * Возвращает visit id из cookie Roistat.
 * Если счетчик еще не успел поставить cookie, отправляем "nocookie" — так Roistat рекомендует делать фоллбек.
 */
export function getRoistatVisitId(defaultValue = ROISTAT_DEFAULT_VALUE): string {
  if (process.client) {
    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${ROISTAT_COOKIE_NAME}=`))
      ?.split('=')[1]

    if (raw) {
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw
      }
    }
  }

  const roistatVisit = useCookie<string | null>(ROISTAT_COOKIE_NAME, { sameSite: 'lax' })
  return roistatVisit.value || defaultValue
}

export function buildRoistatPayload(): { roistat: string } {
  return { roistat: getRoistatVisitId() }
}

export function appendRoistat<T extends Record<string, any>>(payload: T): T & { roistat: string } {
  return {
    ...payload,
    ...buildRoistatPayload(),
  }
}
