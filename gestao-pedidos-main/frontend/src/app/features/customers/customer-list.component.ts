import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../core/models/customer.model';
import { CustomerService } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-customer-list',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Clientes</h2>

    <form class="card" [formGroup]="form" (ngSubmit)="save()">
      <h3>{{ editingId() ? 'Editar cliente' : 'Novo cliente' }}</h3>
      <div class="row">
        <div class="field">
          <input type="text" formControlName="name" placeholder="Nome" maxlength="100" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="field-error">Informe o nome (mínimo 2 caracteres).</span>
          }
        </div>
        <div class="field">
          <input type="tel" formControlName="phone" placeholder="Telefone" maxlength="20" />
          @if (form.controls.phone.touched && form.controls.phone.invalid) {
            <span class="field-error">Informe um telefone válido.</span>
          }
        </div>
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
          <th>Telefone</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        @for (customer of customers(); track customer.id) {
          <tr>
            <td>#{{ customer.id }}</td>
            <td>
              <strong>{{ customer.name }}</strong>
            </td>
            <td>{{ customer.phone }}</td>
            <td>
              <button type="button" class="btn btn-sm" (click)="edit(customer)">Editar</button>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="4" class="empty">Nenhum cliente cadastrado.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9()+\-\s]{8,20}$/)]],
  });

  ngOnInit() {
    this.load();
  }

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const id = this.editingId();
    const request$ =
      id === null ? this.customerService.create(payload) : this.customerService.update(id, payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.notifications.success(id === null ? 'Cliente cadastrado.' : 'Cliente atualizado.');
        this.resetForm();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected edit(customer: Customer) {
    this.editingId.set(customer.id);
    this.form.setValue({ name: customer.name, phone: customer.phone });
  }

  protected resetForm() {
    this.editingId.set(null);
    this.saving.set(false);
    this.form.reset();
  }

  private load() {
    this.customerService.list().subscribe((customers) => this.customers.set(customers));
  }
}
