import {  
  FaRegTrashAlt,  
  FaRegUser,  
  FaRegMap,  
  FaRegHeart,  
  FaRegClipboard,  
} from "react-icons/fa";  
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {  
  const { pathname } = useLocation();

  // Hàm kiểm tra đường dẫn đang active
  const isActive = (path: string) => {
    return pathname.includes(path) ? "text-[#40BFFF]" : "text-gray-500";
  };

  return (  
    <div className="p-5 border border-gray-200 shadow-lg rounded-lg h-auto md:h-screen md:p-10 md:col-span-3">  
      <ul className="flex flex-col gap-5 text-base md:text-lg font-normal">  
        <Link  
          to="/account"  
          className={`flex items-center gap-4 ${isActive("/account")} hover:text-[#40BFFF]`}  
        >  
          <FaRegUser /> Basic information  
        </Link>  

        <Link  
          to="/account/my-order"  
          className={`flex items-center gap-4 ${isActive("/my-order")} hover:text-[#40BFFF]`}  
        >  
          <FaRegClipboard /> Orders  
        </Link>  

        <Link  
          to="/account/my-address"  
          className={`flex items-center gap-4 ${isActive("/my-address")} hover:text-[#40BFFF]`}  
        >  
          <FaRegMap /> Address  
        </Link>  

        <Link  
          to="/account/delete"  
          className={`flex items-center gap-4 ${isActive("/delete")} hover:text-[#40BFFF]`}  
        >  
          <FaRegTrashAlt /> Delete account  
        </Link>  

        <Link  
          to="/account/whish-list"  
          className={`flex items-center gap-4 ${isActive("/whish-list")} hover:text-[#40BFFF]`}  
        >  
          <FaRegHeart /> Wishlist  
        </Link>  
      </ul>  
    </div>  
  );  
};

export default Sidebar;
