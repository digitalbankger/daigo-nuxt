export const DEBUG = import.meta.dev || Boolean(import.meta.env?.NUXT_PUBLIC_DEBUG_AUTH)

export const mask = (s?: string | null, head = 8) =>
  !s ? '' : s.slice(0, head) + '…' + s.slice(-3)

export const log = (...args: any[]) => {
  if (!DEBUG) return
  // единый префикс, чтобы удобно фильтровать в консоли
  // пример: [DAIGO][auth] setAuthData token=eyJh…xLg
  // @ts-ignore
  console.log('[DAIGO]', ...args)
}

export const time = (label: string) => DEBUG ? console.time(label) : undefined
export const timeEnd = (label: string) => DEBUG ? console.timeEnd(label) : undefined
