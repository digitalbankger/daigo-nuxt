export {}

declare global {
  interface TelegramLoginUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
    // В Telegram Login Widget обычно НЕТ phone_number — оно будет undefined
    phone_number?: string
  }

  interface Window {
    onTelegramAuth: (user: TelegramLoginUser) => void
  }
}
