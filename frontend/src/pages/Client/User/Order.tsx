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
    <div>
      <div className="Order-all ml-[50px]">
        <div className="title-order text-[#4182F9] font-semibold text-[16px]">
          Order
        </div>
        {/* Bộ lọc */}
        <div className="m-2 w-[1100px] ">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
              <button className="active:scale-95 rounded-lg bg-gray-200 px-8 py-2 font-medium text-gray-600 outline-none focus:ring hover:opacity-90">
                Reset
              </button>
              <button className="active:scale-95 rounded-lg bg-blue-600 px-8 py-2 font-medium text-white outline-none focus:ring hover:opacity-90">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="order-list rounded-xl w-[1100px] mt-[56px] space-y-4 border border-gray-200 shadow-lg">
          <div className="main-data p-8 sm:p-14 bg-gray-50 rounded-3xl w-full">
            <h2 className="text-center font-manrope font-semibold text-4xl text-black mb-16">
              Order History
            </h2>
            <div className="grid grid-cols-12 pb-9 items-center">
              <div className="col-span-6">
                <p className="font-medium text-lg leading-8 text-indigo-600">
                  Product
                </p>
              </div>
              <div className="col-span-2 text-center -ml-[100px]">
                <p className="font-medium text-lg leading-8 text-gray-600">
                  Price
                </p>
              </div>
              <div className="col-span-1 text-center -ml-[120px]">
                <p className="font-medium text-lg leading-8 text-gray-600">
                  Qty
                </p>
              </div>
              <div className="col-span-2 text-center -ml-[150px]">
                <p className="font-medium text-lg leading-8 text-gray-500">
                  Status
                </p>
              </div>
            </div>

            {/* Hiển thị đơn hàng */}
            {filteredOrders.map((order) => (
              <div className="box p-8 rounded-3xl bg-gray-100 grid grid-cols-12 mb-7 cursor-pointer transition-all duration-500 hover:bg-indigo-50 items-center">
                <div className="col-span-2">
                  <img
                    src={order.image}
                    alt="earbuds image"
                    className="max-lg:w-auto max-sm:mx-auto rounded-xl object-cover"
                  />
                </div>

                <div className="col-span-4 flex h-full justify-center pl-4 flex-col max-lg:items-center">
                  <h5 className="font-manrope font-semibold text-sm leading-9 text-black mb-1 whitespace-nowrap">
                    {order.name}
                  </h5>
                  <p className="order-time text-[12px] text-[#5C5F6A]">
                    Ordered on: {order.date}
                  </p>
                  <p className="font-semibold text-sm leading-7 text-gray-600 max-md:text-center">
                    White
                  </p>
                </div>

                <div className="col-span-2 text-center">
                  <p className=" text-[#0E1422] text-[14px] font-semibold leading-8 -ml-[80px]">
                    ${order.price.toFixed(2)}
                  </p>
                </div>

                <div className="col-span-1 text-center">
                  <p className="font-semibold text-[14] leading-8 text-indigo-600  -ml-[80px]">
                    {order.quantity}
                  </p>
                </div>

                <div
                  className={`status-order w-[100px] font-medium text-sm leading-6 whitespace-nowrap py-0.5 px-4 rounded-full lg:mt-3  ${
                    order.status === "Processing"
                      ? "text-[#0E1422]" // màu cho Processing
                      : order.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600" // màu cho Completed
                      : " text-red-600" // màu cho Cancelled
                  }`}
                >
                  {order.status}
                </div>
                <div className="ml-[90px]">
                  <Link
                    to={`/account/order/${order.id}`}
                    className="btn btn-outline hover:bg-[#4182F9]"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
