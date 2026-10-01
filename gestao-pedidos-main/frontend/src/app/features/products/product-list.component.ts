import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Produtos</h2>

    <form class="card" [formGroup]="form" (ngSubmit)="save()">
      <h3>{{ editingId() ? 'Editar produto' : 'Novo produto' }}</h3>
      <div class="row">
        <div class="field">
          <input type="text" formControlName="name" placeholder="Nome (ex: X-Burger)" maxlength="100" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="field-error">Informe o nome (mínimo 2 caracteres).</span>
          }
        </div>
        <div class="field">
          <input type="number" formControlName="price" placeholder="Preço" min="0.01" step="0.01" />
          @if (form.controls.price.touched && form.controls.price.invalid) {
            <span class="field-error">Informe um preço maior que zero.</span>
          }
        </div>
        <label class="row" style="align-items: center">
          <input type="checkbox" formControlName="isActive" /> Ativo
        </label>
        <button type="submit" class="btn btn-success" [disabled]="saving()">
          {{ editingId() ? 'Atualizar' : 'Cadastrar' }}
        </button>
        @if (editingId()) {
          <button type="button" class="btn" (click)="resetForm()">Cancelar</button>
        }
      </div>
    </form>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Preço</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        @for (product of products(); track product.id) {
          <tr>
            <td>#{{ product.id }}</td>
            <td>
              <strong>{{ product.name }}</strong>
            </td>
            <td>{{ product.price | currency: 'BRL' }}</td>
            <td>
              <span class="badge" [class]="'badge ' + (product.isActive ? 'badge-ACTIVE' : 'badge-INACTIVE')">
                {{ product.isActive ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td>
              <div class="row">
                <button type="button" class="btn btn-sm" (click)="edit(product)">Editar</button>
                <button type="button" class="btn btn-sm" (click)="toggleStatus(product)">
                  {{ product.isActive ? 'Desativar' : 'Ativar' }}
                </button>
              </div>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="5" class="empty">Nenhum produto cadastrado.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly products = signal<Product[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    isActive: [true],
  });

  ngOnInit() {
    this.load();
  }

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, price, isActive } = this.form.getRawValue();
    const payload = { name, price: Number(price), isActive };
    const id = this.editingId();
    const request$ =
      id === null ? this.productService.create(payload) : this.productService.update(id, payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.notifications.success(id === null ? 'Produto cadastrado.' : 'Produto atualizado.');
        this.resetForm();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected edit(product: Product) {
    this.editingId.set(product.id);
    this.form.setValue({ name: product.name, price: product.price, isActive: product.isActive });
  }

  protected toggleStatus(product: Product) {
    this.productService.update(product.id, { isActive: !product.isActive }).subscribe(() => {
      this.notifications.success(product.isActive ? 'Produto desativado.' : 'Produto ativado.');
      this.load();
    });
  }

  protected resetForm() {
    this.editingId.set(null);
    this.saving.set(false);
    this.form.reset({ name: '', price: null, isActive: true });
  }

  private load() {
    this.productService.list().subscribe((products) => this.products.set(products));
  }
}
