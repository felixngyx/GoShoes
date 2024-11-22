import React, { useState } from 'react';
import { FaSearch, FaStar, FaTh, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../../components/client/Breadcrumb';

interface Brand {
    id: string;
    name: string;
    logo: string;
    rating: number;
    productCount: number;
}

const BrandPage: React.FC = () => {
    const initialBrands: Brand[] = [
        { id: '1', name: 'Nike', logo: '/placeholder.svg?height=100&width=100', rating: 4.5, productCount: 250 },
        { id: '2', name: 'Adidas', logo: '/placeholder.svg?height=100&width=100', rating: 4.3, productCount: 200 },
        { id: '3', name: 'Puma', logo: '/placeholder.svg?height=100&width=100', rating: 4.2, productCount: 150 },
        { id: '4', name: 'Reebok', logo: '/placeholder.svg?height=100&width=100', rating: 4.0, productCount: 100 },
        { id: '5', name: 'Under Armour', logo: '/placeholder.svg?height=100&width=100', rating: 4.1, productCount: 120 },
        { id: '6', name: 'New Balance', logo: '/placeholder.svg?height=100&width=100', rating: 4.4, productCount: 180 },
    ];

    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortType, setSortType] = useState('');
    const [itemsToShow, setItemsToShow] = useState(12);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortType(e.target.value);
    };

    const handleItemsToShow = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsToShow(Number(e.target.value));
    };

    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedBrands = filteredBrands.sort((a, b) => {
        if (sortType === 'Name (A-Z)') return a.name.localeCompare(b.name);
        if (sortType === 'Name (Z-A)') return b.name.localeCompare(a.name);
        if (sortType === 'Rating (High to Low)') return b.rating - a.rating;
        if (sortType === 'Rating (Low to High)') return a.rating - b.rating;
        return 0;
    });

    return (
        <>
            <Breadcrumb
                items={[
                    { name: 'Home', link: '/' },
                    { name: 'Brand', link: '/brand' },
                ]}
            />
            <div className="container mx-auto px-4 lg:px-16 py-8">
                {/* Header Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                        <span>{sortedBrands.length} Items</span>
                        <select
                            className="select select-bordered bg-white text-gray-800"
                            value={sortType}
                            onChange={handleSort}
                        >
                            <option disabled value="">
                                Sort By
                            </option>
                            <option>Name (A-Z)</option>
                            <option>Name (Z-A)</option>
                            <option>Rating (High to Low)</option>
                            <option>Rating (Low to High)</option>
                        </select>
                        <select
                            className="select select-bordered bg-white text-gray-800"
                            value={itemsToShow}
                            onChange={handleItemsToShow}
                        >
                            <option value={12}>Show 12</option>
                            <option value={24}>Show 24</option>
                            <option value={36}>Show 36</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="btn btn-square bg-[#40BFFF] text-white">
                            <FaTh />
                        </button>
                        <button className="btn btn-square bg-white text-gray-800 border border-gray-300">
                            <FaBars />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex justify-center mb-8 px-4">
                    <div className="form-control w-full max-w-5xl">
                        <div className="input-group flex items-center w-full bg-gray-100 rounded-full px-6 py-3">
                            <input
                                type="text"
                                placeholder="Search brands..."
                                className="input input-bordered w-full bg-transparent border-none text-black focus:outline-none focus:ring-0"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <button className="btn bg-transparent hover:bg-[#3389cc] text-[#40BFFF] border-none">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sortedBrands.slice(0, itemsToShow).map((brand) => (
                        <Link
                            to={`/brand/${brand.id}`}
                            key={brand.id}
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                        >
                            <figure className="px-10 pt-10">
                                <img src={brand.logo} alt={brand.name} className="rounded-xl" />
                            </figure>
                            <div className="card-body items-center text-center">
                                <h2 className="card-title">{brand.name}</h2>
                                <div className="flex items-center justify-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span>{brand.rating.toFixed(1)}</span>
                                </div>
                                <p>{brand.productCount} products</p>
                                <div className="card-actions">
                                    <button className="btn bg-[#40BFFF] hover:bg-[#3389cc] text-white border-none">
                                        View Products
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BrandPage;
