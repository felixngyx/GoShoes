import React, { useState } from 'react';
import {
	Search,
	ChevronDown,
	MoreHorizontal,
	Filter,
	Plus,
	Trash2,
	Edit,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Create API instance outside component to avoid recreation on each render
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
});

// Setup request interceptor outside component
api.interceptors.request.use(
	(config) => {
		const token = Cookies.get('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Separate API function for better organization
const fetchDiscounts = async () => {
	const response = await api.get('/discounts');
	return response.data;
};

const DiscountList = () => {
	const navigate = useNavigate();
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
	const queryClient = useQueryClient();
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		discountId: number | null;
	}>({
		isOpen: false,
		discountId: null,
	});

	// Updated React Query implementation
	const { data, isLoading, error } = useQuery({
		queryKey: ['discounts'],
		queryFn: fetchDiscounts,
	});

	// React Hook Form setup for search
	const { register, watch } = useForm({
		defaultValues: {
			search: '',
		},
	});

	const searchTerm = watch('search');

	// Filter discounts based on search
	const filteredDiscounts =
		data?.data?.data?.filter(
			(discount: any) =>
				discount.code
					.toLowerCase()
					.includes(searchTerm?.toLowerCase() || '') ||
				discount.description
					.toLowerCase()
					.includes(searchTerm?.toLowerCase() || '')
		) || [];

	// Format date helper
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Status helpers
	const getStatusColor = (validFrom: string, validTo: string) => {
		const now = new Date();
		const startDate = new Date(validFrom);
		const endDate = new Date(validTo);

		if (now < startDate) return 'bg-yellow-100 text-yellow-700';
		if (now > endDate) return 'bg-red-100 text-red-700';
		return 'bg-green-100 text-green-700';
	};

	const getStatusText = (validFrom: string, validTo: string) => {
		const now = new Date();
		const startDate = new Date(validFrom);
		const endDate = new Date(validTo);

		if (now < startDate) return 'Scheduled';
		if (now > endDate) return 'Expired';
		return 'Active';
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await api.delete(`/discounts/${id}`, {
				headers: {
					Authorization: `Bearer ${Cookies.get('access_token')}`,
				},
			});

			if (response.data.status) {
				toast.success('Discount deleted successfully');
				setDeleteModal({ isOpen: false, discountId: null });
				queryClient.invalidateQueries({ queryKey: ['discounts'] });
			} else {
				toast.error(response.data.message || 'Failed to delete discount');
			}
		} catch (error: any) {
			console.error('Delete error:', error);
			toast.error(
				error.response?.data?.message || 'Failed to delete discount'
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-6">
				<div className="text-red-600">{error.message}</div>
			</div>
		);
	}

	return (
		<div className="p-6 bg-white/80 dark:bg-gray-800/80">
			<div className="flex items-center justify-between mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						{...register('search')}
						type="text"
						placeholder="Search discounts by name or code..."
						className="pl-10 pr-4 py-2 border rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80"
					/>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => navigate('/admin/discounts/create')}
						className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						Add Discount
					</button>
					<button
						className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
						onClick={() => setIsFilterOpen(!isFilterOpen)}
					>
						<Filter className="h-4 w-4" />
						Filters
					</button>
					<button className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
				<table className="w-full">
					<thead>
						<tr className="border-b dark:border-gray-700">
							<th className="w-12 px-4 py-3">
								<input
									type="checkbox"
									className="rounded dark:bg-gray-700 dark:border-gray-600"
								/>
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Code
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Description
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								<div className="flex items-center gap-1">
									Status
									<ChevronDown className="h-4 w-4" />
								</div>
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Valid From
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Valid To
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Discount
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-200">
								Used
							</th>
							<th className="w-12 px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{filteredDiscounts.map((discount: any) => (
							<tr
								key={discount.id}
								className="border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
							>
								<td className="px-4 py-3">
									<input
										type="checkbox"
										className="rounded dark:bg-gray-700 dark:border-gray-600"
									/>
								</td>
								<td className="px-4 py-3 text-sm font-mono dark:text-gray-200">
									{discount.code}
								</td>
								<td className="px-4 py-3 text-sm dark:text-gray-300">
									{discount.description}
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                    ${getStatusColor(discount.valid_from, discount.valid_to)}
                  `}
									>
										{getStatusText(
											discount.valid_from,
											discount.valid_to
										)}
									</span>
								</td>
								<td className="px-4 py-3 text-sm">
									{formatDate(discount.valid_from)}
								</td>
								<td className="px-4 py-3 text-sm">
									{formatDate(discount.valid_to)}
								</td>
								<td className="px-4 py-3 text-sm">
									{discount.percent}%
								</td>
								<td className="px-4 py-3 text-sm">
									{discount.used_count}/{discount.usage_limit}
								</td>
								<td className="px-4 py-3 relative">
									<button
										onClick={() =>
											setActiveDropdown(
												activeDropdown === discount.id
													? null
													: discount.id
											)
										}
										className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
									>
										<MoreHorizontal className="h-4 w-4 dark:text-gray-400" />
									</button>

									{activeDropdown === discount.id && (
										<>
											{/* Overlay để bắt sự kiện click outside */}
											<div
												className="fixed inset-0 z-20"
												onClick={() => setActiveDropdown(null)}
											/>

											{/* Dropdown menu */}
											<div className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 py-1 z-30">
												<button
													onClick={() => {
														navigate(
															`/admin/discounts/update/${discount.id}`
														);
														setActiveDropdown(null);
													}}
													className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
												>
													<Edit className="h-4 w-4" />
													Update
												</button>
												<button
													onClick={() => {
														setDeleteModal({
															isOpen: true,
															discountId: discount.id,
														});
														setActiveDropdown(null);
													}}
													className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
												>
													<Trash2 className="h-4 w-4" />
													Delete
												</button>
											</div>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{isFilterOpen && (
				<div className="absolute top-16 right-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 w-64 z-10 mt-32">
					<div className="space-y-3">
						<div className="font-medium dark:text-gray-200">Filters</div>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Code</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Description</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Status</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Valid Period</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Discount Amount</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded dark:bg-gray-700 dark:border-gray-600"
								defaultChecked
							/>
							<span className="dark:text-gray-300">Usage Count</span>
						</label>
					</div>
				</div>
			)}

			{deleteModal.isOpen && (
				<>
					<div className="fixed inset-0 bg-black/50 z-40" />
					<div className="fixed inset-0 flex items-center justify-center z-50">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
								<Trash2 className="h-6 w-6 text-red-600" />
							</div>

							<h3 className="text-lg font-medium text-center mb-2 dark:text-gray-200">
								Delete Discount
							</h3>

							<p className="text-gray-500 dark:text-gray-400 text-center mb-6">
								Are you sure you want to delete this discount? This
								action cannot be undone.
							</p>

							<div className="flex gap-3 justify-end">
								<button
									onClick={() =>
										setDeleteModal({
											isOpen: false,
											discountId: null,
										})
									}
									className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									Cancel
								</button>
								<button
									onClick={() =>
										deleteModal.discountId &&
										handleDelete(deleteModal.discountId)
									}
									className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default DiscountList;
