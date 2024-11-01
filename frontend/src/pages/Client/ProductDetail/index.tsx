import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart } from "lucide-react";
import { FaFacebookF, FaStar, FaTwitter } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { getProductById } from "../../../services/client/products";
import { useState, useEffect } from "react";
import { Variant } from "../../../types/client/products/variants";
import { IImages } from "../../../types/client/products/images";
import { ICategory } from "../../../types/client/Category";

const ProductDetail = () => {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ["PRODUCT_KEY", id],
    queryFn: async () => await getProductById(Number(id)),
  });

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("product-information");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
    null
  );
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto">
      <Breadcrumb
        items={[
          { name: "Home", link: "" },
          { name: "ProductDetail", link: "ProductDetail" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <div className="thumbnail">
            <img
              src={selectedThumbnail ?? ""}
              alt={product.name}
              className="w-[575px] h-[571px] object-cover rounded-lg mb-4"
            />
          </div>

          <div className="flex space-x-2">
            {product.images.map((image: IImages) => (
              <img
                key={image.id}
                src={image.image_path}
                alt={product.name}
                className="w-20 h-20 object-cover rounded cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-3">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400 w-[11px] h-[10px]" />
            ))}
            <span className="text-gray-600">(121)</span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl font-bold text-blue-600">
              ${product.promotional_price}
            </span>
            <span className="text-gray-500 line-through">${product.price}</span>
            <span className="text-red-500 text-[14px]">24% Off</span>
          </div>
          <div className="mb-4 flex items-center">
            <p className="mr-2 text-[14px] w-32">Availability:</p>
            <p>{availableQuantity}</p>
          </div>
          <div className="mb-4 flex items-center">
            <p className="mr-2 text-[14px] w-32">Category:</p>
            <p>
              {product.categories
                .map((category: ICategory) => category.name)
                .join(", ")}
            </p>
          </div>
          <div className="mb-4 flex items-center">
            <p className="mr-2 text-[14px] w-32">Free shipping:</p>
          </div>

          <div className="mb-4">
            <h3 className="text-[14px] mb-2">Select Color:</h3>
            <div className="flex space-x-2">
              {uniqueColors.map((variant: any) => (
                <button
                  key={variant.color.id}
                  onClick={() => handleColorChange(variant.color.id)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === variant.color.id ? "border-blue-600" : ""
                  }`}
                >
                  <img
                    src={variant.color.link_image}
                    alt={variant.color.color}
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-[14px] mb-2">Size:</h3>
            <select
              className="select select-bordered w-full max-w-xs"
              value={selectedSize ?? ""}
              onChange={handleSizeChange}
            >
              {uniqueSizes.map((sizeCode) => {
                const sizeVariant = product?.variants.find(
                  (variant: any) => variant.size.code === sizeCode
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

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border rounded-md">
              <button
                className="px-3 py-1 text-xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value)))
                }
                className="w-12 text-center border-none appearance-none"
                inputMode="numeric"
                min={1}
              />
              <button
                className="px-3 py-1 text-xl"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
            <button className="btn hover:btn-primary hover:text-white">
              <ShoppingCart />
              Add to Cart
            </button>
            <button className="btn hover:bg-red-400 hover:text-white">
              <Heart />
            </button>
          </div>

          <div className="flex space-x-2 mb-6">
            <button className="btn btn-outline btn-sm">
              <FaFacebookF className="mr-2" />
              Share on Facebook
            </button>
            <button className="btn btn-outline btn-sm">
              <FaTwitter className="mr-2" />
              Share on Twitter
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab ${
              activeTab === "product-information" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("product-information")}
          >
            Product Information
          </button>
          <button
            className={`tab ${activeTab === "reviews" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`tab ${activeTab === "another-tab" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("another-tab")}
          >
            Another Tab
          </button>
        </div>

        <div className="bg-base-200 p-6 rounded-lg">
          {activeTab === "product-information" && (
            <p>
              The Nike Air Max 270 React combines two of Nike's most innovative
              technologies for a shoe that's both comfortable and stylish. The
              React foam midsole provides responsive cushioning, while the Air
              Max unit in the heel offers impact protection and a unique look.
            </p>
          )}
          {activeTab === "reviews" && (
            <p>Customer reviews will be displayed here.</p>
          )}
          {activeTab === "another-tab" && (
            <p>Additional information can be added here.</p>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={`related-product-${index}`}
              className="card bg-base-100 shadow-xl"
            >
              <figure>
                <img
                  src="/src/images/product/image Product (1).png"
                  alt="Shoes"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">Nike Air Max 270 React</h2>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-600 font-bold">$299.43</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
