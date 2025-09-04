export type OrderStatusKey =
  | 'created'
  | 'processing'
  | 'awaiting_payment'
  | 'paid'
  | 'in_way'
  | 'delivered'
  | 'received'
  | 'canceled'
  | 'failed'
  | 'refunded'
  | 'unknown'

const MAP: Record<OrderStatusKey, { label: string; color: 'blue'|'orange'|'green'|'red'|'gray'|'purple' }> = {
  created:          { label: 'Создан',             color: 'blue'   },
  processing:       { label: 'Обрабатывается',     color: 'purple' },
  awaiting_payment: { label: 'Ожидает оплаты',     color: 'orange' },
  paid:             { label: 'Оплачен',            color: 'green'  },
  in_way:           { label: 'В пути',             color: 'blue'   },
  delivered:        { label: 'Доставлен',          color: 'blue'   },
  received:         { label: 'Получен',            color: 'green'  },
  canceled:         { label: 'Отменён',            color: 'red'    },
  failed:           { label: 'Ошибка',             color: 'red'    },
  refunded:         { label: 'Возврат',            color: 'gray'   },
  unknown:          { label: 'Неизвестно',         color: 'gray'   },
}

const ALIASES: Record<string, OrderStatusKey> = {
  // нормализация синонимов с бэка
  created: 'created', new: 'created',
  processing: 'processing', in_progress: 'processing', preparing: 'processing',
  awaiting_payment: 'awaiting_payment', waiting_for_payment: 'awaiting_payment', pending: 'awaiting_payment',
  paid: 'paid', payed: 'paid',
  in_way: 'in_way', shipped: 'in_way', on_the_way: 'in_way', delivery: 'in_way',
  delivered: 'delivered',
  received: 'received', completed: 'received',
  canceled: 'canceled', cancelled: 'canceled',
  failed: 'failed', error: 'failed',
  refunded: 'refunded',
}

export function normalizeStatus(raw?: string): OrderStatusKey {
  const key = (raw || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
  return (ALIASES[key] ?? (MAP[key as OrderStatusKey] ? (key as OrderStatusKey) : 'unknown'))
}

export function statusLabel(raw?: string): string {
  const k = normalizeStatus(raw)
  return MAP[k].label
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
