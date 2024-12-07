import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartOneProps {
	data: {
		hour?: string;
		month?: string;
		revenue: string | number;
		date?: string;
	}[];
	onFilterChange: (filter: string) => void;
	currentFilter: string;
}

const ChartOne: React.FC<ChartOneProps> = ({
	data,
	onFilterChange,
	currentFilter,
}) => {
	const formatChartData = (rawData: any[]) => {
		switch (currentFilter) {
			case 'today':
				return rawData.map((item) => ({
					month: item.hour,
					revenue: Number(item.revenue),
				}));

			case 'monthly':
				return rawData.map((item) => ({
					month: `Day ${new Date(item.date).getDate()}`,
					revenue: item.revenue,
				}));

			case 'yearly':
				return rawData.map((item) => ({
					month: `Month ${item.month}`,
					revenue: item.revenue,
				}));

			default:
				return rawData.map((item) => ({
					month: `${item.month}/${item.year}`,
					revenue: item.revenue,
				}));
		}
	};

	const formattedData = formatChartData(data);

	const formatXAxis = (value: string) => {
		if (currentFilter === 'today') {
			return value.split(':')[0] + ':00';
		}
		return value;
	};

	const options: ApexOptions = {
		chart: {
			type: 'bar',
			height: 350,
			toolbar: {
				show: false,
			},
			zoom: {
				enabled: false,
			},
			foreColor: '#A0AEC0',
			background: 'transparent',
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: '40%',
				colors: {
					ranges: [
						{
							from: 0,
							to: Number.MAX_SAFE_INTEGER,
							color: '#3C50E0',
						},
					],
				},
			},
		},
		colors: ['#3C50E0'],
		dataLabels: {
			enabled: false,
		},
		grid: {
			borderColor: '#535A6C',
			xaxis: {
				lines: {
					show: true,
				},
			},
			yaxis: {
				lines: {
					show: true,
				},
			},
		},
		stroke: {
			show: true,
			width: 2,
			colors: ['transparent'],
		},
		tooltip: {
			theme: 'dark',
			y: {
				formatter: (value) => {
					return new Intl.NumberFormat('vi-VN', {
						style: 'currency',
						currency: 'VND',
					}).format(value);
				},
			},
		},
		xaxis: {
			categories: formattedData.map((item) => item.month),
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			labels: {
				formatter: (value) => {
					return new Intl.NumberFormat('vi-VN', {
						style: 'currency',
						currency: 'VND',
						notation: 'compact',
						maximumFractionDigits: 1,
					}).format(value);
				},
			},
		},
		title: {
			text: 'Revenue',
			align: 'left',
			style: {
				fontSize: '16px',
				fontWeight: 600,
				color: '#fff',
			},
		},
	};

	const series = [
		{
			name: 'Revenue',
			data: formattedData.map((item) => item.revenue),
		},
	];

	const filterButtons = [
		{ value: 'today', label: 'Today' },
		{ value: 'monthly', label: 'This Month' },
		{ value: 'yearly', label: 'This Year' },
		{ value: 'all', label: 'All Time' },
	] as const;

	return (
		<div className="col-span-12 rounded-sm border border-stroke bg-navy-800 px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
			<div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-4">
				<div className="flex w-full flex-wrap gap-3 sm:gap-5">
					<div className="flex min-w-47.5">
						<span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
							<span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
						</span>
						<div className="w-full">
							<p className="font-semibold text-primary">Revenue</p>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					{filterButtons.map(({ value, label }) => (
						<button
							key={value}
							onClick={() => onFilterChange(value)}
							className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                ${
							currentFilter === value
								? 'bg-primary text-white shadow-lg'
								: 'bg-navy-700 text-gray-300 hover:bg-navy-600'
						}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div>
				<div id="chartOne" className="-ml-5">
					<ReactApexChart
						options={{
							...options,
							title: {
								...options.title,
								text: `Revenue ${
									currentFilter === 'today'
										? 'Today'
										: currentFilter === 'monthly'
										? 'This Month'
										: currentFilter === 'yearly'
										? 'This Year'
										: 'All Time'
								}`,
							},
						}}
						series={series}
						type="bar"
						height={350}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChartOne;
