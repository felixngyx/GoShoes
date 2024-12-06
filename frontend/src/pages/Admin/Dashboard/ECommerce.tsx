import React from 'react';
import CardDataStats from '../../../components/admin/CardDataStats';
import ChartOne from '../../../components/admin/Charts/ChartOne';
import ChartTwo from '../../../components/admin/Charts/ChartTwo';
import { useEffect, useState } from 'react';
import axiosClient from '../../../apis/axiosClient';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';

interface HourlyRevenue {
	hour: string;
	revenue: string | number;
}

interface MonthlyRevenue {
	month: number;
	revenue: number;
}

interface TopProduct {
	id: number;
	name: string;
	total_revenue: number;
}

const ECommerce: React.FC = () => {
	const [currentFilter, setCurrentFilter] = useState<
		'today' | 'monthly' | 'yearly' | 'all'
	>('all');
	const [statistics, setStatistics] = useState({
		todayRevenue: 0,
		totalRevenue: 0,
		totalProducts: 0,
		totalUsers: 0,
		totalOrders: 0,
		monthlyRevenue: [] as (MonthlyRevenue | HourlyRevenue)[],
		topProducts: [] as TopProduct[],
		approvedPercentage: 0,
		pendingPercentage: 0,
		rejectedPercentage: 0,
	});

	useEffect(() => {
		fetchStatistics();
		fetchRefundStatistics();
	}, [currentFilter]);

	const fetchStatistics = async () => {
		try {
			const [monthlyRes, topProductsRes] = await Promise.all([
				axiosClient.get('/revenue/monthly', {
					params: { filter: currentFilter },
				}),
				axiosClient.get('/revenue/top-products'),
			]);

			const revenueData = currentFilter === 'today'
				? monthlyRes.data.revenue.map((item: HourlyRevenue) => ({
					...item,
					revenue: Number(item.revenue)
				}))
				: monthlyRes.data.revenue;

			setStatistics((prev) => ({
				...prev,
				todayRevenue: Number(monthlyRes.data.overview.today_revenue) || 0,
				totalRevenue: Number(monthlyRes.data.overview.total_revenue) || 0,
				totalProducts: monthlyRes.data.overview.total_products || 0,
				totalUsers: monthlyRes.data.overview.total_users || 0,
					totalOrders: monthlyRes.data.overview.total_orders || 0,
				monthlyRevenue: revenueData,
				topProducts: topProductsRes.data.top_products || [],
			}));
		} catch (error) {
			console.error('Error loading statistics:', error);
		}
	};

	const fetchRefundStatistics = async () => {
		try {
			const response = await axiosClient.get('/refunds/static');
			setStatistics((prev) => ({
				...prev,
				approvedPercentage: response.data.statistics.approved_percentage,
				pendingPercentage: response.data.statistics.pending_percentage,
				rejectedPercentage: response.data.statistics.rejected_percentage,
			}));
		} catch (error) {
			console.error('Error loading refund statistics:', error);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	return (
		<>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
				<CardDataStats
					title="Total Orders"
					total={statistics.totalOrders.toString()}
					rate=""
				>
					<ShoppingCart
						className="fill-primary dark:fill-white"
						size={22}
					/>
				</CardDataStats>

				<CardDataStats
					title="Today's Revenue"
					total={formatCurrency(statistics.todayRevenue)}
					rate=""
				>
					<DollarSign className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>

				<CardDataStats
					title="Total Products"
					total={statistics.totalProducts.toString()}
					rate=""
				>
					<Package className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>

				<CardDataStats
					title="Total Users"
					total={statistics.totalUsers.toString()}
					rate=""
				>
					<Users className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>
			</div>

			<div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
				<ChartOne
					data={statistics.monthlyRevenue}
					currentFilter={currentFilter}
					onFilterChange={setCurrentFilter}
				/>

				<ChartTwo
					data={statistics.topProducts.map((item) => ({
						name: item.name,
						total_revenue: item.total_revenue,
					}))}
				/>
			</div>

			<div className="mt-4 col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
				<div className="mb-3 justify-between gap-4 sm:flex">
					<div>
						<h5 className="text-xl font-semibold text-black dark:text-white">
							Refund Statistics
						</h5>
						<p className="text-sm text-gray-400 dark:text-gray-500">
							Overview of refunds in the system
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="rounded-sm border border-stroke bg-gray-100 p-4 dark:border-strokedark dark:bg-gray-800">
						<div className="flex items-center justify-between">
							<div>
								<h6 className="text-sm font-medium text-gray-600 dark:text-gray-300">
									Approved Refunds
								</h6>
								<p className="mt-1 text-lg font-bold text-green-600">
									{statistics.approvedPercentage.toFixed(2)}%
								</p>
							</div>
							<div className="rounded-full bg-green-100 p-2.5 dark:bg-green-900/20">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-green-600"
								>
									<path d="M20 13c0 5-3.5 7.5-7 8h-4c-3.5-0.5-7-3-7-8 0-2.5 2-5 5-5" />
									<path d="M12 16v-4" />
									<path d="M12 8h.01" />
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-sm border border-stroke bg-gray-100 p-4 dark:border-strokedark dark:bg-gray-800">
						<div className="flex items-center justify-between">
							<div>
								<h6 className="text-sm font-medium text-gray-600 dark:text-gray-300">
									Pending Refunds
								</h6>
								<p className="mt-1 text-lg font-bold text-yellow-600">
									{statistics.pendingPercentage.toFixed(2)}%
								</p>
							</div>
							<div className="rounded-full bg-yellow-100 p-2.5 dark:bg-yellow-900/20">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-yellow-600"
								>
									<path d="M12 2v10l4 4" />
									<circle cx="12" cy="14" r="8" />
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-sm border border-stroke bg-gray-100 p-4 dark:border-strokedark dark:bg-gray-800">
						<div className="flex items-center justify-between">
							<div>
								<h6 className="text-sm font-medium text-gray-600 dark:text-gray-300">
									Rejected Refunds
								</h6>
								<p className="mt-1 text-lg font-bold text-red-600">
									{statistics.rejectedPercentage.toFixed(2)}%
								</p>
							</div>
							<div className="rounded-full bg-red-100 p-2.5 dark:bg-red-900/20">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-red-600"
								>
									<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
									<path d="M5 7l1-1h12l1 1v12l-1 1H6l-1-1V7z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ECommerce;
