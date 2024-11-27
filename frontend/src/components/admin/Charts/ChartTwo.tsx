import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ChartTwoProps {
	data: {
		name: string;
		total_revenue: number;
	}[];
}

const ChartTwo: React.FC<ChartTwoProps> = ({ data = [] }) => {
	const options: ApexOptions = {
		colors: ['#3C50E0'],
		chart: {
			fontFamily: 'Satoshi, sans-serif',
			type: 'bar',
			height: 335,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '55%',
				borderRadius: 5,
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 4,
			colors: ['transparent'],
		},
		xaxis: {
			categories: data.map(item => item.name),
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			title: {
				text: 'Revenue (VND)',
			},
		},
		fill: {
			opacity: 1,
		},
		tooltip: {
			y: {
				formatter: function (val) {
					return new Intl.NumberFormat('vi-VN', {
						style: 'currency',
						currency: 'VND'
					}).format(val);
				},
			},
		},
	};

	const series = [
		{
			name: 'Revenue',
			data: data.map(item => item.total_revenue),
		},
	];

	return (
		<div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
			<div className="mb-4 justify-between gap-4 sm:flex">
				<div>
					<h4 className="text-xl font-semibold text-black dark:text-white">
						Top Products
					</h4>
				</div>
			</div>
			{data.length > 0 && (
				<div>
					<div id="chartTwo" className="-mb-9">
						<ReactApexChart
							options={options}
							series={series}
							type="bar"
							height={350}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChartTwo;
