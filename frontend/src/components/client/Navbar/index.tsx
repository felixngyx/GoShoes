import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/index";
import { logout } from "../../../store/client/userSlice";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { LogIn, LogOut, SquarePen, UserRound } from "lucide-react";
import { getProductsByName } from "../../../services/client/product";
import { IProduct } from "../../../types/client/products/products";

import { IoCart, IoHeartOutline } from "react-icons/io5";
import { CartItem } from "../../../types/client/cart";
import { getListCart } from "../../../services/client/cart";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]); // State để lưu trữ sản phẩm tìm được
  const [loading, setLoading] = useState(false); // State để theo dõi trạng thái tải
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.client.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const items = await getListCart();
      setCartItems(items);
    };
    fetchCartItems();
  }, []);

  const totalQuantity = cartItems.reduce(
    (total, item: any) => total + item.quantity,
    0
  );

  const logoutHandler = () => {
    dispatch(logout());
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    toast.success("Logout successfully");
    navigate("/");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (debouncedSearchTerm) {
        setLoading(true);
        try {
          const products = await getProductsByName(debouncedSearchTerm);
          if (products.length === 0) {
            setProducts([]); // Nếu không có sản phẩm, xóa danh sách
            console.log("Không có sản phẩm nào.");
          } else {
            setProducts(products); // Cập nhật danh sách sản phẩm nếu có
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          setProducts([]); // Nếu có lỗi, xóa danh sách sản phẩm
        } finally {
          setLoading(false);
        }
      } else {
        setProducts([]); // Nếu không có từ khóa tìm kiếm, xóa danh sách
      }
    };

    fetchProducts();
  }, [debouncedSearchTerm]);

  return (
    <>
      <div className="drawer drawer-end sticky top-0 z-50">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content w-full">
          {/* Navbar */}
          <div className="bg-white shadow-lg w-full">
            <div className="max-w-7xl mx-auto navbar flex justify-between items-center py-3">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img
                  src="/vector-logo/default-monochrome.svg"
                  className="w-24"
                  alt="Logo"
                />
              </Link>

              {/* Navbar Links */}
              <ul className="lex flex-row gap-8 font-semibold text-sm">
                {["Men", "Women", "Kids", "Sale", "New Arrivals", "Brands"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to="/products"
                        className="menu-item hover:text-blue-500 transition-all duration-300"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>

              {/* Navbar Icons */}
              <div className="flex gap-4 items-center">
                {/* Search Icon */}
                <label
                  htmlFor="my-drawer-4"
                  className="cursor-pointer p-2 rounded-full hover:bg-gray-100"
                >
                  <IoSearch size={24} />
                </label>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="badge badge-error badge-xs absolute -top-1 -right-1 text-white font-semibold">
                    0
                  </span>
                  <MdOutlineShoppingCart size={24} />
                </Link>

                {/* User Dropdown */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaUser size={24} />
                  </div>
                  <ul className="dropdown-content bg-white shadow-lg rounded-lg p-2 w-48 mt-2 text-sm font-medium text-gray-700">
                    {user.access_token ? (
                      <>
                        <li>
                          <Link
                            to="/account"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
                          >
                            <UserRound size={18} /> Account
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={logoutHandler}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
                          >
                            <LogOut size={18} /> Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/signin"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
                          >
                            <LogIn size={18} /> Sign In
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/signup"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
                          >
                            <SquarePen size={18} /> Sign Up
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Sidebar */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
          <div className="bg-white shadow-lg w-[80%] md:w-[35%] h-screen overflow-y-auto p-6 rounded-l-xl">
            {/* Search Input */}
            <div className="flex items-center mb-4">
              <label className="input input-bordered w-full flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none w-full"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IoSearch size={24} className="text-gray-600" />
              </label>
              <button className="ml-2 btn btn-outline rounded-full font-semibold">
                Cancel
              </button>
            </div>

            {/* Search Results */}
            <div className="mt-4">
              {debouncedSearchTerm ? (
                <>
                  <p className="text-lg font-semibold text-gray-700">
                    Top suggestions
                  </p>
                  <ul className="flex flex-col gap-1 mt-2 text-sm font-medium text-gray-600">
                    <li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
                      Nike
                    </li>
                    <li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
                      Adidas
                    </li>
                    <li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
                      Puma
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-700">
                    Popular search terms
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Nike", "Adidas", "Puma", "Reebok", "New Balance"].map(
                      (term) => (
                        <button
                          key={term}
                          className="btn btn-outline rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}

              {/* Product Suggestions */}
              <div className="mt-4">
                {loading ? ( // Hiển thị spinner khi đang tải
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : debouncedSearchTerm && products.length > 0 ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Product Suggestions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product: IProduct) => (
                        <div
                          key={product.id}
                          className="bg-white group rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
                        >
                          <div className="relative w-full overflow-hidden">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-40 object-cover transition-transform duration-300 transform group-hover:scale-105"
                            />
                            <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-4 z-10">
                              <IoHeartOutline
                                className="cursor-pointer p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                                size={32}
                                color="#40BFFF"
                              />
                              <IoCart
                                className="cursor-pointer p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                                size={32}
                                color="#40BFFF"
                              />
                            </div>
                          </div>

                          <div className="p-4">
                            <Link to={`/products/${product.id}`}>
                              <h3 className="text-[14px] font-semibold text-gray-800 hover:text-primary transition">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm">
                              {product.categories}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="font-bold text-blue-600 text-xl">
                                {product.promotional_price}₫
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : debouncedSearchTerm ? (
                  <p className="text-gray-500">No results found.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
