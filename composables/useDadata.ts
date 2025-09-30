// composables/useDadata.ts
type CityItem = {
  value: string; full: string; fias_id: string | null; region: string | null;
  city: string | null; city_with_type: string | null; geo_lat: number | null; geo_lon: number | null; postal_code: string | null;
}
type AddressItem = CityItem & {
  street: string | null; house: string | null; block: string | null; flat: string | null;
}

export function useDadata() {
  let ctl: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const abort = () => { try { ctl?.abort() } catch {} finally { ctl = null } }
  const cancel = () => { if (timer) clearTimeout(timer); timer = null; abort() }

  const debounced = <T extends (...args: any[]) => Promise<any>>(fn: T, ms = 280) =>
    (...args: Parameters<T>) =>
      new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(async () => {
          try { resolve(await fn(...args)) } catch (e) { reject(e) }
        }, ms)
      })

  async function cityRaw(q: string) {
    if (!process.client || !q?.trim()) return []
    abort(); ctl = new AbortController()
    return await $fetch<CityItem[]>('/api/dadata/city', { query: { q }, signal: ctl.signal })
  }

  async function addressRaw(q: string, fias?: string | null) {
    if (!process.client || !q?.trim()) return []
    abort(); ctl = new AbortController()
    return await $fetch<AddressItem[]>('/api/dadata/address', { query: { q, fias }, signal: ctl.signal })
  }

  return {
    city: debounced(cityRaw, 280),
    address: debounced(addressRaw, 280),
    cancel, // <— используем при выборе из списка
  }
}
