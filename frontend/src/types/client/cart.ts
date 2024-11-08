export interface CartItem {
  product_id: number;
  quantity: number;
  price: string;
  variant_id?: number | null;
}

export interface AddToCartPayload {
  user_id: number;
  items: CartItem[];
  shipping_id: number;
}

export interface AddToCartResponse {
  order: {
    id: number;
    user_id: number;
    total: number;
    status: string;
    shipping_id: number;
    sku: string;
    original_total: number;
    updated_at: string;
    created_at: string;
    items: Array<{
      id: number;
      order_id: number;
      product_id: number;
      price: string;
      quantity: number;
      variant_id?: number | null;
      created_at: string;
      updated_at: string;
      product: {
        id: number;
        name: string;
        price: string;
        stock_quantity: number;
        promotional_price?: string;
        sku: string;
        thumbnail: string;
        description: string;
      };
      variant?: any;
    }>;
    shipping: {
      id: number;
      address: string;
      city: string;
      postal_code: string;
      country: string;
      phone_number: string;
    };
    payment: {
      order_id: number;
      method_id: number;
      status: string;
      url: string;
      method: {
        id: number;
        name: string;
        description?: string;
      };
    };
  };
  payment_url: string;
  original_total: number;
  discount_amount: number;
  final_total: number;
}
