export type OrderStatusKey =
  | 'created'
  | 'processing'
  | 'waiting_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'failed'
  | 'unknown'

const MAP: Record<OrderStatusKey, { label: string; color: 'blue'|'orange'|'green'|'red'|'gray'|'purple' }> = {
  created:           { label: 'Создан',             color: 'blue'   },
  processing:        { label: 'В обработке',        color: 'purple' },
  waiting_payment:   { label: 'Ожидает оплаты',     color: 'orange' },
  paid:              { label: 'Оплачен',            color: 'green'  },
  shipped:           { label: 'Отправлен',          color: 'blue'   },
  delivered:         { label: 'Доставлен',          color: 'green'  },
  canceled:          { label: 'Отменён',            color: 'gray'   },
  failed:            { label: 'Не выполнен',        color: 'red'    },
  unknown:           { label: 'Неизвестен',         color: 'gray'   },
}

/** Приводим старые/альтернативные названия к актуальным */
export function normalizeStatus(raw?: string): OrderStatusKey {
  const s = String(raw || '').toLowerCase().trim()

  // legacy/синонимы из старого фронта/бэка
  if (s === 'pending') return 'processing'
  if (s === 'payment_received') return 'paid'
  if (s === 'awaiting_payment' || s === 'wait_payment') return 'waiting_payment'
  if (s === 'payment_done' || s === 'payment_success') return 'paid'
  if (s === 'in_way') return 'shipped'
  if (s === 'received') return 'delivered'

  if (s in MAP) return s as OrderStatusKey
  return 'unknown'
}

export function statusLabel(raw?: string): string {
  return MAP[normalizeStatus(raw)].label
}

export function statusPillClass(raw?: string): string {
  const k = normalizeStatus(raw)
  const color = MAP[k].color
  const palette: Record<typeof MAP[OrderStatusKey]['color'], string> = {
    blue:   'text-blue-600 border-blue-300',
    orange: 'text-orange-600 border-orange-300',
    green:  'text-green-600 border-green-300',
    red:    'text-red-600 border-red-300',
    gray:   'text-gray-600 border-gray-300',
    purple: 'text-purple-600 border-purple-300',
  }
  return `inline-block rounded-xl px-4 py-2 border ${palette[color]}`
}
