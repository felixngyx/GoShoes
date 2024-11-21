import {
  FaTrash,
  FaBell,
  FaCreditCard,
  FaLock,
  FaMapMarkedAlt,
  FaUser,
} from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";  // Import icon cho wishlist
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === "account") {
      return pathname === "/account" ? "text-[#4182F9]" : "";
    }
    return pathname.includes(path) ? "text-[#4182F9]" : "";
  };

  return (
    <div className="col-span-3 p-10 border border-gray-200 shadow-lg h-screen rounded-lg">
      <ul className="flex flex-col gap-5 text-lg text-gray-500 font-normal">
        <Link
          to="/account"
          className={`flex items-center gap-4 ${isActive("account")}`}
        >
          <FaUser /> Basic information
        </Link>
        <Link
          to="/account/my-order"
          className={`flex items-center gap-4 ${isActive("my-order")}`}
        >
          <FaShoppingCart /> Orders
        </Link>
        <Link
          to="/account/my-address"
          className={`flex items-center gap-4 ${isActive("address")}`}
        >
          <FaMapMarkedAlt /> Address
        </Link>
        <Link
          to="/account/payment"
          className={`flex items-center gap-4 ${isActive("payment")}`}
        >
          <FaCreditCard /> Payment
        </Link>
        <Link
          to="/account/notifications"
          className={`flex items-center gap-4 ${isActive("notifications")}`}
        >
          <FaBell /> Notifications
        </Link>
        <Link
          to="/account/security"
          className={`flex items-center gap-4 ${isActive("security")}`}
        >
          <FaLock /> Security
        </Link>
        <Link
          to="/account/delete"
          className={`flex items-center gap-4 ${isActive("delete")}`}
        >
          <FaTrash /> Delete account
        </Link>
        <Link
          to="/account/whish-list"  
          className={`flex items-center gap-4 ${isActive("wishlist")}`}
        >
          <FaHeart /> Wishlist 
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
