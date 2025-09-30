// types/order.ts
export type DeliveryKind =
  | 'courier_daigo'
  | 'courier_major'
  | 'pvz_cdek'
  | 'pickup';

export type PaymentMethod =
  | 'sbp'
  | 'tbank'
  | 'dolyame'
  | 'bank_card'
  | 'courier_card'
  | 'cash';

export interface OrderItem {
  product_id: string;
  quantity: number;
  // не участвует в расчётах — просто подсказки для бэка/аналитики
  name_hint?: string;
  unit_price_hint?: number;
  amo_id?: string | null;
}

export interface OrderRecipient {
  name: string;
  phone: string;
  email: string;
  city?: string;
}

export interface OtherRecipient {
  enabled: boolean;
  name?: string;
  phone?: string;
}

export interface CourierAddress {
  type: 'courier';
  provider: 'daigo' | 'major';
  is_private: boolean;
  street: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
}

export interface PvzAddress {
  type: 'pvz';
  provider: 'cdek';
  address: string;           // строка вида "г. Москва, ПВЗ СДЭК №..."
  pickup_point_id?: string;  // если будет ID точки
}

export interface PickupAddress {
  type: 'pickup';
  address: string;           // адрес самовывоза
  schedule?: string;         // график работы
}

export type DeliveryAddress = CourierAddress | PvzAddress | PickupAddress;

export interface CreateOrderPayload {
  daigo_id: string;

  recipient: OrderRecipient;

  other_recipient?: OtherRecipient;

  delivery: DeliveryAddress;

  payment: {
    method: PaymentMethod;
  };

  comment?: string;

  items: OrderItem[]; // только реальные позиции

  consent_personal?: boolean;
  consent_marketing?: boolean;

  // подсказываем бэку сумму позиций (не для расчётов на фронте)
  client_totals_hint?: {
    items_sum?: number;
  };
}

export interface CreateOrderResponse {
  order_id?: string | number;
  confirmation?: {
    confirmation_url?: string;
    expires_at?: string;
  };
}
