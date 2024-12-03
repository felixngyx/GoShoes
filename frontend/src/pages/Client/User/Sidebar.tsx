import React, { useState } from 'react';
import {
  FaTrash,
  FaBell,
  FaCreditCard,
  FaLock,
  FaMapMarkedAlt,
  FaUser,
  FaShoppingCart,
  FaHeart,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === 'account') {
      return pathname === '/account' ? 'text-[#4182F9]' : '';
    }
    return pathname.includes(path) ? 'text-[#4182F9]' : '';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    { path: '/account', icon: <FaUser />, text: 'Basic information' },
    { path: '/account/my-order', icon: <FaShoppingCart />, text: 'Orders' },
    { path: '/account/my-address', icon: <FaMapMarkedAlt />, text: 'Address' },
    { path: '/account/notifications', icon: <FaBell />, text: 'Notifications' },
    { path: '/account/whish-list', icon: <FaHeart />, text: 'Wishlist' },
  ];

  return (
    <div className="col-span-3 lg:p-10 border border-gray-200 shadow-lg lg:h-screen rounded-lg">
      {/* Mobile menu toggle */}
      <div className="lg:hidden flex justify-between items-center p-4">
        <button onClick={toggleMobileMenu} className="text-2xl">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menu items */}
      <ul className={`flex flex-col gap-5 text-lg text-gray-500 font-normal ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-4 p-2 hover:bg-gray-100 rounded ${isActive(item.path.split('/').pop() || '')}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.icon} {item.text}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;