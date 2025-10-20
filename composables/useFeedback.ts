export type CallbackPayload = {
  fio: string
  phone_number: string
  message: string
}

export type CallbackResult = { success: boolean; lead_id?: number }

export const useFeedback = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const send = async (payload: CallbackPayload): Promise<CallbackResult> => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchErr } = await useFetch<CallbackResult>('/api/feedback/callback', {
        method: 'POST',
        body: payload
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
