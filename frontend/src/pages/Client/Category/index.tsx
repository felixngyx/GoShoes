import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/client/Breadcrumb";
import { getAllCategories } from "../../../services/client/categories";
import Pagination from "../ProductList/Pagination";

const CategoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currrentPage, setCurrrentPage] = useState(1);
  const { data: categoryData, refetch } = useQuery({
    queryKey: ["CATEGORIES", currrentPage],
    queryFn: async () => await getAllCategories(12, currrentPage),
  });

  const categories = Array.isArray(categoryData?.data) ? categoryData.data : [];
  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = categoryData?.last_page || 1;

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Home", link: "" },
          { name: "Category", link: "category" },
        ]}
      />
      <div className="container mx-auto px-4 py-8 bg-white text-black">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="form-control w-full max-w-xs">
            <div className="input-group flex items-center w-full bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search categories..."
                className="input input-bordered w-full bg-transparent border-none text-black focus:outline-none focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn bg-transparent hover:bg-[#3389cc] text-[#40BFFF] border-none">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map((category: any) => (
            <Link to={`/category/${category.id}`} key={category.id}>
              <div className="card bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-[#40BFFF] transition-all duration-300">
                <div className="card-body flex flex-row items-center">
                  <div className="text-4xl mr-4 text-[#40BFFF]">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="card-title text-black">{category.name}</h2>
                    <p className="text-gray-500">
                      {category.products_count} products
                    </p>
                    {category.featured && (
                      <div className="badge bg-[#40BFFF] text-white mt-2">
                        Featured
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Products */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div
              key={product.id}
              className="card bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-[#40BFFF] transition-all duration-300"
            >
              <figure>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-black">{product.name}</h2>
                <p className="text-gray-500">{product.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-[#40BFFF]">
                    ${product.price}
                  </span>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-black">{product.rating}</span>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn bg-[#40BFFF] hover:bg-[#3389cc] text-white border-none">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        <Pagination
          currentPage={currrentPage}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            setCurrrentPage(newPage);
            refetch();
          }}
        />
      </div>
    </>
  );
};

export default CategoryPage;
