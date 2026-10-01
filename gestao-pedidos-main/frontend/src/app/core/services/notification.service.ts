import { Injectable, signal } from '@angular/core';

export interface Toast {
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toast = signal<Toast | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  success(text: string) {
    this.show({ type: 'success', text });
  }

  error(text: string) {
    this.show({ type: 'error', text });
  }

  private show(toast: Toast) {
    clearTimeout(this.timer);
    this.toast.set(toast);
    this.timer = setTimeout(() => this.toast.set(null), 4000);
  }
}
