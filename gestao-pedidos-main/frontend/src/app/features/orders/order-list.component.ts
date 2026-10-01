import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, merge, of, startWith, switchMap } from 'rxjs';
import {
  NEXT_STATUS,
  ORDER_STATUS_LABELS,
  Order,
  OrderStatus,
  canCancel,
} from '../../core/models/order.model';
import { NotificationService } from '../../core/services/notification.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h2>Pedidos</h2>
      <a routerLink="/pedidos/novo" class="btn btn-primary">+ Novo pedido</a>
    </div>

    <form class="row" style="margin-bottom: 16px" [formGroup]="filters">
      <input type="search" formControlName="search" placeholder="Buscar por cliente ou nº do pedido..." style="width: 280px" />
      <select formControlName="status">
        <option value="">Todos os status</option>
        @for (option of statusOptions; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </form>

    <table>
      <thead>
        <tr>
          <th>Nº</th>
          <th>Cliente</th>
          <th>Data</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        @for (order of orders(); track order.id) {
          <tr>
            <td>#{{ order.id }}</td>
            <td>{{ order.customer.name }}</td>
            <td>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ order.totalAmount | currency: 'BRL' }}</td>
            <td>
              <span class="badge" [class]="'badge badge-' + order.status">{{ label(order.status) }}</span>
            </td>
            <td>
              <div class="row">
                <button type="button" class="btn btn-sm" (click)="toggleItems(order.id)">
                  {{ expandedId() === order.id ? 'Ocultar itens' : 'Ver itens' }}
                </button>
                @if (nextStep(order.status); as next) {
                  <button type="button" class="btn btn-sm btn-primary" (click)="changeStatus(order, next.status)">
                    {{ next.label }}
                  </button>
                }
                @if (canCancel(order.status)) {
                  <button type="button" class="btn btn-sm btn-danger" (click)="changeStatus(order, 'CANCELED')">
                    Cancelar
                  </button>
                }
              </div>
            </td>
          </tr>
          @if (expandedId() === order.id) {
            <tr class="items-row">
              <td colspan="6">
                @for (item of order.items; track item.id) {
                  <div>
                    {{ item.quantity }} × {{ item.productName }} — {{ item.unitPrice | currency: 'BRL' }} cada
                    = <strong>{{ item.totalPrice | currency: 'BRL' }}</strong>
                  </div>
                }
              </td>
            </tr>
          }
        } @empty {
          <tr>
            <td colspan="6" class="empty">Nenhum pedido encontrado.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class OrderListComponent {
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reload$ = new Subject<void>();

  protected readonly orders = signal<Order[]>([]);
  protected readonly expandedId = signal<number | null>(null);

  protected readonly filters = this.fb.group({
    search: [''],
    status: ['' as OrderStatus | ''],
  });

  protected readonly statusOptions = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(
    (value) => ({ value, label: ORDER_STATUS_LABELS[value] }),
  );
  protected readonly canCancel = canCancel;

  constructor() {
    merge(this.filters.valueChanges.pipe(debounceTime(300)), this.reload$)
      .pipe(
        startWith(null),
        switchMap(() =>
          this.orderService.list(this.filters.getRawValue()).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((orders) => this.orders.set(orders));
  }

  protected label(status: OrderStatus) {
    return ORDER_STATUS_LABELS[status];
  }

  protected nextStep(status: OrderStatus) {
    return NEXT_STATUS[status];
  }

  protected toggleItems(id: number) {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  protected changeStatus(order: Order, status: OrderStatus) {
    if (status === 'CANCELED' && !confirm(`Cancelar o pedido #${order.id}? Essa ação não pode ser desfeita.`)) {
      return;
    }

    this.orderService.updateStatus(order.id, status).subscribe(() => {
      this.notifications.success(`Pedido #${order.id}: ${ORDER_STATUS_LABELS[status]}.`);
      this.reload$.next();
    });
  }
}
