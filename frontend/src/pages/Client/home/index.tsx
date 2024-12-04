import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosClient from "../../../apis/axiosClient";
import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoStar } from "react-icons/io5";
import ProductCard from "../ProductCard";
import { useNavigate } from "react-router-dom";
import { ColorExtractor } from 'color-thief-react';
import { motion } from "framer-motion";

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
            Subscribe to Newsletter
          </h3>

          <p className="text-gray-600 mb-6">
            Enter your email to receive notifications about our latest
            promotions and updates
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                We'll never share your email with anyone else.
              </p>
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
                  Processing...
                </div>
              ) : (
                "Subscribe"
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

const ImageWithFallback = ({ src, alt, ...props }) => {
  const handleError = (e) => {
    e.target.src = "https://res.cloudinary.com/drxguvfuq/image/upload/v1733306833/Goshoes/Green_and_Yellow_Simple_Clean_Shoes_Sale_Banner_1_azoiri.png";
  };

  return <img src={src} alt={alt} onError={handleError} {...props} />;
};

// Cập nhật component Homepage
const Homepage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dominantColors, setDominantColors] = useState<{ [key: number]: string }>({});
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

  const handleColorsExtracted = (bannerID: number, colors: string[]) => {
    setDominantColors(prev => ({
      ...prev,
      [bannerID]: colors[0] // Lấy màu đầu tiên (màu chủ đạo)
    }));
  };

  return (
    <>
      {/* Banner Header */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6 mt-10">
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
                ${index === 0 ? "col-span-2 h-[500px]" : "col-span-1 h-[240px]"} 
                relative z-0 rounded-xl overflow-hidden group
                shadow-lg hover:shadow-2xl transition-all duration-300
                border border-gray-200 hover:border-gray-300
                transform hover:-translate-y-1
                before:absolute before:inset-0 before:z-10 before:bg-gradient-to-t before:from-black/60 before:to-transparent before:opacity-0
                before:transition-opacity before:duration-300 group-hover:before:opacity-100
              `}
            >
              <ImageWithFallback
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-50"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-8">
                <p
                  className={`text-white font-bold ${index === 0 ? 'text-5xl' : 'text-3xl'} 
                  transform translate-y-[-100%] opacity-0 transition-all duration-300 
                  group-hover:translate-y-0 group-hover:opacity-100`}
                >
                  {banner.title.split("<br />").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < banner.title.split("<br />").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p
                  onClick={() => handleShopNow(banner.url)}
                  className="text-white text-xl font-bold underline cursor-pointer hover:text-gray-200
                  transform translate-y-[100%] opacity-0 transition-all duration-300
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Go Now
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <div className="container max-w-5xl mx-auto h-36 bg-[#F1F1F1] p-12 my-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-black text-2xl font-bold">
              Receive discount code when the program is available
            </p>
            <p className="text-black text-md font-medium">
              Subscribe us to receive discount code
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white text-xl font-bold px-10 py-2 rounded-none hover:bg-gray-800 transition duration-200"
          >
            Email Me
          </button>
        </div>
      </div>

      {/* Modal */}
      <EmailSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Latest Product */}
      <p className="text-black text-3xl font-bold text-center mt-20">
        Best Seller
      </p>
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-10 mt-10">
          <ProductCard />
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/products")}
            className="py-2 px-4 text-center bg-[#40BFFF] text-white font-bold rounded-lg hover:bg-[#3397cc] transition duration-300"
          >
            View All
          </button>
        </div>
      </div>

      {/* Banner Footer */}
      <div className="container max-w-7xl grid grid-cols-2 gap-10 mx-auto my-20">
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
              <ImageWithFallback
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-50"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-8">
                <p 
                  className="text-white text-5xl font-extrabold 
                  transform translate-y-[-100%] opacity-0 transition-all duration-300 
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  {banner.title.split("<br />").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < banner.title.split("<br />").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <button
                  onClick={() => handleShopNow(banner.url)}
                  className="text-white text-xl font-bold underline cursor-pointer hover:text-gray-200
                  transform translate-y-[100%] opacity-0 transition-all duration-300
                  group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Go Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Why Choose Us */}
      <div className="container max-w-5xl mx-auto my-32">
        <div className="flex items-center justify-between">
          <div className="max-w-[200px] text-center">
            <FaShippingFast className="mx-auto" color="#FF6875" size={120} />
            <p className="text-black text-xl font-bold capitalize my-2">
              Free Shipping
            </p>
            <p className="text-black text-md font-medium">
              Free shipping on all order and return
            </p>
          </div>
          <div className="max-w-[200px] text-center">
            <RiRefund2Line className="mx-auto" color="#FF6875" size={120} />
            <p className="text-black text-xl font-bold capitalize my-2">
              100% Refund
            </p>
            <p className="text-black text-md font-medium">
              We offer 100% refund on all order
            </p>
          </div>
          <div className="max-w-[200px] text-center">
            <MdOutlineSupportAgent
              className="mx-auto"
              color="#FF6875"
              size={120}
            />
            <p className="text-black text-xl font-bold capitalize my-2">
              Support 24/7
            </p>
            <p className="text-black text-md font-medium">
              We support 24/7 for all customer
            </p>
          </div>
        </div>
      </div>

      {/* Featured Product */}
      {/* <div className="container max-w-7xl mx-auto my-10">
        <p className="text-black text-3xl font-bold text-center">
          Featured Product
        </p>
        <div className="grid grid-cols-3 gap-10 mt-10">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="col-span-1 shadow-md cursor-pointer">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-1">
                    <img src="demo 2.png" alt="Featured Product" />
                  </div>
                  <div className="col-span-1 flex flex-col justify-start my-2">
                    <p className="text-black text-xl font-normal">
                      Blue Swade Nike Sneakers
                    </p>
                    <div className="flex items-center gap-1 my-2">
                      <IoStar color="yellow" />
                      <IoStar color="yellow" />
                      <IoStar color="yellow" />
                      <IoStar color="yellow" />
                      <IoStar color="yellow" />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#FF6875] text-md font-bold">
                        2.345.000 ₫
                      </p>
                      <p className="text-gray-400 text-xs font-medium line-through">
                        2.345.000 ₫
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <p className="text-[#40BFFF] text-xl font-bold text-center mt-10 cursor-pointer underline ">
          View All
        </p>
      </div> */}
    </>
  );
};

export default Homepage;
