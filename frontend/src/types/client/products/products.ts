export interface IProduct {
  id: number;
  brand_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  promotional_price: number;
  status: string;
  sku: string;
  hashtag: string;
  rating_count: number;
  slug: string;
  images: [];
  thumbnail: string;
  variants: [];
  categories: [];
}
