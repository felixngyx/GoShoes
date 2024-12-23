import { useState } from 'react';
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';
import { Outlet } from 'react-router-dom';
import OrderNotifications from '../components/admin/OrderNotifications';
const DefaultLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="dark:bg-boxdark-2 dark:text-bodydark">
			{/* <!-- ===== Page Wrapper Start ===== --> */}

			{/* Order Notifications Component */}
			<OrderNotifications />
			<div className="flex h-screen overflow-hidden">
				{/* <!-- ===== Sidebar Start ===== --> */}
				<div className="z-50">
					<Sidebar
						sidebarOpen={sidebarOpen}
						setSidebarOpen={setSidebarOpen}
					/>
				</div>
				{/* <!-- ===== Sidebar End ===== --> */}

				{/* <!-- ===== Content Area Start ===== --> */}
				<div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
					{/* <!-- ===== Header Start ===== --> */}
					<Header
						sidebarOpen={sidebarOpen}
						setSidebarOpen={setSidebarOpen}
					/>
					{/* <!-- ===== Header End ===== --> */}

					{/* <!-- ===== Main Content Start ===== --> */}
					<main>
						<div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
							<Outlet />
						</div>
					</main>
					{/* <!-- ===== Main Content End ===== --> */}
				</div>
				{/* <!-- ===== Content Area End ===== --> */}
			</div>
			{/* <!-- ===== Page Wrapper End ===== --> */}
		</div>
	);
};

export default DefaultLayout;
