export const useNewsletter = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const subscribe = async (email: string) => {
    error.value = null
    loading.value = true
    try {
      const { data, error: fetchErr } = await useFetch('/api/newsletter/subscribe', {
        method: 'POST',
        body: { email }
      })

      if (fetchErr.value) {
        throw new Error(fetchErr.value.statusMessage || 'Ошибка подписки')
      }

      if (!data.value?.success) {
        throw new Error('Не удалось оформить подписку')
      }
      return true
    } catch (e: any) {
      error.value = e?.message || 'Неизвестная ошибка'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, subscribe }
}
