export interface Customer {
  id: number;
  name: string;
  phone: string;
}

export type CustomerPayload = Pick<Customer, 'name' | 'phone'>;
