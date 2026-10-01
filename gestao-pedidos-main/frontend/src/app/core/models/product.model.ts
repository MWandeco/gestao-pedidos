export interface Product {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export type ProductPayload = Pick<Product, 'name' | 'price' | 'isActive'>;
