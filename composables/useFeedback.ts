import { appendRoistat } from '@/utils/roistat'
import { getLastUtm, trackUtmAuto, type StoredUtmSet } from '@/composables/useUtmTracker'

export type CallbackUtmPayload = {
  source: string
  medium: string
  term: string
  content: string
  campaign: string
}

export type CallbackPayload = {
  fio: string
  phone_number: string
  message: string
  subject?: string | null
}

export type CallbackResult = { success: boolean; lead_id?: number }

function toApiUtm(utm: StoredUtmSet | null): CallbackUtmPayload {
  return {
    source: utm?.source || '',
    medium: utm?.medium || '',
    term: utm?.term || '',
    content: utm?.content || '',
    campaign: utm?.campaign || '',
  }
}

export const useFeedback = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const route = useRoute()

  const send = async (payload: CallbackPayload): Promise<CallbackResult> => {
    loading.value = true
    error.value = null

    try {
      // Гарантируем, что UTM из первого URL успели сохраниться даже если
      // форма отправлена раньше следующей навигации Vue Router.
      if (process.client) {
        trackUtmAuto(route.query)
      }

      const body = appendRoistat({
        ...payload,
        utm: toApiUtm(getLastUtm()),
      })

      const { data, error: fetchErr } = await useFetch<CallbackResult>('/api/feedback/callback', {
        method: 'POST',
        body,
      })

      if (fetchErr.value) throw new Error(fetchErr.value.statusMessage || 'Ошибка отправки')
      if (!data.value?.success) throw new Error('Не удалось отправить заявку')
      return data.value
    } catch (e: any) {
      error.value = e?.message || 'Неизвестная ошибка'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, send }
}
