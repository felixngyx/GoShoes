import { useState } from "react";
import { Link } from "react-router-dom";

const Order = () => {
  // Dữ liệu đơn hàng mẫu
  const orders = [
    {
      id: 1,
      name: "Gucci Shoes",
      date: "2024-07-12",
      price: 70,
      quantity: 2,
      image:
        "https://shopgiayreplica.com/wp-content/uploads/2020/08/giay-gucci-ace-classic-800x650.jpg",
      status: "Processing",
    },
    {
      id: 2,
      name: "Nike Shoes",
      date: "2024-07-12",
      price: 20,
      quantity: 3,
      image:
        "https://product.hstatic.net/1000219207/product/nike-air-force-1-low-like-auth-sieu-cap-rep-1-1_d07f962c30fa4adf928c53a81a56b58d_master.jpg",
      status: "Completed",
    },
    {
      id: 3,
      name: "Adidas Shoes",
      date: "2024-08-12",
      price: 18,
      quantity: 1,
      image: "https://footgearh.vn/thumbs/500x500x2/upload/product/a-8647.jpg",
      status: "Cancelled",
    },
  ];

  // State
  const [filterStatus, setFilterStatus] = useState("");

  // Hàm lọc đơn hàng
  const filteredOrders = orders.filter((order) => {
    // Lọc theo trạng thái
    const matchesStatus = filterStatus ? order.status === filterStatus : true;

    return matchesStatus;
  });

  return (
    <div className="Order-all col-span-9 space-y-8">
      <div className="title-order text-[#4182F9] font-semibold text-[16px]">
        Order
      </div>
      {/* Bộ lọc */}
      <div className="w-full ">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg grid gap-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="text-stone-600 text-sm font-medium"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter name"
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="text-stone-600 text-sm font-medium"
              >
                Start Date
              </label>
              <input
                type="date"
                id="date"
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="text-stone-600 text-sm font-medium"
              >
                End Date
              </label>
              <input
                type="date"
                id="date"
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="status"
                className="text-stone-600 text-sm font-medium"
              >
                Status
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">All</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 justify-end space-x-4 md:flex">
            <button className="active:scale-95 rounded-lg bg-gray-200 px-8 py-2 font-medium text-gray-600 outline-none focus:ring hover:opacity-90">
              Reset
            </button>
            <button className="active:scale-95 rounded-lg bg-blue-600 px-8 py-2 font-medium text-white outline-none focus:ring hover:opacity-90">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="order-list rounded-xl w-full border border-gray-200 shadow-lg">
        <div className="main-data p-8 sm:p-14 bg-gray-50 rounded-3xl w-full">
          <h2 className="text-center font-manrope font-semibold text-4xl text-black mb-16">
            Order History
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="pb-9">
                  <th className="font-medium text-lg leading-8 text-indigo-600 text-left">
                    Product
                  </th>
                  <th className="font-medium text-lg leading-8 text-gray-600 text-center">
                    Price
                  </th>
                  <th className="font-medium text-lg leading-8 text-gray-600 text-center">
                    Qty
                  </th>
                  <th className="font-medium text-lg leading-8 text-gray-500 text-center">
                    Status
                  </th>
                  <th className="text-center"></th>
                </tr>
              </thead>
              <tbody>
                {/* Hiển thị đơn hàng */}
                {filteredOrders.map((order) => (
                  <tr className="cursor-pointer transition-all duration-500 hover:bg-indigo-50 ">
                    <td className="flex items-center space-x-4 p-4">
                      <img
                        src={order.image}
                        alt="earbuds image"
                        className="w-26 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h5 className="font-manrope font-semibold text-sm text-black mb-1 whitespace-nowrap">
                          {order.name}
                        </h5>
                        <p className="order-time text-xs text-[#5C5F6A]">
                          Ordered on: {order.date}
                        </p>
                        <p className="font-semibold text-sm text-gray-600">
                          White
                        </p>
                      </div>
                    </td>
                    <td className="text-center text-[#0E1422] text-sm font-semibold p-4">
                      ${order.price.toFixed(2)}
                    </td>
                    <td className="text-center font-semibold text-sm text-indigo-600 p-4">
                      {order.quantity}
                    </td>
                    <td
                      className={`status-order text-center font-medium text-sm whitespace-nowrap p-4 ${
                        order.status === "Processing"
                          ? "text-[#0E1422]"
                          : order.status === "Completed"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/account/my-order/${order.id}`}
                        className="btn btn-outline hover:bg-[#4182F9]"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Phân trang */}
            <div className="flex justify-center mt-4">
              <div className="join">
                <button className="join-item btn">1</button>
                <button className="join-item btn">2</button>
                <button className="join-item btn btn-disabled">...</button>
                <button className="join-item btn">99</button>
                <button className="join-item btn">100</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
