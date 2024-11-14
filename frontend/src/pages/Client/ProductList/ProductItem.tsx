import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCart, IoHeartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { IProduct } from "../../../types/client/products/products";
import useCart from "../../../hooks/client/useCart";
import Cookies from "js-cookie";
import { useState } from "react";

const ProductItems = ({ product }: any) => {
  const accessToken = Cookies.get("access_token");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { handleAddToCart } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const addCart = (product: IProduct) => {
    const productVariantId = product.variants[0].id;
    const quantity = 1;
    handleAddToCart(productVariantId, quantity);
  };

  const handleCheckAdd = (product: IProduct) => {
    if (!accessToken) {
      setShowModal(true);
      return;
    }
    addCart(product);
  };

  const closeModal = () => {
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
      <div
        key={product.id}
        className="col-span-1 border border-[#F6F7F8] rounded-lg group overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <div className="relative w-full h-[280px] overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
            src={product.thumbnail}
            alt={product.name}
          />
          <div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-8 z-10">
            <IoHeartOutline
              className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
              size={52}
              color="#40BFFF"
            />
            <IoCart
              onClick={() => handleCheckAdd(product)}
              className="cursor-pointer p-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
              size={52}
              color="#40BFFF"
            />
          </div>
          <div className="absolute top-2 left-2 text-white font-semibold bg-red-500 px-2 rounded-md text-sm shadow-md">
            HOT
          </div>
        </div>
        <Link to={`/products/${product.id}`}>
          <p className="text-center text-[#223263] text-lg font-semibold mt-2 px-2 hover:text-primary transition">
            {product.name}
          </p>
        </Link>
        <div className="flex flex-row items-center justify-center gap-1 mt-1">
          <RatingStars rating={product.rating_count} />
        </div>
        <div className="flex items-center justify-center gap-2 mt-1 mb-3">
          <p className="text-primary text-lg font-semibold">
            {formatCurrency(product.promotional_price)}
          </p>
          <p className="text-[#9098B1] text-sm font-medium line-through">
            {formatCurrency(product.price)}
          </p>
          <p className="text-[#E71D36] text-sm font-semibold">-10%</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center ">
          <div className="modal modal-open ">
            <div className="modal-box relative">
              <h2 className="text-2xl font-semibold text-center mb-4">
                You need to login
              </h2>
              <p className="mb-6 text-center">
                Please login to add this product to your cart.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLoginNow}
                  className="btn bg-blue-500 text-white hover:bg-blue-600 w-32"
                >
                  Login Now
                </button>
              </div>
              {/* Close button */}
              <button
                className="absolute top-2 right-2 text-xl"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductItems;
