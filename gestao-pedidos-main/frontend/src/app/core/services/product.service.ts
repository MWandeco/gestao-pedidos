import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiResponse } from '../models/api.model';
import { Product, ProductPayload } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<ApiResponse<Product[]>>('/products').pipe(map((res) => res.data));
  }

  create(payload: ProductPayload) {
    return this.http.post<ApiResponse<Product>>('/products', payload).pipe(map((res) => res.data));
  }

  update(id: number, payload: Partial<ProductPayload>) {
    return this.http
      .put<ApiResponse<Product>>(`/products/${id}`, payload)
      .pipe(map((res) => res.data));
  }
}
