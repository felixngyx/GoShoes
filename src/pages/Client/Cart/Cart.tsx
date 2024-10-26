import React, { useState } from 'react';
import { FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import Breadcrumb from '../../../components/client/Breadcrumb';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
}

const CartItemComponent: React.FC<{
  item: CartItem;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}> = ({ item, onIncrease, onDecrease, onRemove }) => (
  <tr>
    <td>
      <button className="btn btn-ghost btn-xs text-red-500" onClick={() => onRemove(item.id)}>
        <FaTimes />
      </button>
    </td>
    <td>
      <div className="flex items-center space-x-3">
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={item.image} alt={item.name} />
          </div>
        </div>
        <div>
          <div className="font-bold">{item.name}</div>
          <div className="text-sm text-gray-500">{item.color}</div>
        </div>
      </div>
    </td>
    <td>${item.price}</td>
    <td>
      <div className="flex items-center space-x-2">
        <button className="btn btn-ghost btn-xs" onClick={() => onDecrease(item.id)}>
          <FaMinus />
        </button>
        <span>{item.quantity}</span>
        <button className="btn btn-ghost btn-xs" onClick={() => onIncrease(item.id)}>
          <FaPlus />
        </button>
      </div>
    </td>
    <td>${item.price * item.quantity}</td>
  </tr>
);

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "Nike Airmax 270 react", price: 499, quantity: 2, image: "/src/images/product/Product Image.png", color: "Red" },
    { id: 2, name: "Nike Airmax 270 react", price: 499, quantity: 2, image: "/src/images/product/image Product.png", color: "Purple/White" },
  ]);

  const [voucherCode, setVoucherCode] = useState('');

  const handleIncrease = (id: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrease = (id: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ));
  };

  const handleRemove = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = 20;
  const total = subtotal + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { name: 'Home', link: '' },
          { name: 'Cart', link: 'cart' },
        ]}
      />

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th></th>
              <th>PRODUCT</th>
              <th>PRICE</th>
              <th>QTY</th>
              <th>UNIT PRICE</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between mt-8">
        <div className="form-control w-full md:w-1/3 mb-4 md:mb-0">
          <div className="input-group flex">
            <input
              type="text"
              placeholder="Voucher code"
              className="input input-bordered w-full rounded-l-md border-r-0 focus:outline-none focus:ring-0"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button className="btn" style={{ backgroundColor: '#40BFFF', color: 'white' }}>Redeem</button>
          </div>
        </div>

        <div className="card bg-base-200 w-full md:w-1/3 shadow-lg rounded-lg">
          <div className="card-body">
            <h2 className="card-title">Order Summary</h2>
            <div className="flex justify-between py-2 border-b">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Shipping fee</span>
              <span>${shippingFee}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Coupon</span>
              <span>No</span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>TOTAL</span>
              <span>${total}</span>
            </div>
            <button
              className="btn btn-block mt-4" 
              style={{ backgroundColor: '#40BFFF', color: 'white' }}
              onClick={() => alert(`Proceeding to checkout with total amount: $${total}`)}
            >
              Check out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
