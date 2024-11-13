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
  variants: Variant[];
  categories: [];
}

interface Variant {
  id: number;
  color: string;
  size: 0;
  image_variant: string;
  quantity: number;
}
