import React from 'react';
import CardDataStats from '../../../components/admin/CardDataStats';
import ChartOne from '../../../components/admin/Charts/ChartOne';
import ChartTwo from '../../../components/admin/Charts/ChartTwo';
import { useEffect, useState } from 'react';
import axiosClient from '../../../apis/axiosClient';
import { 
	ShoppingCart, 
	DollarSign,
	Package,
	Users
} from 'lucide-react';

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
	const [currentFilter, setCurrentFilter] = useState<'today' | 'monthly' | 'yearly' | 'all'>('all');
	const [statistics, setStatistics] = useState({
		todayRevenue: 0,
		totalRevenue: 0,
		totalProducts: 0,
		totalUsers: 0,
		totalOrders: 0,
		monthlyRevenue: [] as MonthlyRevenue[],
		topProducts: [] as TopProduct[]
	});

	useEffect(() => {
		fetchStatistics();
	}, [currentFilter]);

	const fetchStatistics = async () => {
		try {
			const [monthlyRes, topProductsRes] = await Promise.all([
				axiosClient.get('/revenue/monthly', {
					params: { filter: currentFilter }
				}),
				axiosClient.get('/revenue/top-products')
			]);

			setStatistics({
				todayRevenue: monthlyRes.data.overview.today_revenue || 0,
				totalRevenue: monthlyRes.data.overview.total_revenue || 0,
				totalProducts: monthlyRes.data.overview.total_products || 0,
				totalUsers: monthlyRes.data.overview.total_users || 0,
				totalOrders: monthlyRes.data.overview.total_orders || 0,
				monthlyRevenue: monthlyRes.data.revenue || [],
				topProducts: topProductsRes.data.top_products || []
			});
		} catch (error) {
			console.error('Error loading statistics:', error);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount);
	};

	return (
		<>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
				<CardDataStats
					title="Total Orders"
					total={statistics.totalOrders.toString()}
					rate="0.43%"
					levelUp
				>
					<ShoppingCart className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>

				<CardDataStats
					title="Today's Revenue"
					total={formatCurrency(statistics.todayRevenue)}
					
					rate="0.43%"
					levelUp
				>
					<DollarSign className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>

				<CardDataStats
					title="Total Products"
					total={statistics.totalProducts.toString()}
					
					rate="2.59%"
					levelUp
				>
					<Package className="fill-primary dark:fill-white" size={22} />
				</CardDataStats>

				<CardDataStats
					title="Total Users"
					total={statistics.totalUsers.toString()}
					rate="0.95%"
					levelDown
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
					data={statistics.topProducts.map(item => ({
						name: item.name,
						total_revenue: item.total_revenue
					}))}
				/>
			</div>
		</>
	);
};

export default ECommerce;
