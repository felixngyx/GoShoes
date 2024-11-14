import React from 'react';
import { CheckCheckIcon } from 'lucide-react';

interface Product {
  name: string;
  thumbnail: string;
}

interface OrderItem {
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
  variant: {
    size?: string;
    color?: string;
  } | null;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface Shipping {
  address: string;
  city: string;
}

interface OrderData {
  id: number;
  sku: string;
  status: string;
  total: string;
  created_at: string;
  customer: Customer;
  shipping: Shipping;
  items: OrderItem[];
}

interface PrintInvoiceProps {
  order: OrderData;
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ order }) => {
  const formatPrice = (price: number | string): string => {
    return new Intl.NumberFormat('de-DE', { style: 'decimal' }).format(Number(price));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white print:p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">Invoice #{order.sku}</h1>
          <p className="text-gray-600 mt-1">Thank you!</p>
        </div>
        <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <CheckCheckIcon className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Variant</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Quantity</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Price</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.variant ? (
                    <>
                      {item.variant.size && <span>Size: {item.variant.size}</span>}
                      {item.variant.size && item.variant.color && <span> | </span>}
                      {item.variant.color && <span>Color: {item.variant.color}</span>}
                    </>
                  ) : (
                    'Non Variable'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatPrice(item.price)}đ</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatPrice(item.subtotal)}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-600">Total amout</span>
            <span className="font-bold">{formatPrice(order.total)}đ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-medium mb-2">Seller:</h3>
          <p className="text-sm text-gray-600">
            Store :  GoShoes<br />
            Address : FPOLY , TVB , HN<br />
            Phone: 0999999888<br />
            email: contact@goshoes.com
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Customer:</h3>
          <p className="text-sm text-gray-600">
            Name : {order.customer.name}<br />
            Address: {order.shipping.address}<br />
            City : {order.shipping.city}<br />
            Email : {order.customer.email}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 print:mt-6">
        @goshoes 2024
      </div>
    </div>
  );
};

export default PrintInvoice;