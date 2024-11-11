export interface Variant {
  id: number;
  product_id: number;
  size_id: number;
  image_variant: string;
  color_id: number;
  quantity: number;
  color: Color;
  size: Size;
}

export interface Color {
  id: number;
  color: string;
  link_image: string;
}

export interface Size {
  id: number;
  size: string;
}
