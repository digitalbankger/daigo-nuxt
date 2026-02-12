export default defineNuxtPlugin(() => {
  if (process.server) return

  window.onTelegramAuth = async (user) => {
    try {
      const res = await fetch('https://api.daigo.ru/v1/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          phone_number: user.phone_number,
          auth_date: user.auth_date,
          hash: user.hash,
          project_name: 'daigo'
        })
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Telegram auth failed: ${res.status} ${text}`)
      }

      const data = await res.json() 

      const auth = useAuthStore()
      await auth.loginWithTelegramTokens(data, '/profile')
    } catch (err) {
      console.error('Auth failed:', err)
    }
  }
})
