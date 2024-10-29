import { Variant } from "./variants";

export interface IProduct {
  id: number;
  brand_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  promotional_price: number;
  rating_count: number;
  slug: string;
  thumbnail: string;
  variants: Variant[];
}
