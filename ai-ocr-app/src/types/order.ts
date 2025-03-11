export interface OrderItem {
  name: string;
  quantity: string | number;
  unitPrice?: number;
  amount?: number;
}

export interface OrderData {
  orderNumber?: string;
  orderDate?: string;
  supplier?: string;
  items: OrderItem[];
  totalAmount?: number;
}
