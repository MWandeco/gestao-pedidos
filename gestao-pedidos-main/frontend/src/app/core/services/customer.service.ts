import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { Customer, CustomerPayload } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<ApiResponse<Customer[]>>('/customers').pipe(map((res) => res.data));
  }

  create(payload: CustomerPayload) {
    return this.http.post<ApiResponse<Customer>>('/customers', payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: Partial<CustomerPayload>) {
    return this.http
      .put<ApiResponse<Customer>>(`/customers/${id}`, payload)
      .pipe(map((res) => res.data));
  }
}
