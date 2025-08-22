import type { UserProfile } from '~/types/user'

export default defineEventHandler((): UserProfile => {
  return {
    id: '1000762',
    first_name: 'Илья',
    last_name: 'Гераеав',
    email: 'gheraev@gmail.com',
    phone_number: '79998372873',
    birth_day: '24-04-2025',
    loyalty_status: 'gold',
    recipient: '',
    addresses: [],
    cards: [
        {
            card_number: "4444",
            expiry_date: "05/25",
            card_type: "mir",
            issuer_name: "Sberbank"
        }
    ],
    bonuses: {
      valid: { value: 2667 },
      expiring: { value: 20, date_end: '2025-03-07' },
      expired: { value: 0 },
    },
  }
})
