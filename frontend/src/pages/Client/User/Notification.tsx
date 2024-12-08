'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import axiosClient from '../../../apis/axiosClient';

interface Notification {
	id: number;
	avatar: string;
	message: string;
	timestamp: string;
	isNew?: boolean;
	type?:
		| 'feature'
		| 'collaboration'
		| 'opportunity'
		| 'notificationUserTracking';
	order_id?: number;
}

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await axiosClient.get(
					'notifications/user-tracking'
				);
				const data = response.data.map((notification: any) => ({
					id: notification.id,
					message: notification.message,
					timestamp: new Date(notification.created_at).toLocaleString(),
					isNew: !notification.is_read,
					type: notification.type,
					order_id: notification.order_id,
				}));
				setNotifications(data);
			} catch (error) {
				console.error('Error fetching notifications:', error);
			}
		};

		fetchNotifications();
	}, []);

	const handleMarkAsRead = async (id: number) => {
		try {
			await axiosClient.post(`notifications/${id}/read`);
			setNotifications(
				notifications.filter((notification) => notification.id !== id)
			);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		console.log(notification);
		if (notification.type === 'notificationUserTracking') {
			if (notification.order_id) {
				window.location.href = `/account/my-order/${notification.order_id}`;
			} else {
				console.error(
					'order_id is undefined for notification:',
					notification
				);
			}
		}
		// Có thể thêm các hành động khác nếu cần
	};

	return (
		<div className="notifications-page col-span-9 space-y-8">
			<div className="notifications p-4 bg-gray-100 rounded-lg">
				<h2 className="font-semibold text-lg">Notifications</h2>
				{notifications.length > 0 ? (
					notifications.map((notification) => (
						<div
							key={notification.id}
							className="notification-item p-2 border-b flex justify-between items-center"
							onClick={() => handleNotificationClick(notification)}
						>
							<div>
								<p>{notification.message}</p>
								<span className="text-xs text-gray-500">
									{notification.timestamp}
								</span>
							</div>
							{notification.isNew ? (
								<button
									onClick={() => handleMarkAsRead(notification.id)}
									className="text-green-500"
								>
									<CheckCircle size={20} />
								</button>
							) : null}
						</div>
					))
				) : (
					<p className="text-gray-500">There are no notifications.</p>
				)}
			</div>
		</div>
	);
}
