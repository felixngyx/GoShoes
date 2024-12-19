import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/client/layout";
import SignIn from "./pages/Client/SignIn";
import SignUp from "./pages/Client/SignUp";
import ProductList from "./pages/Client/ProductList";
import ProductDetail from "./pages/Client/ProductDetail";
import Account from "./pages/Client/User/Account";
import Profile from "./pages/Client/User/Profile/Profile";
import DefaultLayout from "./layout/DefaultLayout";
import PageTitle from "./components/admin/PageTitle";
import ECommerce from "./pages/Admin/Dashboard/ECommerce";
import { useEffect } from "react";
import SignInAdmin from "./pages/Admin/Authentication/SignIn";
import Order from "./pages/Client/User/Order";
import NotfoundPage from "./pages/Client/NotfoundPage";
import OrderDetail from "./pages/Client/User/OrderDetail";
import Address from "./pages/Client/User/Address/Address";
import User from "./pages/Admin/User";
import ResetPassword from "./pages/Client/ResetPassword";
import ForgetPassword from "./pages/Client/ForgetPassword";
import Product from "./pages/Admin/Product";
import { Toaster } from "react-hot-toast";
import Attribute from "./pages/Admin/Attribute";
import Homepage from "./pages/Client/home";
import ContactUs from "./pages/Client/ContactUs";
import ChatUI from "./components/client/ChatUi";
import AddProduct from "./pages/Admin/Product/AddProduct";
import UpdateProduct from "./pages/Admin/Product/UpdateProduct";
import Cart from "./pages/Client/Cart";
import CheckoutPage from "./pages/Client/Cart/checkout";
import OrderDashboard from "./pages/Admin/orders";
import DetailOrder from "./pages/Admin/orders/detail";
import DiscountPage from "./pages/Admin/discounts";
import PrivateRoute from "./components/common/PrivateRoute";
import AdminRoute from "./components/common/AdminRoute";
import AboutPage from "./pages/Client/about";
import CreateDiscount from "./pages/Admin/discounts/create";
import Wishlist from "./pages/Client/User/WhishList";
import UpdateDiscount from "./pages/Admin/discounts/update";
import RefundRequest from "./pages/Admin/orders/refundrequest";
import DetailRefund from "./pages/Admin/orders/detailRefund";
import BrandPage from "./pages/Client/Brand";
import CategoryPage from "./pages/Client/Category";
import ProductListBrand from "./pages/Client/Brand/ProductListBrand";
import ProductListCate from "./pages/Client/Category/ProductListCate";
import NewsPage from "./pages/Client/News";
import NewsPageDetail from "./pages/Client/News/NewsPageDetail";
import PaymentSuccess from "./pages/Client/PaymentSuccess";
import PaymentFailed from "./pages/Client/PaymentFailed";
import VerifyEmail from "./pages/Client/SignUp/VerifyEmail";
import Post from "./pages/Admin/Post";
import CreatePost from "./pages/Admin/Post/create";
import UpdatePost from "./pages/Admin/Post/update";
import ContactList from "./pages/Admin/Contact";
import NotificationPage from "./pages/Client/User/Notification";
import DiscountChatWidget from "./components/client/DiscountWiget";
import BannerPage from "./pages/Admin/Banner";
import ViewDetailProduct from "./pages/Admin/Product/ViewDetailProduct";

function App() {
  const { pathname } = useLocation();

  const getTitleByPathname = (path: string): string => {
    const titles: Record<string, string> = {
      "/": "Goshoes",
      "/brand": "Thương Hiệu",
      "/category": "Danh Mục",
      "/news": "Tin Tức",
      "/products": "Dách Sách Sản Phẩm",
      "/products/:id": "Sản Phẩm Chi Tiết",
      "/cart": "Giỏ Hàng",
      "/checkout": "Checkout",
      "/signin": "Đăng Nhập",
      "/signup": "Đăng Kí",
      "/forget-password": "Quên Mật Khẩu",
      "/account": "Tài Khoản",
      "/account/my-order": "Tài Khoản - Đơn Hàng",
      "/account/my-address": "Tài Khoản - Địa Chỉ",
      "/account/notifications": "Tài Khoản - Thông Báo",
      "/account/whish-list": "Tài Khoản - Yêu Thích",
      "/about-us": "Giới Thiệu",
      "/contact": "Liên Hệ",
      "/admin": "Admin Dashboard",
      "/admin/user": "Admin - User Management",
      "/admin/product": "Admin - Product Management",
      "/admin/attribute": "Admin - Product Attribute",
      "/admin/orders": "Admin - Order Management",
      "/admin/orders/refund-request": "Admin - Order Refund",
      "/admin/discounts": "Admin - Discount Management",
      "/admin/post": "Admin - Post Management",
      "/admin/contact": "Admin - Contact Management",
      "/admin/banner": "Admin - Banner Management",
    };
    // Tìm kiếm key tương ứng
    for (const key in titles) {
      if (new RegExp(`^${key.replace(/:\w+/g, "\\w+")}$`).test(path)) {
        return titles[key];
      }
    }
    return "Default Title"; // Title mặc định
  };

  // Cập nhật title khi pathname thay đổi
  useEffect(() => {
    const pageTitle = getTitleByPathname(pathname);
    document.title = pageTitle;
  }, [pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="payment-success">
            <Route index element={<PaymentSuccess />} />
          </Route>
          <Route path="payment-fail">
            <Route index element={<PaymentFailed />} />
          </Route>
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="my-order" element={<Order />} />
            <Route path="my-order/:id" element={<OrderDetail />} />
            <Route path="my-address" element={<Address />} />
            <Route path="whish-list" element={<Wishlist />} />
            <Route path="notifications" element={<NotificationPage />} />
          </Route>
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsPageDetail />} />
          <Route path="/brand" element={<BrandPage />} />
          <Route path="/brand/:id" element={<ProductListBrand />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:id" element={<ProductListCate />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <DefaultLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <>
                <PageTitle title="Dashboard" />
                <ECommerce />
              </>
            }
          />
          <Route path="user" element={<User />} />
          <Route path="product" element={<Product />} />
          <Route path="attribute" element={<Attribute />} />
          <Route path="product/create" element={<AddProduct />} />
          <Route path="product/update/:id" element={<UpdateProduct />}></Route>
          <Route path="product/:id" element={<ViewDetailProduct />}></Route>
          <Route path="orders">
            <Route index element={<OrderDashboard />} />
            <Route path="detail/:id" element={<DetailOrder />} />
            <Route path="refund-request" element={<RefundRequest />} />
            <Route path="refund-request/:id" element={<DetailRefund />} />
          </Route>
          <Route path="discounts">
            <Route index element={<DiscountPage />}></Route>
            <Route path="create" element={<CreateDiscount />}></Route>
            <Route path="update/:id" element={<UpdateDiscount />}></Route>
          </Route>
          <Route path="post">
            <Route index element={<Post />}></Route>
            <Route path="create" element={<CreatePost />}></Route>
            <Route path="update/:id" element={<UpdatePost />}></Route>
          </Route>
          <Route path="contact">
            <Route index element={<ContactList />} />
          </Route>
          <Route path="banner">
            <Route index element={<BannerPage />}></Route>
          </Route>
        </Route>
        <Route path="admin/signin" element={<SignInAdmin />} />
        <Route path="*" element={<NotfoundPage />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
      {!isAdminPage && <ChatUI />}
      {!isAdminPage && <DiscountChatWidget />}
    </>
  );
}

export default App;
