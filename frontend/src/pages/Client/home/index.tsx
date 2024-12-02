import { useState } from "react";
import { toast } from "react-hot-toast";
import axiosClient from "../../../apis/axiosClient";
import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoStar } from "react-icons/io5";
import ProductCard from "../ProductCard";
import { useNavigate } from "react-router-dom";

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
              className={`w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
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

// Cập nhật component Homepage
const Homepage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Banner */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 grid-rows-2 gap-10 mt-10 relative z-0 ">
        <div className="col-span-1 row-span-2 relative z-0 rounded-xl h-fit overflow-hidden group">
          <img
            src="images/Banner 1.png"
            alt="Banner"
            className="transition-transform duration-300 transform group-hover:scale-105"
          />
          <p className="text-black text-5xl font-bold absolute bottom-40 left-10">
            Stylish shoes <br /> for Women
          </p>
          <p className="text-black text-xl font-bold absolute bottom-20 left-10 underline cursor-pointer">
            Shop Now
          </p>
        </div>
        <div className="col-span-1 relative z-0 rounded-xl h-fit max-h-[260px] overflow-hidden group">
          <img
            src="images/Banner 2.png"
            alt="Banner"
            className="transition-transform duration-300 transform group-hover:scale-105"
          />
          <p className="text-white text-5xl font-bold absolute top-[50%] translate-y-[-50%] left-10">
            Sports Wear
          </p>
          <p className="text-white text-xl font-bold absolute bottom-10 left-10 underline cursor-pointer">
            Shop Now
          </p>
        </div>
        <div className="col-span-1 relative z-0 rounded-xl h-fit max-h-[260px] overflow-hidden group">
          <img
            src="images/Banner 3.png"
            alt="Banner"
            className="rounded-xl h-full transition-transform duration-300 transform group-hover:scale-105"
          />
          <p className="text-black text-5xl font-bold absolute bottom-[50%] translate-y-[-50%] left-10">
            Fashion Shoes
          </p>
          <p className="text-black text-xl font-bold absolute bottom-20 left-10 underline cursor-pointer">
            Shop Now
          </p>
        </div>
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

      {/* Category */}
      <div className="container max-w-7xl grid grid-cols-2 gap-10 mx-auto my-20">
        <div className="col-span-1 relative rounded-xl overflow-hidden group">
          <img
            src="images/Banner 5.png"
            alt="Category"
            className="transition-transform duration-300 transform group-hover:scale-105"
          />
          <p className="text-black text-5xl font-extrabold absolute bottom-40 left-10">
            Minimal <br /> Collection
          </p>
          <p className="text-black text-xl font-bold absolute bottom-20 left-10 underline cursor-pointer">
            Shop Now
          </p>
        </div>
        <div className="col-span-1 relative rounded-xl overflow-hidden group">
          <img
            src="images/Banner 6.png"
            alt="Category"
            className="transition-transform duration-300 transform group-hover:scale-105"
          />
          <p className="text-black text-5xl font-extrabold absolute bottom-40 left-10">
            Sneaker
          </p>
          <p className="text-black text-xl font-bold absolute bottom-20 left-10 underline cursor-pointer">
            Shop Now
          </p>
        </div>
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
