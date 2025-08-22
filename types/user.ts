export interface Bonuses {
  valid: { value: number }
  expiring: { value: number; date_end: string | null }
  expired: { value: number }
}

export interface Addresses {
  
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  birth_day: string
  loyalty_status: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'
  recipient: string
  addresses: any[]
  cards: any[]
  bonuses: Bonuses
}
