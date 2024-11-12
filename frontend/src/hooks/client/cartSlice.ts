import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../../types/client/cart";

// Định nghĩa giao diện cho trạng thái giỏ hàng
interface CartState {
  items: CartItem[];
}

// Khởi tạo giá trị ban đầu cho giỏ hàng
const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Cập nhật toàn bộ giỏ hàng (thường dùng khi load từ API)
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.product_variant.id === action.payload.product_variant.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.product_variant.id !== action.payload
      );
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartQuantity: (
      state,
      action: PayloadAction<{ productVariantId: number; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.product_variant.id === action.payload.productVariantId
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
  },
});

// Xuất ra các action để sử dụng trong các component
export const { setCartItems, addToCart, removeFromCart, updateCartQuantity } =
  cartSlice.actions;

// Xuất reducer của slice để thêm vào store
export default cartSlice.reducer;
