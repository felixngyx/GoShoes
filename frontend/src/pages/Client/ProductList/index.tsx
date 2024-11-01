import Banner from "../../../components/client/Banner";
import { FaListUl } from "react-icons/fa";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { useState } from "react";
import Breadcrumb from "../../../components/client/Breadcrumb";
import ProductCard from "../ProductCard";
import ProductCardList from "./ProductCardList";

const ProductList = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", link: "" },
          { name: "Products", link: "products" },
        ]}
      />
      <div className="container max-w-7xl mx-auto grid grid-cols-12 my-10 gap-10">
        <div className="col-span-3 flex flex-col gap-10">
          {/* Hot Deals */}
          <div className="bg-[#F6F7F8] collapse collapse-arrow rounded-none">
            <input type="checkbox" className="peer" defaultChecked />
            <div className="collapse-title text-xl font-semibold">
              Hot Deals
            </div>
            <div className="collapse-content">
              <ul className="flex flex-col gap-5">
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Air Jordan</p>
                  <p className="text-sm text-gray-500">30</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Nike Air Max</p>
                  <p className="text-sm text-gray-500">20</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Puma</p>
                  <p className="text-sm text-gray-500">10</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Air Force 1</p>
                  <p className="text-sm text-gray-500">12</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Converse</p>
                  <p className="text-sm text-gray-500">9</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Balenciaga</p>
                  <p className="text-sm text-gray-500">10</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Price */}
          <div className="bg-[#F6F7F8] collapse collapse-arrow rounded-none">
            <input type="checkbox" className="peer" defaultChecked />
            <div className="collapse-title text-xl font-semibold">Price</div>
            <div className="collapse-content">
              <ul className="flex flex-col gap-5">
                <li className="flex gap-5">
                  <input
                    type="text"
                    placeholder="From"
                    className="input input-sm input-bordered w-1/2 rounded-none"
                  />

                  <input
                    type="text"
                    placeholder="To"
                    className="input input-sm input-bordered w-1/2 rounded-none"
                  />
                </li>
                <li>
                  <button className="btn btn-sm bg-[#40BFFF] w-full text-[#fff] rounded-none ">
                    Apply
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Size */}
          <div className="bg-[#F6F7F8] collapse collapse-arrow rounded-none">
            <input type="checkbox" className="peer" defaultChecked />
            <div className="collapse-title text-xl font-semibold">Size</div>
            <div className="collapse-content flex flex-row flex-wrap gap-5">
              <button className="btn btn-sm text-black bg-white rounded-none">
                37
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                38
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                39
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                40
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                41
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                42
              </button>
              <button className="btn btn-sm text-black bg-white rounded-none">
                43
              </button>
            </div>
          </div>

          {/* Color */}
          <div className="bg-[#F6F7F8] collapse collapse-arrow rounded-none">
            <input type="checkbox" className="peer" defaultChecked />
            <div className="collapse-title text-xl font-semibold">Color</div>
            <div className="collapse-content flex gap-5">
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#40BFFF] checked:bg-[#40BFFF]"
                defaultChecked
              />
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#FF6464] checked:bg-[#FF6464]"
              />
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#FFC83D] checked:bg-[#FFC83D]"
              />
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#34C759] checked:bg-[#34C759]"
              />
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#8BC34A] checked:bg-[#8BC34A]"
              />
              <input
                type="radio"
                name="radio-2"
                className="radio bg-[#00A8CC] checked:bg-[#00A8CC]"
              />
            </div>
          </div>

          {/* Brand */}
          <div className="bg-[#F6F7F8] collapse collapse-arrow rounded-none">
            <input type="checkbox" className="peer" />
            <div className="collapse-title text-xl font-semibold">Brand</div>
            <div className="collapse-content">
              <ul className="flex flex-col gap-5">
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Nike</p>
                  <p className="text-sm text-gray-500">30</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Adidas</p>
                  <p className="text-sm text-gray-500">20</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Puma</p>
                  <p className="text-sm text-gray-500">10</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Adidas</p>
                  <p className="text-sm text-gray-500">12</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">All Starts</p>
                  <p className="text-sm text-gray-500">9</p>
                </li>
                <li className="flex justify-between">
                  <p className="text-sm font-normal">Air Jordan</p>
                  <p className="text-sm text-gray-500">10</p>
                </li>
              </ul>
            </div>
          </div>

          <button className="btn  rounded-none text-md">More</button>
        </div>
        <div className="col-span-9 flex flex-col gap-10">
          <Banner />

          {/* Filter */}
          <div
            data-theme="corporate"
            className="flex flex-row gap-5 bg-[#F6F7F8] px-5 py-2 items-center"
          >
            <p className="text-lg">Sort by</p>
            <select className="select select-sm select-bordered w-fit">
              <option defaultValue="Name">Name</option>
              <option>Price</option>
              <option>Rating</option>
            </select>
            <p className="text-lg ms-2">Show</p>
            <select className="select select-sm select-bordered w-fit">
              <option defaultValue={9}>9</option>
              <option>12</option>
              <option>15</option>
            </select>
            <button
              className="ms-auto btn btn-sm bg-inherit hover:bg-inherit"
              onClick={() => setLayout("grid")}
            >
              <BsGrid3X3GapFill
                size={20}
                color={layout === "grid" ? "#40BFFF" : "#C1C8CE"}
              />
            </button>
            <button
              className="btn btn-sm bg-inherit hover:bg-inherit"
              onClick={() => setLayout("list")}
            >
              <FaListUl
                size={20}
                color={layout === "list" ? "#40BFFF" : "#C1C8CE"}
              />
            </button>
          </div>

          {/* Product List */}
          <div
            className={`grid grid-cols-${layout === "grid" ? "3" : "1"} gap-5`}
          >
            {layout === "grid" ? <ProductCard /> : <ProductCardList />}
            {/* Add <hr /> for non-grid layout */}
            {layout !== "grid"}
          </div>

          <div className="join mx-auto">
            <button className="join-item btn">1</button>
            <button className="join-item btn">2</button>
            <button className="join-item btn btn-disabled">...</button>
            <button className="join-item btn">99</button>
            <button className="join-item btn">100</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;
