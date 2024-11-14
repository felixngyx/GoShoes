import { Heart, ShoppingCart } from "lucide-react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IProduct } from "../../../types/client/products/products";
import useCart from "../../../hooks/client/useCart";
import Cookies from "js-cookie";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const ProductCardList = ({ product }: any) => {
  const { handleAddToCart } = useCart();
  const accessToken = Cookies.get("access_token");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex flex-row gap-5">
        <div key={product.id} className="w-1/3">
          <img
            className="w-[650px] h-[300px] object-cover"
            src={product.thumbnail}
            alt={product.name}
          />
        </div>
        <div className="w-2/3">
          <div className="flex flex-col justify-between items-start h-full gap-2 p-2">
            <h3 className="text-2xl font-semibold">{product.name}</h3>
            <div className="flex flex-row gap-2 items-center">
              <div className="rating flex flex-row items-center gap-1">
                <RatingStars rating={product.rating_count} />
              </div>
              <p className="text-sm text-[#C1C8CE]">12 reviews</p>
            </div>
            <hr className="w-2/3" />
            <div className="flex flex-row gap-2 items-center">
              <p className="text-xl font-semibold text-[#40BFFF]">
                ${product.promotional_price}
              </p>
              <p className="text-sm line-through text-[#C1C8CE]">
                ${product.price}
              </p>
              <p className="text-sm text-[#FF4242] font-semibold">-6% Off</p>
            </div>
            <p>{product.description}</p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => handleCheckAdd(product)}
                className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] px-10 flex flex-row gap-2 items-center"
              >
                <ShoppingCart /> Add to cart
              </button>
              <button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] flex flex-row gap-2 items-center">
                <Heart />
              </button>
            </div>
          </div>
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

export default ProductCardList;
