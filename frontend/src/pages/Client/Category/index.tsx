import React, { useState } from "react";
import {
    FaSearch,
    FaTshirt,
    FaHatCowboy,
    FaSocks,
    FaGem,
    FaRunning,
    FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/client/Breadcrumb";

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    productCount: number;
    featured: boolean;
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    image: string;
}

const CategoryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const categories: Category[] = [
        { id: "1", name: "T-Shirts", icon: <FaTshirt />, productCount: 150, featured: true },
        { id: "3", name: "Hats", icon: <FaHatCowboy />, productCount: 80, featured: false },
        { id: "4", name: "Socks", icon: <FaSocks />, productCount: 100, featured: false },
        { id: "5", name: "Accessories", icon: <FaGem />, productCount: 120, featured: true },
        { id: "6", name: "Sportswear", icon: <FaRunning />, productCount: 180, featured: true },
    ];

    const products: Product[] = [
        { id: "1", name: "Classic White Tee", category: "T-Shirts", price: 19.99, rating: 4.5, image: "/placeholder.svg?height=200&width=200" },
        { id: "2", name: "Running Shoes", category: "Shoes", price: 89.99, rating: 4.8, image: "/placeholder.svg?height=200&width=200" },
        { id: "3", name: "Leather Wallet", category: "Accessories", price: 39.99, rating: 4.2, image: "/placeholder.svg?height=200&width=200" },
        { id: "4", name: "Sports Jacket", category: "Sportswear", price: 79.99, rating: 4.6, image: "/placeholder.svg?height=200&width=200" },
    ];

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Breadcrumb
                items={[
                    { name: "Home", link: "/" },
                    { name: "Category", link: "/category" },
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
                    {filteredCategories.map((category) => (
                        <Link href={`/category/${category.id}`} key={category.id}>
                            <div className="card bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-[#40BFFF] transition-all duration-300">
                                <div className="card-body flex flex-row items-center">
                                    <div className="text-4xl mr-4 text-[#40BFFF]">{category.icon}</div>
                                    <div>
                                        <h2 className="card-title text-black">{category.name}</h2>
                                        <p className="text-gray-500">{category.productCount} products</p>
                                        {category.featured && (
                                            <div className="badge bg-[#40BFFF] text-white mt-2">Featured</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Featured Products */}
                <h2 className="text-3xl font-bold mb-6 text-center">Featured Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="card bg-white border border-gray-300 shadow-sm hover:shadow-md hover:border-[#40BFFF] transition-all duration-300"
                        >
                            <figure>
                                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title text-black">{product.name}</h2>
                                <p className="text-gray-500">{product.category}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-lg font-bold text-[#40BFFF]">${product.price.toFixed(2)}</span>
                                    <div className="flex items-center">
                                        <FaStar className="text-yellow-400 mr-1" />
                                        <span className="text-black">{product.rating.toFixed(1)}</span>
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
                </div>
            </div>
        </>
    );
};

export default CategoryPage;
