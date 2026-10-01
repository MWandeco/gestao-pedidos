/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  customers: {
    index: typeof routes['customers.index']
    store: typeof routes['customers.store']
    update: typeof routes['customers.update']
  }
  products: {
    index: typeof routes['products.index']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
  }
  orders: {
    index: typeof routes['orders.index']
    store: typeof routes['orders.store']
    show: typeof routes['orders.show']
    updateStatus: typeof routes['orders.update_status']
  }
}
