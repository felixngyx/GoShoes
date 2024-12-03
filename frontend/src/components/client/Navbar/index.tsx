import Cookies from "js-cookie";
import { LogIn, LogOut, SquarePen, UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaUser } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { MdDashboard, MdOutlineShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getProductsByName } from "../../../services/client/product";
import { logout } from "../../../store/client/userSlice";
import { RootState } from "../../../store/index";
import { IProduct } from "../../../types/client/products/products";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import useCart from "../../../hooks/client/useCart";
import { formatVNCurrency } from "../../../common/formatVNCurrency";
import useWishlist from "../../../hooks/client/useWhishList";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

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
  const user = useSelector((state: RootState) => state.client.user);
  const accessToken = Cookies.get("access_token");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalQuantity } = useCart();

  const logoutHandler = () => {
    dispatch(logout());
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    toast.success("Logout successfully");
    navigate("/");
  };
  const handleCartClick = () => {
    if (!accessToken) {
      toast.error("You need to login");
      navigate("/signin");
    } else {
      navigate("/cart");
    }
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

  const Navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const { handleAddToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const { handleAddToWishlist } = useWishlist();

  const handleCheckAdd = (product: IProduct) => {
    if (!accessToken) {
      setShowModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const addCart = () => {
    if (selectedSize && selectedColor) {
      const variants = parseVariants(selectedProduct?.variants || []);
      const selectedVariant = variants.find(
        (variant: any) => variant.color === selectedColor
      );

      if (selectedVariant) {
        const selectedSizeObj = selectedVariant.sizes.find(
          (sizeObj: any) => sizeObj.size === selectedSize
        );

        if (selectedSizeObj && selectedSizeObj.quantity > 0) {
          const productVariantId = selectedSizeObj.product_variant_id;
          const quantity = 1;

          handleAddToCart(productVariantId, quantity);
          setSelectedProduct(null);
          setSelectedSize(null);
          setSelectedColor(null);
        } else {
          toast.error("Size hoặc sản phẩm không khả dụng.");
        }
      } else {
        toast.error("Không tìm thấy màu được chọn.");
      }
    } else {
      toast.error("Hãy chọn kích thước và màu trước khi thêm vào giỏ hàng.");
    }
  };

  const parseVariants = (variants: string | any[]) => {
    try {
      return Array.isArray(variants) ? variants : JSON.parse(variants);
    } catch (error) {
      console.error("Error parsing variants:", error);
      return [];
    }
  };

  const getVariantsForColor = (color: string) => {
    if (!selectedProduct) return [];

    return parseVariants(selectedProduct.variants)
      .filter((variant: any) => variant.color === color)
      .flatMap((variant: any) => variant.sizes);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setShowModal(false);
  };

  const handleLoginNow = () => {
    navigate("/signin");
    closeModal();
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <span key={index}>
            {index < Math.floor(rating) ? (
              <AiFillStar className="text-yellow-400 text-xs" />
            ) : (
              <AiOutlineStar className="text-yellow-400 text-xs" />
            )}
          </span>
        ))}
      </div>
    );
  };

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

              <ul className="flex flex-row gap-8 font-semibold text-sm">
                {[
                  "HOME",
                  "BRAND",
                  "CATEGORY",
                  "ABOUT US",
                  "NEWS",
                  "CONTACT",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to={
                        item === "HOME"
                          ? "/"
                          : `/${item.toLowerCase().replace(" ", "-")}`
                      }
                      className="menu-item hover:text-blue-500 transition-all duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
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
                <button
                  onClick={handleCartClick}
                  className="relative p-2 rounded-full hover:bg-gray-100"
                >
                  {totalQuantity > 0 && (
                    <span className="badge badge-error badge-xs absolute -top-1 -right-1 text-white font-semibold">
                      {totalQuantity}
                    </span>
                  )}
                  <MdOutlineShoppingCart size={24} />
                </button>

                {/* User Dropdown */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaUser size={24} />
                  </div>
                  <ul className="dropdown-content bg-white shadow-lg rounded-lg p-2 w-48 mt-2 text-sm font-medium text-gray-700 border border-gray-200">
                    {accessToken ? (
                      <>
                        <li>
                          <Link
                            to="/account"
                            className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
                          >
                            <UserRound size={18} /> Account
                          </Link>
                        </li>
                        {(user.role === "admin" ||
                          user.role === "super-admin") && (
                          <li>
                            <Link
                              to="/admin"
                              className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
                            >
                              <MdDashboard /> Admin Dashboard
                            </Link>
                          </li>
                        )}
                        <li>
                          <button
                            onClick={logoutHandler}
                            className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
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
                        <>
                          <button
                            key={term}
                            className="btn btn-outline rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {term}
                          </button>
                        </>
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
                            {/* Phần giảm giá sẽ được đặt ở góc trên bên phải của thumbnail */}
                            <p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
                              {Math.round(
                                ((Number(product.price) -
                                  Number(product.promotional_price)) /
                                  Number(product.price)) *
                                  100
                              )}
                              %
                            </p>
                            <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-4 z-10">
                              <IoHeartOutline
                                onClick={() => handleAddToWishlist(product.id)}
                                className="cursor-pointer p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                                size={32}
                                color="#40BFFF"
                              />
                              <IoCart
                                onClick={() => handleCheckAdd(product)}
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

                            {/* Đặt rating ở dưới tên sản phẩm */}
                            <div className="flex flex-row items-center justify-start gap-1 mt-1">
                              <RatingStars rating={product.rating_count} />
                            </div>

                            <p className="text-gray-600 text-sm mt-1">
                              {product.categories}
                            </p>

                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center space-x-2">
                                {/* Giá khuyến mãi với kích thước nhỏ hơn */}
                                <p className="font-bold text-blue-600 text-lg">
                                  {formatVNCurrency(
                                    Number(product.promotional_price)
                                  )}
                                </p>
                                {/* Giá cũ có gạch ngang */}
                                <p className="text-gray-500 text-xs line-through">
                                  {formatVNCurrency(Number(product.price))}
                                </p>
                              </div>
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl text-blue-500">
                {selectedProduct.name}
              </h3>
              <p className="mt-2">Select size and color:</p>
              <div className="flex flex-col gap-6 mt-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor &&
                      getVariantsForColor(selectedColor)
                        .sort((a: any, b: any) => a.size - b.size)
                        .map((variant: any) => {
                          const isSizeAvailable = variant.quantity > 0;
                          const isSelected = selectedSize === variant.size;

                          return (
                            <button
                              key={variant.size}
                              className={`px-8 py-2 text-center text-sm font-medium border rounded-md transition ${
                                isSelected
                                  ? "border-theme-color-primary ring-2 ring-theme-color-primary"
                                  : "bg-white text-gray-700 border-gray-300"
                              } ${
                                !isSizeAvailable
                                  ? "cursor-not-allowed opacity-50 line-through"
                                  : "hover:border-theme-color-primary"
                              }`}
                              onClick={() => {
                                if (isSizeAvailable) {
                                  setSelectedSize(variant.size);
                                }
                              }}
                              disabled={!isSizeAvailable}
                            >
                              {variant.size}
                            </button>
                          );
                        })}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Color:</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseVariants(selectedProduct.variants)
                      .map((variant: any) => variant.color)
                      .filter(
                        (value: string, index: number, self: string[]) =>
                          self.indexOf(value) === index
                      )
                      .map((color: string) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            className={`px-6 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
                              isSelected
                                ? "bg-theme-color-primary outline-none ring-2"
                                : ""
                            }`}
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={addCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h3 className="font-bold text-xl">You need to sign in</h3>
              <p className="mt-2">Please sign in to add items to your cart.</p>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  className="btn bg-gray-300 text-black"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="btn bg-blue-500 text-white"
                  onClick={handleLoginNow}
                >
                  Login Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
