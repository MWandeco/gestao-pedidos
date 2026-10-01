import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';
import { CustomerService } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-create-order',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h2>Novo pedido</h2>
      <a routerLink="/pedidos" class="btn">Voltar</a>
    </div>

    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="field" style="margin-bottom: 16px">
        <label for="customer"><strong>Cliente</strong></label>
        <select id="customer" formControlName="customerId" style="max-width: 320px">
          <option [ngValue]="null" disabled>Selecione um cliente...</option>
          @for (customer of customers(); track customer.id) {
            <option [ngValue]="customer.id">{{ customer.name }}</option>
          }
        </select>
        @if (form.controls.customerId.touched && form.controls.customerId.invalid) {
          <span class="field-error">Selecione um cliente.</span>
        }
      </div>

      <h3>Produtos <span class="muted">(somente ativos)</span></h3>
      <div formArrayName="items">
        @for (item of items.controls; track item; let i = $index) {
          <div class="row" style="margin-bottom: 10px; align-items: center" [formGroupName]="i">
            <select formControlName="productId" style="flex: 1; min-width: 220px">
              <option [ngValue]="null" disabled>Selecione um produto...</option>
              @for (product of activeProducts(); track product.id) {
                <option [ngValue]="product.id">{{ product.name }} — {{ product.price | currency: 'BRL' }}</option>
              }
            </select>
            <input type="number" formControlName="quantity" min="1" step="1" style="width: 80px" aria-label="Quantidade" />
            <strong style="width: 110px; text-align: right">{{ lines()[i]?.total ?? 0 | currency: 'BRL' }}</strong>
            <button type="button" class="btn btn-sm btn-danger" [disabled]="items.length === 1" (click)="removeItem(i)">
              Remover
            </button>
          </div>
        }
      </div>

      <div class="row" style="justify-content: space-between; align-items: center; margin-top: 16px">
        <button type="button" class="btn" (click)="addItem()">+ Adicionar produto</button>
        <div>
          Total: <strong style="font-size: 18px">{{ total() | currency: 'BRL' }}</strong>
          <button type="submit" class="btn btn-success" style="margin-left: 12px" [disabled]="submitting()">
            Finalizar pedido
          </button>
        </div>
      </div>
    </form>
  `,
})
export class CreateOrderComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly activeProducts = signal<Product[]>([]);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group({
    customerId: this.fb.control<number | null>(null, Validators.required),
    items: this.fb.array([this.createItemGroup()]),
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  private readonly productsById = computed(
    () => new Map(this.activeProducts().map((product) => [product.id, product])),
  );

  /** Prévia dos valores; o backend recalcula tudo a partir do preço atual do produto. */
  protected readonly lines = computed(() =>
    (this.formValue().items ?? []).map((item) => {
      const unitPrice = this.productsById().get(Number(item?.productId))?.price ?? 0;
      return { total: unitPrice * (Number(item?.quantity) || 0) };
    }),
  );
  protected readonly total = computed(() => this.lines().reduce((sum, line) => sum + line.total, 0));

  protected get items() {
    return this.form.controls.items;
  }

  ngOnInit() {
    forkJoin({
      customers: this.customerService.list(),
      products: this.productService.list(),
    }).subscribe(({ customers, products }) => {
      this.customers.set(customers);
      this.activeProducts.set(products.filter((product) => product.isActive));
    });
  }

  protected addItem() {
    this.items.push(this.createItemGroup());
  }

  protected removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { customerId, items } = this.form.getRawValue();
    this.submitting.set(true);

    this.orderService
      .create({
        customerId: customerId!,
        items: items.map((item) => ({ productId: item.productId!, quantity: item.quantity })),
      })
      .subscribe({
        next: (order) => {
          this.notifications.success(`Pedido #${order.id} criado com sucesso.`);
          this.router.navigateByUrl('/pedidos');
        },
        error: () => this.submitting.set(false),
      });
  }

  private createItemGroup() {
    return this.fb.group({
      productId: this.fb.control<number | null>(null, Validators.required),
      quantity: this.fb.control(1, [Validators.required, Validators.min(1)]),
    });
  }
}
