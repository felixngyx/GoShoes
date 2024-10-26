import React, { useState } from 'react'
import { FaShoppingCart, FaUser, FaMinus, FaPlus, FaTrashAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom' 

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

const CartItemComponent: React.FC<{
  item: CartItem
  onIncrease: (id: number) => void
  onDecrease: (id: number) => void
  onRemove: (id: number) => void
}> = ({ item, onIncrease, onDecrease, onRemove }) => (
  <div className="flex items-center justify-between border-b py-4">
    <div className="flex items-center space-x-4">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="btn btn-ghost btn-circle btn-sm" onClick={() => onDecrease(item.id)}>
        <FaMinus />
      </button>
      <span className="text-lg font-semibold">{item.quantity}</span>
      <button className="btn btn-ghost btn-circle btn-sm" onClick={() => onIncrease(item.id)}>
        <FaPlus />
      </button>
      <button className="btn btn-ghost btn-circle btn-sm text-red-500" onClick={() => onRemove(item.id)}>
        <FaTrashAlt />
      </button>
    </div>
    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
  </div>
)

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "Nike Cortez '72 sneakers", price: 89.99, quantity: 1, image: "/placeholder.svg?height=64&width=64" },
    { id: 2, name: "Nike Air Max 270 React", price: 129.99, quantity: 1, image: "/placeholder.svg?height=64&width=64" },
  ])

  const handleIncrease = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ))
  }

  const handleDecrease = (id: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    ))
  }

  const handleRemove = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingFee = 10
  const total = subtotal + shippingFee

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">My Store</Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/packages">Packages</Link></li>
            <li><Link href="/help">Help</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <button className="btn btn-ghost btn-circle">
            <FaUser size={20} />
          </button>
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FaShoppingCart size={20} />
              <span className="badge badge-sm indicator-item">{cartItems.length}</span>
            </div>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {cartItems.map((item) => (
              <CartItemComponent 
                key={item.id} 
                item={item} 
                onIncrease={handleIncrease} 
                onDecrease={handleDecrease} 
                onRemove={handleRemove} 
              />
            ))}
          </div>
          <div className="lg:w-1/3">
            <div className="bg-base-200 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button 
                className="btn btn-primary btn-block mt-6"
                onClick={() => alert(`Proceeding to checkout with total amount: $${total.toFixed(2)}`)}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer p-10 bg-base-200 text-base-content">
        <div>
          <span className="footer-title">Company</span> 
          <Link href="/about" className="link link-hover">About us</Link>
          <Link href="/contact" className="link link-hover">Contact</Link>
          <Link href="/jobs" className="link link-hover">Jobs</Link>
          <Link href="/press-kit" className="link link-hover">Press kit</Link>
        </div> 
        <div>
          <span className="footer-title">Legal</span> 
          <Link href="/terms" className="link link-hover">Terms of use</Link>
          <Link href="/privacy" className="link link-hover">Privacy policy</Link>
          <Link href="/cookie" className="link link-hover">Cookie policy</Link>
        </div> 
        <div>
          <span className="footer-title">Newsletter</span> 
          <div className="form-control w-80">
            <label className="label">
              <span className="label-text">Enter your email address</span>
            </label> 
            <div className="relative">
              <input type="text" placeholder="username@site.com" className="input input-bordered w-full pr-16" /> 
              <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}