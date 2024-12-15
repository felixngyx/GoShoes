import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../../components/client/Breadcrumb';
import { getAllCategories } from '../../../services/client/categories';
import Pagination from '../ProductList/Pagination';

const CategoryPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currrentPage, setCurrrentPage] = useState(1);
	const { data: categoryData, refetch } = useQuery({
		queryKey: ['CATEGORIES', currrentPage],
		queryFn: async () => await getAllCategories(12, currrentPage),
	});

	const categories = Array.isArray(categoryData?.data)
		? categoryData.data
		: [];
	const filteredCategories = categories.filter((category: any) =>
		category.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const totalPages = categoryData?.last_page || 1;

	return (
		<>
			<Breadcrumb
				items={[
					{ name: 'Trang chủ', link: '' },
					{ name: 'Danh mục', link: 'category' },
				]}
			/>
			<div className="max-w-7xl mx-auto px-4 md:px-6 my-4 md:my-10">
				{/* Thanh tìm kiếm */}
				<label className="input input-sm md:input-md input-bordered flex items-center w-full max-w-[300px] md:max-w-[400px] mx-auto mb-6 md:mb-8">
					<input
						className="w-full"
						type="text"
						placeholder="Tìm kiếm danh mục..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<FaSearch
						size={16}
						className="cursor-pointer text-gray-400 hover:text-[#40BFFF]"
					/>
				</label>

				{/* Lưới danh mục */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
					{filteredCategories.map((category: any) => (
						<Link
							to={`/category/${category.id}`}
							key={category.id}
							className="transform hover:-translate-y-1 transition-all duration-300"
						>
							<div className="card bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#40BFFF]">
								<div className="card-body flex flex-row items-center p-4 md:p-6">
									<div className="text-3xl md:text-4xl mr-3 md:mr-4 text-[#40BFFF]">
										{category.icon}
									</div>
									<div>
										<h2 className="card-title text-base md:text-lg text-gray-800">
											{category.name}
										</h2>
										<p className="text-sm md:text-base text-gray-500">
											{category.products_count} sản phẩm
										</p>
										{category.featured && (
											<div className="badge badge-sm md:badge-md bg-[#40BFFF] text-white mt-2">
												Nổi bật
											</div>
										)}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>

				{/* Phân trang */}
				<div className="flex justify-center mt-4 md:mt-6">
					<Pagination
						currentPage={currrentPage}
						totalPages={totalPages}
						onPageChange={(newPage: number) => {
							setCurrrentPage(newPage);
							refetch();
						}}
					/>
				</div>
			</div>
		</>
	);
};

export default CategoryPage;
