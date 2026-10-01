export type OrderStatus = 'PENDING' | 'IN_PREPARATION' | 'READY' | 'FINISHED' | 'CANCELED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customer: { id: number; name: string };
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customerId: number;
  items: { productId: number; quantity: number }[];
}

export interface OrderFilters {
  status?: OrderStatus | '';
  search?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  IN_PREPARATION: 'Em preparação',
  READY: 'Pronto',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
};

/** Próxima etapa do fluxo normal; pedidos finalizados ou cancelados não avançam. */
export const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PENDING: { status: 'IN_PREPARATION', label: 'Preparar' },
  IN_PREPARATION: { status: 'READY', label: 'Marcar pronto' },
  READY: { status: 'FINISHED', label: 'Finalizar' },
};

export function canCancel(status: OrderStatus): boolean {
  return status !== 'FINISHED' && status !== 'CANCELED';
}
