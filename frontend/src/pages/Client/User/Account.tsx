import React from 'react';
import Breadcrumb from "../../../components/client/Breadcrumb";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Account = () => {
  return (
    <div className=" min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { name: "Trang chủ", link: "/" },
            { name: "Tài khoản", link: "/account" },
          ]}
        />
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <Sidebar />
          </aside>
          <main className="lg:col-span-9">
            <div className="bg-white shadow rounded-lg p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;