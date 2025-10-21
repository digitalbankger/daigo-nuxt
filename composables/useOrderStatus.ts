export type OrderStatusKey =
  | 'created'
  | 'pending'            // новое из бэка
  | 'waiting_payment'    // новое из бэка
  | 'payment_received'   // новое из бэка
  | 'delivered'
  | 'canceled'
  | 'failed'
  | 'unknown'

const MAP: Record<OrderStatusKey, { label: string; color: 'blue'|'orange'|'green'|'red'|'gray'|'purple' }> = {
  created:           { label: 'Создан',             color: 'blue'   },
  pending:           { label: 'В обработке',        color: 'purple' },
  waiting_payment:   { label: 'Ожидает оплаты',     color: 'orange' },
  payment_received:  { label: 'Оплачен',            color: 'green'  },
  delivered:         { label: 'Доставлен',          color: 'green'  },
  canceled:          { label: 'Отменён',            color: 'gray'   },
  failed:            { label: 'Не выполнен',        color: 'red'    },
  unknown:           { label: 'Неизвестен',         color: 'gray'   },
}

/** Приводим старые/альтернативные названия к актуальным */
export function normalizeStatus(raw?: string): OrderStatusKey {
  const s = String(raw || '').toLowerCase().trim()

  // legacy-синонимы из старого фронта/апи
  if (s === 'processing') return 'pending'
  if (s === 'awaiting_payment' || s === 'wait_payment') return 'waiting_payment'
  if (s === 'paid' || s === 'payment_done' || s === 'payment_success') return 'payment_received'
  if (s === 'in_way' || s === 'shipped') return 'pending' // или оставь как есть, если будет отдельный статус
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
