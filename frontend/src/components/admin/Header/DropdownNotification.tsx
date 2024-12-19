import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import axios from 'axios';
import Cookies from 'js-cookie';
import Pusher from 'pusher-js';
import { PUSHER_CONFIG } from '../../../common/pusher';
import axiosClient from '../../../apis/axiosClient';
import { toast } from 'react-toastify';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Maximize2, X } from 'lucide-react';

interface Notification {
	id: number;
	user_id: number;
	order_id?: number;
	title: string;
	message: string;
	is_read: boolean;
	type: string;
	created_at: string;
	order?: {
		id: number;
		sku: string;
	};
}

interface PusherData {
	order_id: string;
	message: string;
}

const DropdownNotification = () => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [notifying, setNotifying] = useState(true);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchNotifications = async () => {
		try {
			const response = await axiosClient.get('/notifications');
			if (response.data.success && response.data.data) {
				setNotifications(response.data.data.data); // data đầu tiên là wrapper, data thứ hai là từ paginate
			}
		} catch (error) {
			console.error('Lỗi khi tải thông báo:', error);
		}
	};

	const fetchUnreadCount = async () => {
		try {
			const response = await axiosClient.get(`/notifications/unread-count`);
			setUnreadCount(response.data.count);
		} catch (error) {
			console.error('Lỗi khi tải số thông báo chưa đọc:', error);
		}
	};

	const markAsRead = async (id: number) => {
		try {
			await axios.post(
				`${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
				{},
				{
					headers: {
						Authorization: `Bearer ${Cookies.get('access_token')}`,
					},
				}
			);
			fetchUnreadCount();
			fetchNotifications();
		} catch (error) {
			console.error('Lỗi khi đánh dấu đã đọc:', error);
		}
	};

	useEffect(() => {
		// Fetch initial data
		fetchNotifications();
		fetchUnreadCount();

		// Setup Pusher
		const pusher = new Pusher(PUSHER_CONFIG.key, {
			cluster: PUSHER_CONFIG.cluster,
		});

		const channel = pusher.subscribe(PUSHER_CONFIG.channels.admin);

		channel.bind(PUSHER_CONFIG.events.newOrder, (data: PusherData) => {
			// Khi có đơn hàng mới, cập nhật lại notifications và unread count
			fetchNotifications();
			fetchUnreadCount();

			// Thêm toast notification
			toast.info('🔔 New order received!', {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});

			// Tùy chọn: Thêm hiệu ứng nhấp nháy hoặc highlight cho icon chuông
			setNotifying(true);
			setTimeout(() => setNotifying(false), 3000);
		});

		// Thêm xử lý cho các loại thông báo khác nếu cần
		channel.bind('notification', (data: any) => {
			fetchNotifications();
			fetchUnreadCount();

			// Hiển thị toast dựa vào loại thông báo
			toast.info(`🔔 ${data.title || 'New notification'}`, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});

			setNotifying(true);
			setTimeout(() => setNotifying(false), 3000);
		});

		// Polling interval for backup
		const interval = setInterval(() => {
			fetchNotifications();
			fetchUnreadCount();
		}, 30000);

		return () => {
			// Cleanup
			channel.unbind(PUSHER_CONFIG.events.newOrder);
			channel.unbind('notification');
			pusher.unsubscribe(PUSHER_CONFIG.channels.admin);
			pusher.disconnect();
			clearInterval(interval);
		};
	}, []);

	return (
		<ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
			<li>
				<Link
					onClick={() => {
						setNotifying(false);
						setDropdownOpen(!dropdownOpen);
					}}
					to="#"
					className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white ${
						notifying ? 'animate-pulse' : ''
					}`}
				>
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-meta-1 text-[10px] text-white">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}

					<svg
						className="fill-current duration-300 ease-in-out"
						width="18"
						height="18"
						viewBox="0 0 18 18"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343Z"
							fill=""
						/>
					</svg>
				</Link>

				{dropdownOpen && (
					<div className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
						<div className="px-4.5 py-3 flex justify-between items-center">
							<h5 className="text-sm font-medium text-bodydark2">
								Thông báo {unreadCount > 0 && `(${unreadCount})`}
							</h5>
							<button 
								onClick={() => {
									setIsModalOpen(true);
									setDropdownOpen(false);
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<Maximize2 className="h-4 w-4" />
							</button>
						</div>

						<ul className="flex h-auto flex-col overflow-y-auto">
							{notifications.length > 0 ? (
								notifications.map((notification) => (
									<li key={notification.id}>
										<Link
											className={`flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
												!notification.is_read
													? 'bg-blue-50 dark:bg-blue-900/20'
													: ''
											}`}
											to={
												notification.type === 'order'
													? `orders/detail/${notification.order_id}`
													: '#'
											}
											onClick={() => markAsRead(notification.id)}
										>
											<p className="text-sm">
												<span className="text-black dark:text-white">
													{notification.title}
												</span>{' '}
												{notification.message}
												{notification.order &&
													` (Order ID: ${notification.order.sku})`}
											</p>
											<p className="text-xs">
												{new Date(
													notification.created_at
												).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										</Link>
									</li>
								))
							) : (
								<li className="px-4.5 py-3 text-sm text-gray-500 text-center">
									No notifications
								</li>
							)}
						</ul>
					</div>
				)}

				<Dialog 
					open={isModalOpen} 
					onClose={() => setIsModalOpen(false)}
					maxWidth="md"
					fullWidth
					PaperProps={{
						className: "bg-white dark:bg-boxdark"
					}}
				>
					<DialogTitle className="flex justify-between items-center border-b border-stroke dark:border-strokedark pb-3">
						<h5 className="text-lg font-medium text-black dark:text-white">
							Notifications {unreadCount > 0 && `(${unreadCount})`}
						</h5>
						<button 
							onClick={() => setIsModalOpen(false)}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<X className="w-5 h-5" />
						</button>
					</DialogTitle>
					<DialogContent className="mt-4 dark:bg-boxdark">
						<div className="max-h-[70vh] overflow-y-auto">
							{notifications.length > 0 ? (
								notifications.map((notification) => (
									<div
										key={notification.id}
										className={`flex flex-col gap-2.5 border-b border-stroke dark:border-strokedark px-6 py-4 
											hover:bg-gray-2 dark:hover:bg-meta-4 cursor-pointer
											${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
										onClick={() => {
											if (notification.type === 'order' && notification.order_id) {
												// Đóng modal trước khi chuyển trang
												setIsModalOpen(false);
												// Đánh dấu là đã đọc
												markAsRead(notification.id);
												// Chuyển đến trang chi tiết đơn hàng
												window.location.href = `/admin/orders/detail/${notification.order_id}`;
											}
										}}
									>
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium text-black dark:text-white">
												{notification.title}
											</p>
											{!notification.is_read && (
												<button
													onClick={(e) => {
														e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
														markAsRead(notification.id);
													}}
													className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
												>
													Đánh dấu là đã đọc
												</button>
											)}
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-300">
											{notification.message}
										</p>
										{notification.order && (
											<p className="text-xs text-gray-500 dark:text-gray-400">
												Order ID: {notification.order.sku}
											</p>
										)}
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{new Date(notification.created_at).toLocaleDateString('en-US', {
												year: 'numeric',
													month: 'long',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
											})}
										</p>
										{notification.type === 'order' && notification.order_id && (
											<div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
												Bấm để xem chi tiết đơn hàng →
											</div>
										)}
									</div>
								))
							) : (
								<div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
									Không có thông báo nào
								</div>
							)}
						</div>
					</DialogContent>
				</Dialog>
			</li>
		</ClickOutside>
	);
};

export default DropdownNotification;
