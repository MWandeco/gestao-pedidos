import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { CreateOrderPayload, Order, OrderFilters, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  list(filters: OrderFilters = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());

    return this.http.get<ApiResponse<Order[]>>('/orders', { params }).pipe(map((res) => res.data));
  }

  create(payload: CreateOrderPayload) {
    return this.http.post<ApiResponse<Order>>('/orders', payload).pipe(map((res) => res.data));
  }

  updateStatus(id: number, status: OrderStatus) {
    return this.http
      .patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
