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
  const [modalCheckLogin, setModalCheckLogin] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const addCart = (product: IProduct) => {
    const productVariant = product.variants.find(
      (variant: any) =>
        variant.size === selectedSize && variant.color === selectedColor
    );
    if (productVariant) {
      const productVariantId = productVariant.id;
      const quantity = 1;
      handleAddToCart(productVariantId, quantity);
    }
  };

  const handleCheckAdd = (product: IProduct) => {
    if (!accessToken) {
      setModalCheckLogin(true);
      setShowModal(false);
      return;
    }
    setShowModal(true);
  };
  const uniqueSize = Array.from(
    new Set(product.variants.map((v: any) => v.size))
  );
  const uniqueColor = Array.from(
    new Set(product.variants.map((v: any) => v.color))
  );

  const closeModal = () => {
    setShowModal(false);
    setModalCheckLogin(false);
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
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h2 className="text-2xl font-semibold text-center mb-4">
                Select Size and Color
              </h2>

              {/* Size Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                <h3 className="w-full text-center text-lg mb-2">Size</h3>
                {uniqueSize.map((size: any) => {
                  // Kiểm tra xem kích thước có sản phẩm với số lượng > 0 hay không
                  const isSizeAvailable = product.variants.some(
                    (variant: any) =>
                      variant.size === size &&
                      variant.color === selectedColor &&
                      variant.quantity > 0
                  );

                  return (
                    <button
                      key={size}
                      className={`px-8 py-2 text-center text-sm font-medium border rounded-md transition ${
                        selectedSize === size
                          ? "border-theme-color-primary ring-2 ring-theme-color-primary"
                          : "bg-white text-gray-700 border-gray-300"
                      } ${
                        !isSizeAvailable
                          ? "cursor-not-allowed opacity-50 line-through"
                          : "hover:border-theme-color-primary"
                      }`}
                      onClick={() => {
                        if (isSizeAvailable) {
                          setSelectedSize(size);
                        }
                      }}
                      disabled={!isSizeAvailable} // Vô hiệu hóa nếu không có sản phẩm
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Color Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                <h3 className="w-full text-center text-lg mb-2">Color</h3>
                {uniqueColor.map((color: any) => (
                  <button
                    key={color}
                    className={`px-6 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
                      selectedColor === color
                        ? "bg-theme-color-primary outline-none ring-2"
                        : ""
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={closeModal}
                  className="btn bg-gray-300 text-black hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addCart(product)}
                  className="btn bg-blue-500 text-white hover:bg-blue-600"
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart
                </button>
              </div>

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

      {modalCheckLogin && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="modal modal-open">
            <div className="modal-box relative">
              <h2 className="text-2xl font-semibold text-center mb-4">
                Please log in to continue adding items to your cart.
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLoginNow}
                  className="btn bg-blue-500 text-white hover:bg-blue-600"
                >
                  Login Now
                </button>
                <button
                  onClick={closeModal}
                  className="btn bg-gray-300 text-black hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCardList;
