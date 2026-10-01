import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    nav { display: flex; gap: 8px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #ddd; }
    nav a { padding: 8px 16px; border-radius: 4px; color: #333; text-decoration: none; font-weight: 600; }
    nav a.active { background: #3498db; color: #fff; }
    .toast { position: fixed; right: 20px; bottom: 20px; padding: 12px 18px; border-radius: 6px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
    .toast-success { background: #27ae60; }
    .toast-error { background: #c0392b; }
  `,
  template: `
    <nav>
      <a routerLink="/pedidos" routerLinkActive="active">Pedidos</a>
      <a routerLink="/produtos" routerLinkActive="active">Produtos</a>
      <a routerLink="/clientes" routerLinkActive="active">Clientes</a>
    </nav>

    <main class="page">
      <router-outlet />
    </main>

    @if (notifications.toast(); as toast) {
      <div class="toast" [class]="'toast toast-' + toast.type" role="status">{{ toast.text }}</div>
    }
  `,
})
export class App {
  protected readonly notifications = inject(NotificationService);
}
