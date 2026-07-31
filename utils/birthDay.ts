/**
 * Приводит дату рождения к единому API-формату YYYY-MM-DD.
 * Поддерживает ISO-дату/дату-время и старый формат DD.MM.YYYY или DD-MM-YYYY.
 */
export function normalizeBirthDay(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw || ['0001-01-01', '01-01-0001', '1-1-1'].includes(raw)) return ''

  let year: number
  let month: number
  let day: number

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/)
  const localMatch = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)

  if (isoMatch) {
    year = Number(isoMatch[1])
    month = Number(isoMatch[2])
    day = Number(isoMatch[3])
  } else if (localMatch) {
    day = Number(localMatch[1])
    month = Number(localMatch[2])
    year = Number(localMatch[3])
  } else {
    return ''
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  if (!isValidDate) return ''

  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')
}
