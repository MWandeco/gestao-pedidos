import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./features/orders/order-list.component').then((m) => m.OrderListComponent),
  },
  {
    path: 'pedidos/novo',
    loadComponent: () =>
      import('./features/orders/create-order.component').then((m) => m.CreateOrderComponent),
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./features/products/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/customers/customer-list.component').then((m) => m.CustomerListComponent),
  },
  { path: '**', redirectTo: 'pedidos' },
];
