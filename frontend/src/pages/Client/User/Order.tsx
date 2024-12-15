import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { Order, OrderStatus, Tab } from '../../../types/client/order';
import { Search } from 'lucide-react';
import {
	Paper,
	TextField,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Chip,
	Skeleton,
	Box,
	Pagination,
	Select,
	MenuItem,
	InputAdornment,
	Modal,
	Typography,
	IconButton,
} from '@mui/material';
import { Tab as MuiTab, Tabs } from '@mui/material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Upload, X } from 'lucide-react';
import DialogReview from '../../../components/client/DialogReview';
import { CheckCircle } from 'lucide-react';

const tabs: Tab[] = [
	{ id: 'all', label: 'Tất cả', color: 'text-red-500' },
	{ id: 'pending', label: 'Đang chờ thanh toán', color: 'text-gray-700' },
	{ id: 'processing', label: 'Đang xử lý', color: 'text-gray-700' },
	{ id: 'shipping', label: 'Đang vận chuyển', color: 'text-gray-700' },
	{ id: 'completed', label: 'Thành công', color: 'text-gray-700' },
	{ id: 'cancelled', label: 'Đã huỷ', color: 'text-gray-700' },
	{ id: 'refunded', label: 'Đã trả hàng', color: 'text-gray-700' },
	{ id: 'expired', label: 'Hết hạn', color: 'text-gray-700' },
	{ id: 'failed', label: 'Thất bại', color: 'text-gray-700' },
];

interface ApiResponse {
	success: boolean;
	data: Order[];
	pagination: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		next_page_url: string | null;
		prev_page_url: string | null;
	};
}

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
});

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

interface SortOption {
	value: string;
	label: string;
}

interface FilterState {
	search: string;
	status: OrderStatus | 'all';
	sort: string;
}

interface RefundFormData {
	reason: string;
	images: File[];
}

export default function OrderList(): JSX.Element {
	const [filters, setFilters] = useState<FilterState>({
		search: '',
		status: 'all',
		sort: 'newest',
	});
	const [debouncedFilters] = useDebounce(filters, 500);
	const [page, setPage] = useState(1);
	const [openDialog, setOpenDialog] = useState<{
		type: string;
		orderId: string | null;
		paymentUrl?: string;
	}>({
		type: '',
		orderId: null,
	});
	const [isRenewing, setIsRenewing] = useState<string | null>(null);
	const [refundForm, setRefundForm] = useState<{
		reason: string;
		images: File[];
	}>({
		reason: '',
		images: [],
	});

	const {
		data: ordersData,
		isLoading,
		refetch,
	} = useQuery<ApiResponse>({
		queryKey: ['orders', debouncedFilters, page],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				sort: debouncedFilters.sort,
			});

			if (debouncedFilters.status !== 'all') {
				params.append('status', debouncedFilters.status);
			}

			if (debouncedFilters.search) {
				params.append('search', debouncedFilters.search);
			}

			const response = await api.get<ApiResponse>(
				`/orders?${params.toString()}`
			);

			if (!response.data.success) {
				throw new Error('Failed to fetch orders');
			}

			return response.data;
		},
	});

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const searchValue = formData.get('search') as string;

		setFilters((prev) => ({
			...prev,
			search: searchValue,
		}));
		setPage(1);
	};

	const handleStatusChange = (newStatus: OrderStatus | 'all') => {
		setFilters((prev) => ({
			...prev,
			status: newStatus,
		}));
		setPage(1);
	};

	const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({
			...prev,
			sort: event.target.value,
		}));
		setPage(1);
	};

	const handleCancelOrder = async (orderId: string): Promise<void> => {
		try {
			await api.put(`/orders/${orderId}/update`, {
				status: 'cancelled',
			});

			setOpenDialog({ type: '', orderId: null });
			// Refresh data
			refetch();

			// Thay đổi toast thành Modal thông báo
			setOpenDialog({
				type: 'cancel-success',
				orderId: null,
			});
		} catch (error: any) {
			if (error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error('Failed to cancel order');
			}
		}
	};

	const handleRefundRequest = async (orderId: string): Promise<void> => {
		try {
			// Upload ảnh ln Cloudinary trư��c
			const uploadedImages = await Promise.all(
				refundForm.images.map(async (image) => {
					const imageFormData = new FormData();
					imageFormData.append('file', image);
					imageFormData.append('upload_preset', 'go_shoes');
					imageFormData.append('cloud_name', 'drxguvfuq');

					const response = await axios.post(
						`https://api.cloudinary.com/v1_1/drxguvfuq/image/upload`,
						imageFormData
					);

					return response.data.url;
				})
			);

			// Gửi request với cookie trong header
			const token = Cookies.get('access_token');
			await axios.post(
				`${import.meta.env.VITE_API_URL}/refunds`,
				{
					order_id: orderId,
					reason: refundForm.reason,
					images: uploadedImages,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				}
			);

			setOpenDialog({ type: '', orderId: null });
			setRefundForm({ reason: '', images: [] });
			refetch();
			toast.success('Return & refund request submitted successfully');
		} catch (error: any) {
			console.error('Refund request error:', error);
			if (error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error('Failed to submit return & refund request');
			}
		}
	};

	const handleConfirmReceived = async (orderId: string): Promise<void> => {
		try {
			await api.put(`/orders/${orderId}/update`, {
				status: 'completed',
			});

			setOpenDialog({ type: '', orderId: null });
			// Refresh data
			refetch();
			toast.success('Order confirmed as received');
		} catch (error: any) {
			if (error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error('Failed to confirm order');
			}
		}
	};

	const navigate = useNavigate();

	const handleBuyAgain = async (order: Order) => {
		try {
			if (!order.items || order.items.length === 0) {
				throw new Error('Không có sản phẩm trong đơn hàng');
			}

			const itemsWithCurrentPrice = await Promise.all(
				order.items.map(async (item) => {
					try {
						const response = await axios.get(
							`${import.meta.env.VITE_API_URL}/products/${item.product.id
							}`,
							{
								headers: {
									Authorization: `Bearer ${Cookies.get(
										'access_token'
									)}`,
								},
							}
						);

						const currentProduct = response.data.data;
						console.log('Current Product:', currentProduct);
						console.log('Item Variant:', item.variant);

						if (!currentProduct) {
							throw new Error(
								`Sản phẩm ${item.product.name} không còn tồn tại`
							);
						}

						if (currentProduct.status !== 'public') {
							throw new Error(
								`Sản phẩm ${item.product.name} hiện không khả dụng`
							);
						}

						let currentPrice =
							currentProduct.promotional_price || currentProduct.price;

						if (item.variant) {
							const variants = JSON.parse(currentProduct.variants);
							console.log('Parsed Variants:', variants);

							if (!variants || variants.length === 0) {
								throw new Error(
									`Sản phẩm ${item.product.name} không có biến thể`
								);
							}

							// Tìm variant phù hợp dựa trên tên màu
							const currentVariant = variants.find((v) => {
								console.log('Comparing:', {
									'variant color': v.color,
									'requested color': item.variant?.color,
									'has matching size': v.sizes.some(
										(s) =>
											Number(s.size_id) ===
											Number(item.variant?.size_id)
									),
								});

								return v.color === item.variant?.color;
							});

							if (!currentVariant) {
								throw new Error(
									`Biến thể màu '${item.variant.color}' của sản phẩm ${item.product.name} không còn tồn tại`
								);
							}

							const matchingSize = currentVariant.sizes.find(
								(s) => s.size === item.variant?.size // So sánh theo tên size thay vì size_id
							);

							console.log('Found Matching Size:', matchingSize);

							if (!matchingSize) {
								throw new Error(
									`Size '${item.variant.size}' của sản phẩm ${item.product.name} không còn tồn tại`
								);
							}

							if (matchingSize.quantity === 0) {
								throw new Error(
									`Biến thể của sản phẩm ${item.product.name} đã hết hàng`
								);
							}

							if (matchingSize.quantity < item.quantity) {
								throw new Error(
									`Chỉ còn ${matchingSize.quantity} sản phẩm cho biến th�� của ${item.product.name}`
								);
							}

							return {
								id: item.product.id,
								name: item.product.name,
								quantity: item.quantity,
								thumbnail: currentProduct.thumbnail,
								price: Number(currentPrice),
								total: Number(currentPrice) * item.quantity,
								stock_quantity: matchingSize.quantity,
								product_variant: {
									variant_id: matchingSize.product_variant_id,
									size_id: matchingSize.size_id,
									color_id: matchingSize.color_id,
									size: item.variant.size,
									color: item.variant.color,
								},
							};
						} else {
							// Xử lý sản phẩm không có variant
							if (currentProduct.stock_quantity === 0) {
								throw new Error(
									`Sản phẩm ${item.product.name} đã hết hàng`
								);
							}

							if (currentProduct.stock_quantity < item.quantity) {
								throw new Error(
									`Chỉ còn ${currentProduct.stock_quantity} sản phẩm ${item.product.name}`
								);
							}

							return {
								id: item.product.id,
								name: item.product.name,
								quantity: item.quantity,
								thumbnail: currentProduct.thumbnail,
								price: Number(currentPrice),
								total: Number(currentPrice) * item.quantity,
								stock_quantity: currentProduct.stock_quantity,
							};
						}
					} catch (error: any) {
						console.error('Error processing item:', error);
						throw new Error(
							error.message ||
							`Không thể lấy thông tin sản phẩm ${item.product.name}`
						);
					}
				})
			);

			const newTotal = itemsWithCurrentPrice.reduce(
				(sum, item) => sum + item.total,
				0
			);

			const orderSummary = {
				subtotal: newTotal,
				total: newTotal,
				original_total: newTotal,
			};

			navigate('/checkout', {
				state: {
					cartItems: itemsWithCurrentPrice,
					orderSummary: orderSummary,
				},
			});
		} catch (error: any) {
			console.error('Lỗi khi xử lý mua lại:', error);
			toast.error(
				error.message ||
				'Không thể xử lý yêu cầu mua lại. Vui lòng thử lại sau.'
			);
		}
	};

	const getStatusColor = (
		status: OrderStatus
	): {
		color:
		| 'default'
		| 'primary'
		| 'secondary'
		| 'error'
		| 'info'
		| 'success'
		| 'warning';
	} => {
		const statusColors: Record<
			OrderStatus,
			{
				color:
				| 'default'
				| 'primary'
				| 'secondary'
				| 'error'
				| 'info'
				| 'success'
				| 'warning';
			}
		> = {
			pending: { color: 'warning' },
			processing: { color: 'info' },
			completed: { color: 'success' },
			cancelled: { color: 'error' },
			refunded: { color: 'secondary' },
			expired: { color: 'default' },
			shipping: { color: 'primary' },
			failed: { color: 'error' },
		};
		return statusColors[status];
	};

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const renewPaymentLink = async (orderId: string): Promise<void> => {
		try {
			setIsRenewing(orderId);

			const token = Cookies.get('access_token');
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/orders/${orderId}/renew-payment`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				}
			);

			if (response.data.success && response.data.payment_url) {
				setOpenDialog({
					type: 'confirm-payment',
					orderId,
					paymentUrl: response.data.payment_url,
				});
			} else {
				throw new Error('Payment URL not found');
			}
		} catch (error: any) {
			console.error('Error renewing payment:', error);
			if (error.response?.data?.message) {
				toast.error(error.response.data.message);
			} else {
				toast.error('Failed to renew payment link');
			}
		} finally {
			setIsRenewing(null);
		}
	};
	const [openReviewDialog, setOpenReviewDialog] = useState(false);

	const renderActionButtons = (order: Order) => {
		const viewDetailsButton = (
			<Button
				component={Link}
				to={`/account/my-order/${order.id}`}
				variant="outlined"
				size="small"
			>
				Xem chi tiết
			</Button>
		);

		switch (order.status.toLowerCase()) {
			case 'pending':
				return (
					<div className="space-x-2">
						{viewDetailsButton}
						<Button
							variant="contained"
							size="small"
							onClick={() =>
								setOpenDialog({
									type: 'confirm-payment',
									orderId: order.id,
									paymentUrl: order.payment?.payment_url,
								})
							}
							color="primary"
						>
							Thanh toán ngay
						</Button>
					</div>
				);

			case 'processing':
				return (
					<div className="space-x-2">
						{viewDetailsButton}
						<Button
							variant="outlined"
							size="small"
							color="error"
							onClick={() =>
								setOpenDialog({ type: 'cancel', orderId: order.id })
							}
						>
							Huỷ đơn
						</Button>
					</div>
				);

			case 'expired':
				if (order.status === 'completed') {
					return viewDetailsButton;
				}
				return (
					<div className="space-x-2">
						{viewDetailsButton}
						<Button
							variant="contained"
							size="small"
							onClick={() => renewPaymentLink(order.id)}
							color="primary"
							disabled={isRenewing === order.id}
						>
							{isRenewing === order.id ? 'Renewing...' : 'Renew Link'}
						</Button>
					</div>
				);

			case 'completed':
				return (
					<div className="space-x-2">
						{viewDetailsButton}

						<Button
							variant="outlined"
							size="small"
							onClick={() =>
								setOpenDialog({ type: 'refund', orderId: order.id })
							}
						>
							Return & Refund
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={() => {
								setOpenReviewDialog(true);
								setSelectedOrderId(order.id);
							}}
							color="primary"
						>
							Đánh giá
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={() => handleBuyAgain(order)}
							color="primary"
						>
							Mua lại
						</Button>

						<DialogReview
							open={openReviewDialog}
							onClose={() => setOpenReviewDialog(false)}
							orderId={selectedOrderId}
						/>
					</div>
				);

			case 'shipping':
				return (
					<div className="space-x-2">
						{viewDetailsButton}
						<Button
							variant="contained"
							size="small"
							color="success"
							onClick={() =>
								setOpenDialog({
									type: 'confirm-received',
									orderId: order.id,
								})
							}
						>
							Đã nhận hàng
						</Button>
					</div>
				);

			default:
				return viewDetailsButton;
		}
	};

	const [selectedOrderId, setSelectedOrderId] = useState<string>('');

	const sortOptions: SortOption[] = [
		{ value: 'newest', label: 'Mới nhất' },
		{ value: 'oldest', label: 'Cũ nhất' },
	];

	const handleClosePaymentDialog = () => {
		setOpenDialog({ type: '', orderId: null });
		// Refresh data after closing dialog
		refetch();
	};

	const handleConfirmPayment = () => {
		if (openDialog.paymentUrl) {
			window.location.href = openDialog.paymentUrl;
		}
		setOpenDialog({ type: '', orderId: null });
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		const fileArray = Array.from(files);

		// Kiểm tra số lượng ảnh tối đa
		if (refundForm.images.length + fileArray.length > 5) {
			toast.error('Tối đa 5 ảnh được phép');
			return;
		}

		// Validate files
		const validFiles = fileArray.filter((file) => {
			// Check file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`Kích thước ${file.name} quá lớn (tối đa 5MB)`);
				return false;
			}

			// Check file type
			if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
				toast.error(
					`File ${file.name} không hợp lệ. Chỉ chấp nhận file ảnh (jpeg, jpg, png)`
				);
				return false;
			}

			return true;
		});

		setRefundForm((prev) => ({
			...prev,
			images: [...prev.images, ...validFiles],
		}));

		// Reset input
		event.target.value = '';
	};

	const removeImage = (index: number) => {
		setRefundForm((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	return (
		<div className="max-w-7xl mx-auto p-4">
			<div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
				<form onSubmit={handleSearch} className="w-full sm:w-auto">
					<TextField
						name="search"
						placeholder="Tìm kiếm theo Mã đơn hàng, SKU..."
						variant="outlined"
						size="small"
						defaultValue={filters.search}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search className="w-5 h-5 text-gray-500" />
								</InputAdornment>
							),
						}}
						className="w-full sm:w-80"
					/>
				</form>

				<div className="flex gap-2 w-full sm:w-auto">
					<Select
						value={filters.sort}
						onChange={handleSortChange}
						size="small"
						className="w-full sm:w-48"
					>
						{sortOptions.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</div>
			</div>

			<Paper className="mb-4">
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<Tabs
						value={filters.status}
						onChange={(_, newValue) => handleStatusChange(newValue)}
						variant="scrollable"
						scrollButtons="auto"
					>
						{tabs.map((tab) => (
							<MuiTab
								key={tab.id}
								label={
									<div className="flex items-center gap-2">
										{tab.label}
										{ordersData?.filters?.counts?.[tab.id] && (
											<span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
												{ordersData.filters.counts[tab.id]}
											</span>
										)}
									</div>
								}
								value={tab.id}
							/>
						))}
					</Tabs>
				</Box>
			</Paper>

			{(filters.search || filters.status !== 'all') && (
				<div className="mb-4 flex flex-wrap gap-2">
					{filters.search && (
						<Chip
							label={`Search: ${filters.search}`}
							onDelete={() =>
								setFilters((prev) => ({ ...prev, search: '' }))
							}
							size="small"
						/>
					)}
					{filters.status !== 'all' && (
						<Chip
							label={`Status: ${filters.status}`}
							onDelete={() =>
								setFilters((prev) => ({ ...prev, status: 'all' }))
							}
							size="small"
						/>
					)}
				</div>
			)}

			{isLoading ? (
				<div className="space-y-4">
					{[...Array(3)].map((_, index) => (
						<Paper key={index} className="p-4">
							<Skeleton variant="rectangular" height={100} />
						</Paper>
					))}
				</div>
			) : (
				<>
					{ordersData?.data.map((order) => (
						<Paper key={order.id} className="mb-4 p-4">
							<div className="flex justify-between items-start mb-2">
								<div>
									<p className="font-medium">Đơn hàng #{order.sku}</p>
									<p className="text-sm text-gray-500">
										{format(
											new Date(order.created_at),
											'dd/MM/yyyy HH:mm'
										)}
									</p>
								</div>
								<Chip
									label={order.status}
									color={getStatusColor(order.status).color}
									size="small"
								/>
							</div>
							<div className="flex items-start justify-between">
								<div className="flex items-center space-x-4">
									<img
										src={order.items[0]?.variant?.image || order.items[0]?.product.thumbnail}
										alt={order.items[0]?.product.name}
										className="w-20 h-20 rounded-lg object-cover"
									/>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="font-medium">
												{order.items[0]?.product.name}
												{order.items.length > 1 && (
													<span className="text-sm text-gray-500 ml-2">
														+{order.items.length - 1} sản phẩm khác
													</span>
												)}
											</h3>
										</div>
										<p className="text-sm text-gray-500">
											SKU: {order.sku}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-medium">
										{formatCurrency(order.total)}
									</p>
									{Number(order.original_total) - Number(order.total) >
										0 && (
											<p className="text-sm text-green-600">
												Tiết kiệm:{' '}
												{formatCurrency(
													Number(order.original_total) -
													Number(order.total)
												)}
											</p>
										)}
								</div>
							</div>
							<div className="flex justify-end items-center pt-4 space-x-2">
								{renderActionButtons(order)}
							</div>
						</Paper>
					))}

					{(!ordersData?.data || ordersData.data.length === 0) && (
						<Paper className="p-12 text-center text-gray-500">
							{filters.search
								? 'Không tìm thấy đơn hàng nào khớp với tiêu chí tìm kiếm của bạn'
								: 'Không tìm thấy đơn hàng nào'}
						</Paper>
					)}

					{ordersData?.pagination && ordersData.data.length > 0 && (
						<Box display="flex" justifyContent="center" mt={4}>
							<Pagination
								count={ordersData.pagination.last_page}
								page={page}
								onChange={(_, newPage) => setPage(newPage)}
								color="primary"
							/>
						</Box>
					)}
				</>
			)}

			<Dialog
				open={openDialog.type === 'cancel'}
				onClose={() => setOpenDialog({ type: '', orderId: null })}
			>
				<DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có chắc chắn muốn hủy đơn hàng này không?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setOpenDialog({ type: '', orderId: null })}
					>
						Không
					</Button>
					<Button
						onClick={() =>
							openDialog.orderId && handleCancelOrder(openDialog.orderId)
						}
						variant="contained"
						color="error"
					>
						Có, hủy đơn hàng
					</Button>
				</DialogActions>
			</Dialog>

			<Modal
				open={openDialog.type === 'refund'}
				onClose={() => {
					setOpenDialog({ type: '', orderId: null });
					setRefundForm({ reason: '', images: [] });
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90%', sm: 600 },
						bgcolor: 'background.paper',
						borderRadius: 1,
						boxShadow: 24,
						p: 4,
						maxHeight: '90vh',
						overflowY: 'auto',
					}}
				>
					<Typography variant="h6" component="h2" mb={2}>
						Yêu cầu trả hàng & hoàn tiền
					</Typography>

					<Typography variant="body2" color="text.secondary" mb={3}>
						Vui lòng cung cấp chi tiết về yêu cầu trả hàng của bạn. Lưu ý rằng các mặt hàng phải ở tình trạng ban đầu.
					</Typography>

					<TextField
						fullWidth
						label="Lý do trả hàng"
						multiline
						rows={4}
						value={refundForm.reason}
						onChange={(e) =>
							setRefundForm((prev) => ({
								...prev,
								reason: e.target.value,
							}))
						}
						placeholder="Vui lòng giải thích lý do bạn muốn trả lại mặt hàng này..."
						required
						margin="normal"
					/>

					<Box mt={3}>
						<Typography variant="subtitle2" mb={1}>
							Tải lên hình ảnh (Tối đa 5)
						</Typography>

						<Box
							sx={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: 1,
								mb: 2,
							}}
						>
							{refundForm.images.map((image, index) => (
								<Box
									key={index}
									sx={{
										position: 'relative',
										width: 100,
										height: 100,
									}}
								>
									<img
										src={URL.createObjectURL(image)}
										alt={`Preview ${index + 1}`}
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											borderRadius: '4px',
										}}
									/>
									<IconButton
										size="small"
										sx={{
											position: 'absolute',
											top: -8,
											right: -8,
											bgcolor: 'background.paper',
											'&:hover': {
												bgcolor: 'background.paper',
											},
										}}
										onClick={() => removeImage(index)}
									>
										<X className="w-4 h-4" />
									</IconButton>
								</Box>
							))}
						</Box>

						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/jpeg,image/png,image/jpg"
							onChange={handleFileChange}
							style={{ display: 'none' }}
						/>

						<Button
							variant="outlined"
							onClick={handleUploadClick}
							startIcon={<Upload className="w-4 h-4" />}
							disabled={refundForm.images.length >= 5}
						>
							Tải lên hình ảnh ({refundForm.images.length}/5)
						</Button>
					</Box>

					<DialogActions sx={{ mt: 3 }}>
						<Button
							onClick={() => {
								setOpenDialog({ type: '', orderId: null });
								setRefundForm({ reason: '', images: [] });
							}}
						>
							Hủy bỏ
						</Button>
						<Button
							onClick={() =>
								openDialog.orderId &&
								handleRefundRequest(openDialog.orderId)
							}
							variant="contained"
							color="primary"
							disabled={
								!refundForm.reason.trim() ||
								refundForm.images.length === 0
							}
						>
							Gửi yêu cầu
						</Button>
					</DialogActions>
				</Box>
			</Modal>

			<Dialog
				open={openDialog.type === 'confirm-received'}
				onClose={() => setOpenDialog({ type: '', orderId: null })}
			>
				<DialogTitle>Xác nhận đã nhận hàng</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn đã nhận được đơn hàng của mình chưa? Hành động này không thể hoàn tác.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setOpenDialog({ type: '', orderId: null })}
					>
						Hủy bỏ
					</Button>
					<Button
						onClick={() =>
							openDialog.orderId &&
							handleConfirmReceived(openDialog.orderId)
						}
						variant="contained"
						color="success"
					>
						Có, tôi đã nhận được
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openDialog.type === 'confirm-payment'}
				onClose={handleClosePaymentDialog}
			>
				<DialogTitle>Xác nhận điều hướng thanh toán</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Bạn có muốn chuyển đến trang thanh toán ngay bây giờ không?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClosePaymentDialog}>Để sau</Button>
					<Button
						onClick={handleConfirmPayment}
						variant="contained"
						color="primary"
					>
						Thanh toán ngay
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openDialog.type === 'cancel-success'}
				onClose={() => setOpenDialog({ type: '', orderId: null })}
			>
				<DialogTitle>
					<div className="flex items-center gap-2">
						<CheckCircle className="h-6 w-6 text-green-500" />
						Hủy đơn hàng thành công
					</div>
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Đơn hàng của bạn đã được hủy. Đội ngũ chăm sóc khách hàng của chúng tôi sẽ liên hệ với bạn sớm để xác nhận việc hủy đơn hàng.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setOpenDialog({ type: '', orderId: null })}
						variant="contained"
						color="primary"
					>
						Đã hiểu
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
