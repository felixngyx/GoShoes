import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getProductById } from "../../../services/client/product";
import { IImages } from "../../../types/client/products/images";
import { Variant } from "../../../types/client/products/variants";
import { Category } from "../../../types/client/category";
import RelatedProduct from "../ProductList/RelatedProduct";

const ProductDetail = () => {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ["PRODUCT_KEY", id],
    queryFn: async () => await getProductById(Number(id)),
  });

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "writeComment"
  >("description");
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedThumbnail(product.thumbnail);
      setSelectedColor(product.variants[0]?.color.id || null);
      setSelectedSize(product.variants[0]?.size.code || null);
      setAvailableQuantity(product.variants[0]?.quantity || 0);
    }
  }, [product]);

  const handleImageClick = (image: IImages) => {
    setSelectedThumbnail(image.image_path);

    // Tìm variant có image_variant khớp với image_path được nhấn
    const matchedVariant = product?.variants.find(
      (variant: Variant) => variant.image_variant === image.image_path
    );

    if (matchedVariant) {
      setSelectedColor(matchedVariant.color.id); // Cập nhật màu tương ứng
      setSelectedSize(matchedVariant.size.code); // Cập nhật size tương ứng nếu có
      setAvailableQuantity(matchedVariant.quantity); // Cập nhật số lượng có sẵn tương ứng
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSizeCode = e.target.value;
    setSelectedSize(selectedSizeCode);

    const sizeVariant = product?.variants.find(
      (variant: any) =>
        variant.size.code === selectedSizeCode &&
        variant.color.id === selectedColor
    );

    if (sizeVariant) {
      setAvailableQuantity(sizeVariant.quantity);
    }
  };
  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);

    const colorVariant = product?.variants.find(
      (variant: any) =>
        variant.color.id === colorId && variant.size.code === selectedSize
    );

    if (colorVariant) {
      setAvailableQuantity(colorVariant.quantity);
    }
  };

  const uniqueSizes = product?.variants
    ? Array.from(
        new Set(product.variants.map((variant: Variant) => variant.size.code))
      )
    : [];

  const uniqueColors = Array.from(
    new Map(
      product?.variants.map((variant: Variant) => [
        variant.color.color,
        variant,
      ])
    ).values()
  );

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const interval = setInterval(() => {
        setSelectedThumbnail(
          (prevIndex) => (prevIndex + 1) % product.images.length
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [product]);

  const handleQuantityChange = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
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

  // Function to handle adding a new comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % product.images.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(
      (prevSlide) =>
        (prevSlide - 1 + product.images.length) % product.images.length
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left Section - Product Images */}
          <div className="md:col-span-5">
            <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-2">
              <img
                src={selectedThumbnail || product.images[0].image_path}
                // alt={product.name}
                className="w-[575px] h-[571px] object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <button
                onClick={handlePrevSlide}
                className="p-2 hover:bg-gray-100 rounded-full absolute left-0 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronLeft color="#9098B1" />
              </button>
              <div className="grid grid-cols-4 gap-2">
                {product.images
                  .slice(currentSlide, currentSlide + 4)
                  .map((image: IImages, index: number) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSelectedThumbnail(
                          product.images[currentSlide + index].image_path
                        )
                      }
                      className={`relative overflow-hidden rounded-md ${
                        selectedThumbnail ===
                        product.images[currentSlide + index].image_path
                          ? "ring-2 ring-theme-color-primary"
                          : ""
                      }`}
                    >
                      <img
                        key={image.id}
                        src={image.image_path}
                        alt={`${product.name} Thumbnail ${index + 1}`}
                        className="w-full object-cover"
                        onClick={() => handleImageClick(image)}
                      />
                    </button>
                  ))}
              </div>
              <button
                onClick={handleNextSlide}
                className="p-2 hover:bg-gray-100 rounded-full absolute right-0 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight color="#9098B1" />
              </button>
            </div>
          </div>

          {/* Right Section - Product Information */}
          <div className="md:col-span-5">
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-2">
              <RatingStars rating={product.rating_count} />
              <span className="text-[#9098B1] text-sm">
                ({product.reviews} reviews)
              </span>
              <span className="text-xs text-[#40BFFF]">Submit a review</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-[#40BFFF]">
                ${product.promotional_price}
              </p>
              <span className="text-[#9098B1] text-sm line-through">
                ${product.price}
              </span>
              <span className="text-[#FB7181] text-sm font-bold">24% Off</span>
            </div>

            <hr className="my-4" />

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 max-w-xs">
                <span className="col-span-1">Brand:</span>
                <span className="col-span-1 text-left">
                  {product.categories
                    .map((category: Category) => category.name)
                    .join(", ")}
                </span>
              </div>
              <div className="grid grid-cols-2 max-w-xs">
                <span className="col-span-1">Type:</span>
                <span className="col-span-1 text-left">
                  {product.brand.name}
                </span>
              </div>
              <div className="grid grid-cols-2 max-w-xs">
                <span className="col-span-1">Availability:</span>
                <span className="col-span-1 text-left">
                  {availableQuantity} units
                </span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 max-w-xs">
              <span className="col-span-1">Size:</span>
              <select
                className="select select-sm select-bordered w-fit col-span-1"
                value={selectedSize ?? ""}
                onChange={handleSizeChange}
              >
                {uniqueSizes.map((sizeCode) => {
                  const sizeVariant = product?.variants.find(
                    (variant: Variant) => variant.size.code === sizeCode
                  );
                  return (
                    <option
                      key={sizeVariant?.size.id}
                      value={sizeVariant?.size.code || ""}
                    >
                      {sizeVariant?.size.size}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="mb-2">Color:</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((variant: any) => (
                  <button
                    key={variant.color.id}
                    onClick={() => handleColorChange(variant.color.id)}
                    className={`px-2 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
                      selectedColor === variant.color.id
                        ? "bg-theme-color-primary outline-none ring-2"
                        : ""
                    }`}
                  >
                    <img
                      className="w-6 h-6 border border-x"
                      src={variant.color.link_image}
                      alt={variant.color.color}
                    />
                    {variant.color.color}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  <IoMdRemove />
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  <IoMdAdd />
                </button>
              </div>
              <button className="btn ms-auto bg-[#ebf6ff] hover:bg-[#ebf6ff]/80 hover:border-[#40BFFF]">
                <Heart size={16} color="#40BFFF" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="btn bg-[#ebf6ff] text-[#40BFFF] hover:bg-[#ebf6ff]/80 hover:border-[#40BFFF]">
                <FaShoppingCart />
                Add to Cart
              </button>
              <button className="btn bg-[#40BFFF] text-white hover:bg-[#40a5ff] hover:border-[#40BFFF]">
                Buy Now
              </button>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="md:col-span-2">
            <h3 className="text-lg mb-2 text-[#C1C8CE]">Best Sellers</h3>
            <div className="space-y-4 border rounded-sm">
              <div className="flex flex-col gap-2">
                <img src="https://placehold.co/400" alt="" />
                <div className="flex items-center justify-center gap-1">
                  <AiFillStar className="text-yellow-400 text-xs" />
                  <AiFillStar className="text-yellow-400 text-xs" />
                  <AiFillStar className="text-yellow-400 text-xs" />
                  <AiFillStar className="text-yellow-400 text-xs" />
                  <AiFillStar className="text-yellow-400 text-xs" />
                </div>
                <div className="flex items-center gap-2 justify-center mb-2">
                  <span className="text-sm text-[#FB7181]">$159.99</span>
                  <span className="text-xs text-[#9098B1] line-through">
                    $199.99
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description, Reviews & Write Comment */}
          <div className="mt-8 col-span-1 md:col-span-10 bg-[#FAFAFB] p-5 rounded-lg shadow-md">
            <div className="flex gap-4 md:gap-28 border-b">
              <button
                className={`px-4 py-2 ${
                  activeTab === "description"
                    ? "border-b-2 border-theme-color-primary font-semibold text-[#40BFFF]"
                    : ""
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "reviews"
                    ? "border-b-2 border-theme-color-primary font-semibold text-[#40BFFF]"
                    : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "writeComment"
                    ? "border-b-2 border-theme-color-primary font-semibold text-[#40BFFF]"
                    : ""
                }`}
                onClick={() => setActiveTab("writeComment")}
              >
                Write Comment
              </button>
            </div>
            <div className="p-4">
              {activeTab === "description" && (
                <div>
                  <p className="mb-2 text-[#9098B1]">{product.description}</p>
                  <p className="mb-2 text-[#9098B1]">{product.description}</p>
                  <p className="mb-2 text-[#9098B1]">{product.description}</p>
                </div>
              )}
              {activeTab === "reviews" && (
                <div>
                  {/* Reviews List */}
                  <div className="max-w-6xl mx-auto">
                    <div></div>
                    <div className="flex flex-col gap-8">
                      <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-[1.01]">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={`https://placehold.co/400`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="text-xl font-semibold">
                                John Doe
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <RatingStars rating={4.5} />
                                <span className="text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">
                          This is a test comment
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {/* {product.images.map((image, index) => ( */}
                          <button
                            // key={index}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden"
                            //   onClick={() => setSelectedImage(index)}
                            //   onKeyDown={(e) => {
                            //     if (e.key === "Enter") setSelectedImage(index);
                            //   }}
                          >
                            <img
                              // src={image}
                              className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                            />
                          </button>
                          {/* ))} */}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-[1.01]">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={`https://placehold.co/400`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="text-xl font-semibold">
                                John Doe
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <RatingStars rating={4.5} />
                                <span className="text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">
                          This is a test comment
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {/* {product.images.map((image, index) => ( */}
                          <button
                            // key={index}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden"
                            //   onClick={() => setSelectedImage(index)}
                            //   onKeyDown={(e) => {
                            //     if (e.key === "Enter") setSelectedImage(index);
                            //   }}
                          >
                            <img
                              // src={image}
                              className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                            />
                          </button>
                          {/* ))} */}
                        </div>
                      </div>
                      {/* Pagination or more reviews */}
                      <div className="join bg-[#FAFAFB] rounded-md ms-auto">
                        <button className="join-item btn btn-sm">1</button>
                        <button className="join-item btn btn-sm">2</button>
                        <button className="join-item btn btn-sm btn-disabled">
                          ...
                        </button>
                        <button className="join-item btn btn-sm">99</button>
                        <button className="join-item btn btn-sm">100</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "writeComment" && (
                <div>
                  {/* Comment Form */}
                  <div className="mb-4">
                    <textarea
                      className="w-full p-2 border rounded-md"
                      placeholder="Write your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      className="btn btn-sm bg-[#40BFFF] text-white mt-2"
                      onClick={handleAddComment}
                    >
                      Submit Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <RelatedProduct id={id} />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
