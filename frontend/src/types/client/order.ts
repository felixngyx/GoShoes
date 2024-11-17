export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'expired'
  | 'shipping'
  | 'failed';

interface ProductItem {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
}

interface OrderItem {
  id: string;
  product: ProductItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  sku: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  original_total: number;
  created_at: string;
}

export interface Tab {
  id: OrderStatus | 'all';
  label: string;
  color: string;
}
