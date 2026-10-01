export const ORDER_STATUSES = ['PENDING', 'IN_PREPARATION', 'READY', 'FINISHED', 'CANCELED'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  IN_PREPARATION: 'Em preparação',
  READY: 'Pronto',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
}

/**
 * Fluxo permitido: Pendente → Em preparação → Pronto → Finalizado.
 * Um pedido pode ser cancelado até ser finalizado, e nunca sai de "Cancelado".
 */
const STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['IN_PREPARATION', 'CANCELED'],
  IN_PREPARATION: ['READY', 'CANCELED'],
  READY: ['FINISHED', 'CANCELED'],
  FINISHED: [],
  CANCELED: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}
