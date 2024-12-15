import {
	ArrowLeft,
	Printer,
	RefreshCcw,
	Truck,
	ListRestart,
	CheckCheck,
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';
import { Link, useParams } from 'react-router-dom';
import {
	Alert,
	AlertTitle,
	CircularProgress,
	Button,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useState } from 'react';
import PrintInvoice from './PrintInvoice';
import OrderDetailsSkeleton from './SkeletonLoading';

interface Product {
	name: string;
	thumbnail: string;
}

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	title,
	message,
	onConfirm,
	onCancel,
}) => (
	<Dialog open={open} onClose={onCancel}>
		<DialogTitle>{title}</DialogTitle>
		<DialogContent>
			<DialogContentText>{message}</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button
				onClick={onCancel}
				sx={{
					transition: 'all 0.2s',
					'&:hover': {
						transform: 'translateY(-1px)',
					},
				}}
				color="primary"
			>
				Huỷ
			</Button>
			<Button
				onClick={onConfirm}
				color="primary"
				variant="contained"
				autoFocus
			>
				Xác nhận
			</Button>
		</DialogActions>
	</Dialog>
);

interface OrderItem {
	quantity: number;
	price: number;
	subtotal: number;
	product: Product;
	variant: {
		size?: string;
		color?: string;
	} | null;
}

interface Customer {
	name: string;
	email: string;
	phone: string;
}

interface Shipping {
	shipping_detail: {
		name: string;
		phone_number: string;
		address: string;
		address_detail: string;
		is_default: boolean;
	};
}

interface Payment {
	method: string;
	status: string;
	url: string;
}

interface OrderResponse {
	success: boolean;
	data: {
		id: number;
		sku: string;
		status: string;
		total: string;
		created_at: string;
		customer: Customer;
		shipping: Shipping;
		payment: Payment;
		items: OrderItem[];
	};
}

const fetchOrder = async (id: string): Promise<OrderResponse> => {
	const token = Cookies.get('access_token');
	const BaseUri = import.meta.env.VITE_API_URL;
	try {
		const { data } = await axios.get<OrderResponse>(
			`${BaseUri}/orders/${id}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		);
		return data;
	} catch (error: any) {
		if (error.response) {
			if (error.response.status === 422) {
				throw new Error('Invalid order ID or parameters');
			} else if (error.response.status === 401) {
				throw new Error('Unauthorized access. Please login again.');
			} else if (error.response.status === 404) {
				throw new Error('Order not found');
			}
		}
		throw new Error('Failed to fetch order details');
	}
};

const renewPaymentLink = async (
	orderId: number
): Promise<{ success: boolean; data?: { url: string } }> => {
	const token = Cookies.get('access_token');
	const BaseUri = import.meta.env.VITE_API_URL;

	console.log('Starting renewPaymentLink request:', {
		url: `${BaseUri}/orders/${orderId}/renew-payment`,
		token: token ? 'Present' : 'Missing',
	});

	try {
		const response = await axios.post(
			`${BaseUri}/orders/${orderId}/renew-payment`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		console.log('Response received:', response.data);

		// Chỉ kiểm tra nếu success === true
		if (response.data.success) {
			return response.data;
		} else {
			throw new Error('Operation failed: success flag is false');
		}
	} catch (error: any) {
		console.error('Error in renewPaymentLink:', {
			status: error.response?.status,
			data: error.response?.data,
			message: error.message,
		});

		if (error.response) {
			const errorData = error.response.data;
			console.log('Error response data:', errorData);

			console.log('Full error response:', {
				status: error.response.status,
				statusText: error.response.statusText,
				headers: error.response.headers,
				data: error.response.data,
			});

			switch (error.response.status) {
				case 400:
					throw new Error(
						errorData.message || 'Invalid request parameters'
					);
				case 401:
					throw new Error('Session expired. Please login again');
				case 403:
					throw new Error(
						'You do not have permission to renew this payment'
					);
				case 404:
					throw new Error('Order not found');
				case 422:
					throw new Error(
						errorData.message || 'Invalid order status for renewal'
					);
				case 500:
					console.error('Server error details:', errorData);
					throw new Error(
						errorData.message ||
						'Server error. Please try again later or contact support'
					);
				default:
					throw new Error(
						`Failed to renew payment: ${errorData.message || 'Unknown error occurred'
						}`
					);
			}
		}

		if (error.request) {
			console.error('Network error:', error.request);
			throw new Error(
				'Network error. Please check your connection and try again'
			);
		}

		console.error('Other error:', error);
		throw new Error(error.message || 'Failed to renew payment link');
	}
};

const updateOrderStatus = async (
	orderId: number,
	status: 'shipping' | 'cancelled' | 'expired' | 'completed'
): Promise<OrderResponse> => {
	const token = Cookies.get('access_token');
	const BaseUri = import.meta.env.VITE_API_URL;

	console.log('Starting updateOrderStatus request:', {
		url: `${BaseUri}/orders/${orderId}/update`,
		status,
	});

	try {
		const response = await axios.put<OrderResponse>(
			`${BaseUri}/orders/${orderId}/update`,
			{ status },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		// Kiểm tra response có đúng format không
		if (!response.data) {
			throw new Error('Invalid response format');
		}

		console.log('Update status response:', response.data);
		return response.data;
	} catch (error: any) {
		console.error('Error in updateOrderStatus:', error.response || error);

		if (error.response) {
			const errorData = error.response.data;
			switch (error.response.status) {
				case 400:
					throw new Error(
						errorData.message || 'Invalid request parameters'
					);
				case 401:
					throw new Error('Session expired. Please login again');
				case 403:
					throw new Error(
						'You do not have permission to update this order'
					);
				case 404:
					throw new Error('Order not found');
				case 422:
					throw new Error(
						errorData.message || 'Invalid order status for update'
					);
				case 500:
					throw new Error(
						errorData.message || 'Server error. Please try again later'
					);
				default:
					throw new Error(
						`Failed to update status: ${errorData.message || 'Unknown error occurred'
						}`
					);
			}
		}

		// Network or other errors
		throw new Error(
			'Failed to connect to server. Please check your connection.'
		);
	}
};

// Sửa lại interface ShippingDetail
interface ShippingDetail {
	name: string;
	phone_number: string;
	address: string;
	address_detail: string;
	is_default: boolean;
}

// Sửa lại hàm parseShippingDetail
const parseShippingDetail = (shippingDetail: any): ShippingDetail | null => {
	try {
		// Nếu shippingDetail đã là object, return luôn
		if (typeof shippingDetail === 'object' && shippingDetail !== null) {
			return shippingDetail as ShippingDetail;
		}

		// Nếu là string thì mới parse
		if (typeof shippingDetail === 'string') {
			return JSON.parse(shippingDetail);
		}

		return null;
	} catch (error) {
		console.error('Error parsing shipping detail:', error);
		return null;
	}
};

const OrderDetails = () => {
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ['order', id],
		queryFn: () => fetchOrder(id as string),
		retry: 1,
	});
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: '',
		message: '',
		onConfirm: () => { },
	});

	const handlePrint = () => {
		if (!order) return;

		console.log('Order data for printing:', {
			shipping: order.shipping,
			shippingDetail: order.shipping?.shipping_detail
		});

		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			toast.error(
				'Unable to open print window. Please check your popup settings.'
			);
			return;
		}

		const printContent = ReactDOMServer.renderToString(
			<PrintInvoice order={order} />
		);

		printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hoá đơn #${order.sku}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
		printWindow.document.close();
	};

	const order = data?.data;

	const renewMutation = useMutation({
		mutationFn: (orderId: number) => {
			console.log('Starting mutation with orderId:', orderId);
			return renewPaymentLink(orderId);
		},
		onSuccess: (response) => {
			console.log('Mutation succeeded:', response);
			queryClient.invalidateQueries({ queryKey: ['order', id] });
			toast.success('Payment link renewed successfully');

			if (response.data?.url) {
				setTimeout(() => {
					window.open(response.data?.url, '_blank');
				}, 500);
			}
		},
		onError: (error: Error) => {
			console.error('Mutation error:', error);
			toast.error(error.message || 'Failed to renew payment link');
		},
	});

	const handleRenewLink = () => {
		setConfirmDialog({
			open: true,
			title: 'Confirm Payment Link Renewal',
			message:
				'Are you sure you want to renew the payment link for this order?',
			onConfirm: async () => {
				if (!id) {
					console.error('Invalid order ID:', id);
					toast.error('Invalid order ID');
					return;
				}

				try {
					await renewMutation.mutate(Number(id));
				} catch (error) {
					console.error('Error in handleRenewLink:', error);
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const statusMutation = useMutation({
		mutationFn: async ({
			orderId,
			status,
		}: {
			orderId: number;
			status: 'shipping' | 'cancelled' | 'expired' | 'completed';
		}) => {
			return updateOrderStatus(orderId, status);
		},
		onMutate: async ({ status }) => {
			await queryClient.cancelQueries({ queryKey: ['order', id] });
			const previousData = queryClient.getQueryData(['order', id]);

			// Optimistically update the status
			queryClient.setQueryData(['order', id], (old: any) => ({
				...old,
				data: {
					...old.data,
					status,
				},
			}));

			// Show immediate feedback
			toast.success(`Order status updated to ${status}`);

			return { previousData };
		},
		onError: (error: Error, _, context) => {
			// Revert on error
			if (context?.previousData) {
				queryClient.setQueryData(['order', id], context.previousData);
			}
			toast.error(error.message || 'Failed to update order status');
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['order', id] });
		},
	});

	const handleStatusUpdate = async (
		status: 'shipping' | 'cancelled' | 'expired' | 'completed'
	) => {
		setConfirmDialog({
			open: true,
			title: `Xác nhận chuyển trạng thái đơn hàng`,
			message: `Bạn có xác nhận chuyển đổi trạng thái đơn hàng sang ${status}?`,
			onConfirm: async () => {
				try {
					await statusMutation.mutateAsync({
						orderId: Number(id),
						status,
					});
				} catch (error) {
					console.error('Error in handleStatusUpdate:', error);
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	if (isLoading) {
		return <OrderDetailsSkeleton />;
	}

	if (error) {
		return (
			<div className="container mx-auto p-4">
				<Alert severity="error">
					<AlertTitle>Error</AlertTitle>
					{error.message}
				</Alert>
			</div>
		);
	}

	if (!order) {
		return null;
	}

	return (
		<div className="container mx-auto p-4 space-y-6 bg-white/80 dark:bg-gray-800/80">
			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				message={confirmDialog.message}
				onConfirm={confirmDialog.onConfirm}
				onCancel={() =>
					setConfirmDialog((prev) => ({ ...prev, open: false }))
				}
			/>
			<div className="flex items-center gap-2 text-sm text-gray-500">
				<Link
					to="/admin/orders"
					className="flex items-center gap-1 hover:text-blue-600"
				>
					<ArrowLeft className="h-4 w-4" />
					Đơn hàng / Chi tiết đơn hàng
				</Link>
				<span>/</span>
				<span>Đơn hàng #{order.sku}</span>
			</div>

			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Đơn hàng #{order.sku}</h1>
					<span className="text-sm text-blue-500">{order.status}</span>
					<div className="mt-2 text-sm text-gray-500">
						<span>
							Ngày tạo: {new Date(order.created_at).toLocaleString()}
						</span>
					</div>
				</div>
				<div className="flex gap-2">
					<Tooltip
						title={
							order.status === 'cancelled' ||
								order.status === 'completed'
								? 'Không thể thay đổi trạng thái khi đã hoàn thành'
								: ''
						}
					>
						<span>
							<Button
								disabled={order.status === 'cancelled'}
								variant="outlined"
								size="small"
								startIcon={<RefreshCcw className="h-4 w-4" />}
								onClick={() => handleStatusUpdate('cancelled')}
							>
								Chuyển sang Hủy
							</Button>
						</span>
					</Tooltip>

					<Tooltip
						title={
							order.status === 'shipping' || order.status === 'completed'
								? 'Không thể thay đổi trạng thái khi đang giao hàng'
								: ''
						}
					>
						<span>
							<Button
								disabled={
									order.status === 'shipping' ||
									order.status === 'completed'
								}
								variant="outlined"
								size="small"
								startIcon={<Truck className="h-4 w-4" />}
								onClick={() => handleStatusUpdate('shipping')}
							>
								Chuyển sang Đang giao hàng
							</Button>
						</span>
					</Tooltip>

					<Tooltip
						title={
							order.status === 'shipping' || order.status === 'completed'
								? 'Không thể thay đổi trạng thái khi đang giao hàng'
								: ''
						}
					>
						<span>
							<Button
								disabled={
									order.status === 'shipping' ||
									order.status === 'completed'
								}
								variant="outlined"
								size="small"
								startIcon={<Truck className="h-4 w-4" />}
								onClick={() => handleStatusUpdate('expired')}
							>
								Chuyển sang Hết hạn
							</Button>
						</span>
					</Tooltip>

					<Tooltip
						title={
							order.status === 'shipping' ||
								order.status === 'completed' ||
								order.status === 'pending' ||
								order.payment.method === 'Ship COD'
								? 'Không thể gia hạn liên kết khi đang chờ và đơn hàng thanh toán Ship COD'
								: ''
						}
					>
						<span>
							<Button
								disabled={
									order.status === 'shipping' ||
									order.status === 'completed' ||
									order.status === 'pending' ||
									order.payment.method === 'Ship COD'
								}
								variant="outlined"
								size="small"
								startIcon={<ListRestart className="h-4 w-4" />}
								onClick={handleRenewLink}
							>
								Gia hạn liên kết
							</Button>
						</span>
					</Tooltip>

					<Tooltip
						title={
							order.status === 'completed'
								? 'Không thể thay đổi trạng thái khi đã hoàn thành'
								: ''
						}
					>
						<Button
							disabled={order.status === 'completed'}
							variant="outlined"
							size="small"
							startIcon={<CheckCheck className="h-4 w-4" />}
							onClick={() => handleStatusUpdate('completed')}
						>
							Hoàn thành
						</Button>
					</Tooltip>

					<Tooltip
						title={
							order.status !== 'shipping'
								? 'Chỉ có thể in hóa đơn khi đơn hàng đang giao hàng'
								: ''
						}
					>
						<span>
							<Button
								variant="contained"
								size="small"
								color="success"
								startIcon={<Printer className="h-4 w-4" />}
								onClick={handlePrint}
								disabled={order.status !== 'shipping'}
							>
								In hóa đơn
							</Button>
						</span>
					</Tooltip>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{[
					{
						title: 'THÔNG TIN KHÁCH HÀNG',
						content: [
							{ label: 'Tên', value: order.customer.name },
							{ label: 'Email', value: order.customer.email },
							{ label: 'Số điện thoại', value: order.customer.phone || 'N/A' },
						],
					},
					{
						title: 'THÔNG TIN THANH TOÁN',
						content: [
							{ label: 'Phương thức thanh toán', value: order.payment.method },
							{ label: 'Trạng thái thanh toán', value: order.payment.status },
							{
								label: 'Tổng số tiền', value: `${new Intl.NumberFormat('de-DE', {
									style: 'decimal',
								}).format(Number(order.total))}đ`
							},
							{ label: 'Ngày tạo', value: new Date(order.created_at).toLocaleString() },
							order.payment.url && {
								label: 'Liên kết thanh toán',
								value: <a href={order.payment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Xem liên kết thanh toán</a>
							},
						].filter(Boolean),
					},
					{
						title: 'THÔNG TIN GIAO HÀNG',
						content: order.shipping?.shipping_detail
							? (() => {
								const shippingDetail = parseShippingDetail(order.shipping.shipping_detail);
								return shippingDetail
									? [
										{
											label: 'Người nhận',
											value: shippingDetail.name,
										},
										{
											label: 'Số điện thoại',
											value: shippingDetail.phone_number,
										},
										{
											label: 'Địa chỉ',
											value: shippingDetail.address_detail,
										},
										{
											label: 'Thành phố/Tỉnh',
											value: shippingDetail.address,
										},
										{
											label: 'Địa chỉ mặc định',
											value: shippingDetail.is_default ? 'Có' : 'Không',
										},
									]
									: [
										{
											label: 'Lỗi',
											value: 'Chi tiết giao hàng không hợp lệ',
										},
									];
							})()
							: [
								{
									label: 'Không có chi tiết giao hàng',
									value: 'N/A',
								},
							],
					},
				].map((card, index) => (
					<div
						key={index}
						className="bg-white p-4 rounded-lg shadow bg-white/80 dark:bg-gray-800/80"
					>
						<div className="flex justify-between items-center mb-2">
							<h3 className="font-semibold">{card.title}</h3>
						</div>
						<div className="text-sm space-y-2">
							{Array.isArray(card.content) &&
								card.content.map((item, i) =>
									typeof item === 'string' ? (
										<p key={i}>{item}</p>
									) : (
										<div key={i} className="flex justify-between">
											<span className="text-gray-500">
												{item.label}
											</span>
											<span>{item.value}</span>
										</div>
									)
								)}
						</div>
					</div>
				))}
			</div>

			<div className="bg-white p-4 rounded-lg shadow bg-white/80 dark:bg-gray-800/80">
				<div className="flex justify-between items-center mb-4">
					<h3 className="font-semibold">Sản phẩm</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b">
								<th className="text-left py-2">Tên sản phẩm</th>
								<th className="text-left py-2">Biến thể</th>
								<th className="text-left py-2">Số lượng</th>
								<th className="text-right py-2">Giá</th>
								<th className="text-right py-2">Tổng giá</th>
							</tr>
						</thead>
						<tbody>
							{order.items.map((item, index) => (
								<tr key={index} className="border-b">
									<td className="py-2">
										<div className="flex items-center gap-2">
											<img
												src={item.product.thumbnail}
												alt={item.product.name}
												className="w-10 h-10 rounded-md"
											/>
											{item.product.name}
										</div>
									</td>
									<td className="py-2">
										{item.variant ? (
											<div className="text-sm text-gray-600">
												{item.variant.size && (
													<span>Kích thước: {item.variant.size}</span>
												)}
												{item.variant.size &&
													item.variant.color && (
														<span className="mx-1">|</span>
													)}
												{item.variant.color && (
													<span>Màu sắc: {item.variant.color}</span>
												)}
											</div>
										) : (
											<span className="text-sm text-gray-400">
												Không có biến thể
											</span>
										)}
									</td>
									<td className="py-2">{item.quantity}</td>
									<td className="py-2 text-right">
										{new Intl.NumberFormat('de-DE', {
											style: 'decimal',
										}).format(Number(item.price))}
										đ
									</td>
									<td className="py-2 text-right">
										{new Intl.NumberFormat('de-DE', {
											style: 'decimal',
										}).format(Number(item.subtotal))}
										đ
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="mt-6 space-y-2">
					<div className="flex justify-between font-semibold">
						<span>Tổng cuối cùng</span>
						<span>
							{new Intl.NumberFormat('de-DE', {
								style: 'decimal',
							}).format(Number(order.total))}
							đ
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetails;
