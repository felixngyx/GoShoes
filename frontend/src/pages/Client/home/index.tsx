import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaShippingFast } from "react-icons/fa";
import { MdOutlineSupportAgent } from "react-icons/md";
import { RiRefund2Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import ProductCard from "../ProductCard";
import NewestProducts from "./NewestProducts";
import SalesProducts from "./SaleProducts";
import TopProducts from "./TopProducts";
// import { ColorExtractor } from 'color-thief-react';
// import { motion } from "framer-motion";

interface Banner {
  id: number;
  title: string;
  image: string;
  url: string;
  position: string;
}

// Component Modal
const EmailSubscribeModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/subscribe", {
        email: email,
      });

      if (response.data.success) {
        toast.success("Successfully subscribed to notifications!");
        onClose();
        setEmail("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg p-8 max-w-md w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Đăng ký nhận bản tin
          </h3>

          <p className="text-gray-600 mb-6">
            Nhập email của bạn để nhận thông báo về các chương trình khuyến mãi và cập nhật mới nhất của chúng tôi
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {/* <p className="mt-2 text-sm text-gray-500">
                Chúng tôi sẽ không bao giờ chia sẻ email của bạn với bất kỳ ai khác.
              </p> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Thêm component Skeleton
const BannerSkeleton = ({ isLarge = false }: { isLarge?: boolean }) => (
  <div
    className={`${isLarge ? "col-span-2 h-[500px]" : "col-span-1 h-[240px]"}
    relative rounded-xl overflow-hidden bg-gray-200 animate-shimmer`}
  >
    <div className="absolute inset-0 flex flex-col justify-between p-8">
      <div className="w-2/3 h-8 bg-gray-300 rounded"></div>
      <div className="w-24 h-6 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const ImageWithFallback = ({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  props?: any;
}) => {
  const handleError = (e: any) => {
    e.target.src =
      "https://res.cloudinary.com/drxguvfuq/image/upload/v1733306833/Goshoes/Green_and_Yellow_Simple_Clean_Shoes_Sale_Banner_1_azoiri.png";
  };

  return <img src={src} alt={alt} onError={handleError} {...props} />;
};

// Thêm component ProductSkeleton

// Cập nhật component Homepage
const Homepage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dominantColors, setDominantColors] = useState<{
    [key: number]: string;
  }>({});
  const [top_products, setTopProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchTopProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axiosClient.get("/products");
      setTopProducts(response.data.top_products);
    } catch (error) {
      console.error("Failed to fetch top products:", error);
      toast.error("Failed to load top products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get("/banners");
        setBanners(response.data.data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopProducts();
    fetchBanners();
  }, []);

  const headerBanners = banners.filter((banner) =>
    ["home1", "home2", "home3"].includes(banner.position)
  );

  const footerBanners = banners.filter((banner) =>
    ["home4", "home5"].includes(banner.position)
  );

  // Handler for Shop Now click
  const handleShopNow = (url: string) => {
    // If URL starts with '/', treat as internal route
    if (url.startsWith("/")) {
      navigate(url);
    } else {
      // External URL, open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // const handleColorsExtracted = (bannerID: number, colors: string[]) => {
  // 	setDominantColors((prev) => ({
  // 		...prev,
  // 		[bannerID]: colors[0], // Lấy màu đầu tiên (màu chủ đạo)
  // 	}));
  // };

  return (
    <>
      {/* Banner Header */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6 mt-6 md:mt-10">
        {isLoading ? (
          <>
            <BannerSkeleton isLarge={true} />
            <BannerSkeleton />
            <BannerSkeleton />
          </>
        ) : (
          headerBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`
                ${index === 0
                  ? "col-span-1 md:col-span-2 h-[300px] md:h-[500px]"
                  : "col-span-1 h-[200px] md:h-[240px]"
                }
                relative z-0 rounded-xl overflow-hidden group
                shadow-lg hover:shadow-2xl transition-all duration-300
                border border-gray-200 hover:border-gray-300
                transform hover:-translate-y-1
                before:absolute before:inset-0 before:z-10 before:bg-gradient-to-t before:from-black/60 before:to-transparent before:opacity-0
                before:transition-opacity before:duration-300 group-hover:before:opacity-100
              `}
            >
              <div className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-50">
                <ImageWithFallback src={banner.image} alt={banner.title} />
              </div>
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 md:p-8">
                <p
                  className={`text-white font-bold ${index === 0 ? "text-2xl md:text-5xl" : "text-xl md:text-3xl"
                    }`}
                >
                  {banner.title.split("<br />").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < banner.title.split("<br />").length - 1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
                </p>
                <p
                  onClick={() => handleShopNow(banner.url)}
                  className="text-white text-xl font-bold underline cursor-pointer hover:text-gray-200
                  transform translate-y-[100%] opacity-0 transition-all duration-300
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Mua ngay
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <div className="container max-w-5xl mx-auto bg-[#F1F1F1] p-6 md:p-12 my-6 md:my-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold">
              Nhận mã giảm giá khi chương trình có sẵn
            </p>
            <p className="text-sm md:text-md font-medium mt-2">
              Đăng ký với chúng tôi để nhận mã giảm giá
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-black text-white text-lg md:text-xl font-bold px-6 md:px-10 py-2 hover:bg-gray-800 transition duration-200"
          >
            Gửi Email
          </button>
        </div>
      </div>

      {/* Modal */}
      <EmailSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Latest Product */}
      <p className="text-2xl md:text-3xl font-bold text-center mt-10 md:mt-20 px-4">
        Danh sách sản phẩm
      </p>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-6 md:mt-10">
          <ProductCard />
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/products")}
            className="py-2 px-4 text-center bg-[#40BFFF] text-white font-bold rounded-lg hover:bg-[#3397cc] transition duration-300 btn-sm"
          >
            Xem tất cả
          </button>
        </div>
      </div>

      {/* Banner Footer */}
      <div className="container max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mx-auto my-10 md:my-20 px-4">
        {isLoading ? (
          <>
            <BannerSkeleton />
            <BannerSkeleton />
          </>
        ) : (
          footerBanners.map((banner) => (
            <div
              key={banner.id}
              className="col-span-1 relative rounded-xl overflow-hidden group
                shadow-lg hover:shadow-2xl transition-all duration-300
                border border-gray-200 hover:border-gray-300
                transform hover:-translate-y-1
                before:absolute before:inset-0 before:z-10 before:bg-gradient-to-t before:from-black/60 before:to-transparent before:opacity-0
                before:transition-opacity before:duration-300 group-hover:before:opacity-100"
            >
              <div className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-50">
                <ImageWithFallback src={banner.image} alt={banner.title} />
              </div>
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-8">
                <p
                  className="text-white text-5xl font-extrabold 
                  transform translate-y-[-100%] opacity-0 transition-all duration-300 
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  {banner.title.split("<br />").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < banner.title.split("<br />").length - 1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
                </p>
                <button
                  onClick={() => handleShopNow(banner.url)}
                  className="text-white text-xl font-bold underline cursor-pointer hover:text-gray-200
                  transform translate-y-[100%] opacity-0 transition-all duration-300
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Why Choose Us */}
      <div className="container max-w-5xl mx-auto my-16 md:my-32 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          <div className="max-w-[200px] text-center">
            <FaShippingFast className="mx-auto" color="#FF6875" size={80} />
            <p className="text-lg md:text-xl font-bold capitalize my-2">
              Miễn phí vận chuyển
            </p>
            <p className="text-sm md:text-md font-medium">
              Miễn phí vận chuyển cho tất cả đơn hàng và trả hàng
            </p>
          </div>
          <div className="max-w-[200px] text-center">
            <RiRefund2Line className="mx-auto" color="#FF6875" size={80} />
            <p className="text-lg md:text-xl font-bold capitalize my-2">
              Hoàn tiền 100%
            </p>
            <p className="text-sm md:text-md font-medium">
              Chúng tôi cung cấp hoàn tiền 100% cho tất cả đơn hàng
            </p>
          </div>
          <div className="max-w-[200px] text-center">
            <MdOutlineSupportAgent
              className="mx-auto"
              color="#FF6875"
              size={80}
            />
            <p className="text-lg md:text-xl font-bold capitalize my-2">
              Hỗ trợ 24/7
            </p>
            <p className="text-sm md:text-md font-medium">
              Chúng tôi hỗ trợ 24/7 cho tất cả khách hàng
            </p>
          </div>
        </div>
      </div>

      {/* Featured Product */}
      <TopProducts
        isLoadingProducts={isLoadingProducts}
        top_products={top_products}
      />

      {/* News product */}
      <NewestProducts />

      {/* Sale product */}
      <SalesProducts />

      {/* Map and Store Information */}
      <div className="container max-w-7xl mx-auto my-10 px-4">
        <p className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10">
          Tìm chúng tôi
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="col-span-1 h-[300px] md:h-[450px]">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Cao%20%C4%91%E1%BA%B3ng%20Fpt&zoom=10&maptype=roadmap"
            ></iframe>
          </div>
          <div className="col-span-1 flex flex-col justify-start gap-4">
            <p className="text-black text-xl font-bold">
              Khu Tự Trị Trịnh Văn Bô
            </p>
            <p className="text-black text-md font-medium">
              Hai Bà Trưng, Hà Nội, Việt Nam
            </p>
            <p className="text-black text-xl font-bold mt-4">Liên hệ với chúng tôi</p>
            <p className="text-black text-md font-medium">
              Điện thoại: +1 (123) 456-7890
            </p>
            <p className="text-black text-md font-medium">
              Email: [goshoes@example.com](mailto:goshoes@example.com)
            </p>
            <p
              className="text-black text-xl font-bold mt-4 cursor-pointer hover:text-gray-800"
              onClick={() => navigate("/contact")}
            >
              Liên hệ với chúng tôi
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
