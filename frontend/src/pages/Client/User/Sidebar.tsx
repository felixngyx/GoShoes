import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="col-span-3 p-5 border border-gray-200 shadow-lg h-screen rounded-lg">
      <ul>
        <li className="font-semibold text-lg">Manage my account</li>
        <ul className="flex flex-col gap-2 pl-5 mt-2 text-md text-gray-500">
          <Link to="/account">My profile</Link>
          <li>Payment</li>
        </ul>
        <li className="font-semibold text-lg mt-5">My orders</li>
        <ul className="flex flex-col gap-2 pl-5 mt-2 text-md text-gray-500">
          <Link to="my-order">Orders</Link>
        </ul>
        <li className="font-semibold text-lg mt-5">My Address</li>
        <ul className="flex flex-col gap-2 pl-5 mt-2 text-md text-gray-500">
          <Link to="my-address">Address</Link>
        </ul>
      </ul>
    </div>
  );
};

export default Sidebar;
