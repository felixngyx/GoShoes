export interface CartItem {
  quantity: number;
  product_variant: {
    id: number;
    product_id: number;
    size_id: number;
    image_variant: string;
    color_id: number;
    quantity: number;
    product: {
      name: string;
      price: string;
      promotional_price: string;
    };
    color: {
      color: string;
    };
    size: {
      size: string;
    };
  };
}
