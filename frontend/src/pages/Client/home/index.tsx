import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import { MdOutlineSupportAgent } from "react-icons/md";
import { IoStar } from "react-icons/io5";
import ProductCard from "../ProductCard";

const Homepage = () => {
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
              10% OFF Discount Coupons
            </p>
            <p className="text-black text-md font-medium">
              Subscribe us to get 10% OFF on all the purchases
            </p>
          </div>
          <button className="bg-black text-white text-xl font-bold px-10 py-2 rounded-none">
            Email Me
          </button>
        </div>
      </div>

      {/* Latest Product */}
      <p className="text-black text-3xl font-bold text-center mt-20">
        Best Seller
      </p>
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-10 mt-10">
          <ProductCard />
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam,
              minima!
            </p>
          </div>
          <div className="max-w-[200px] text-center">
            <RiRefund2Line className="mx-auto" color="#FF6875" size={120} />
            <p className="text-black text-xl font-bold capitalize my-2">
              100% Refund
            </p>
            <p className="text-black text-md font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam,
              minima!
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam,
              minima!
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
