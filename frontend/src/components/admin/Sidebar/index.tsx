import { FaUser } from 'react-icons/fa';
import { Box, Boxes, ContactRound, Home, Image, Newspaper, TicketPercent } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../../images/logo/logo.svg';
import { BsCart2 } from 'react-icons/bs';
interface SidebarProps {
	sidebarOpen: boolean;
	setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
	const location = useLocation();
	const { pathname } = location;

	const trigger = useRef<any>(null);
	const sidebar = useRef<any>(null);

	// const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
	// const [sidebarExpanded, setSidebarExpanded] = useState(
	// 	storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	// );

	// close on click outside
	useEffect(() => {
		const clickHandler = ({ target }: MouseEvent) => {
			if (!sidebar.current || !trigger.current) return;
			if (
				!sidebarOpen ||
				sidebar.current.contains(target) ||
				trigger.current.contains(target)
			)
				return;
			setSidebarOpen(false);
		};
		document.addEventListener('click', clickHandler);
		return () => document.removeEventListener('click', clickHandler);
	});

	// close if the esc key is pressed
	useEffect(() => {
		const keyHandler = ({ keyCode }: KeyboardEvent) => {
			if (!sidebarOpen || keyCode !== 27) return;
			setSidebarOpen(false);
		};
		document.addEventListener('keydown', keyHandler);
		return () => document.removeEventListener('keydown', keyHandler);
	});

	// useEffect(() => {
	// 	localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
	// 	if (sidebarExpanded) {
	// 		document.querySelector('body')?.classList.add('sidebar-expanded');
	// 	} else {
	// 		document.querySelector('body')?.classList.remove('sidebar-expanded');
	// 	}
	// }, [sidebarExpanded]);

	const [ordersOpen, setOrdersOpen] = useState(false);

	return (
		<aside
			ref={sidebar}
			className={`absolute left-0 top-0 z-100 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
		>
			<div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
				<NavLink to="/admin">
					<img src={Logo} alt="Logo" />
				</NavLink>

				<button
					ref={trigger}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					aria-controls="sidebar"
					aria-expanded={sidebarOpen}
					className="block lg:hidden"
				>
					<svg
						className="fill-current"
						width="20"
						height="18"
						viewBox="0 0 20 18"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
							fill=""
						/>
					</svg>
				</button>
			</div>

			<div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
				<nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
					<div>
						<h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
							MENU
						</h3>

						<ul className="mb-6 flex flex-col gap-1.5">
							<li>
								<NavLink
									to="/admin"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname === '/admin' ? 'bg-graydark dark:bg-meta-4' : ''
										}`}
								>
									<Home size={18} />
									Bảng điều khiển
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/admin/user"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('user') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<FaUser />
									Người dùng
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/product"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('product') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<Box size={18} />
									Sản phẩm
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/attribute"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('attribute') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<Boxes size={18} />
									Thuộc tính
								</NavLink>
							</li>

							<li>
								<div
									onClick={() => setOrdersOpen(!ordersOpen)}
									className="cursor-pointer group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
								>
									<BsCart2 size={18} />
									<span>Đơn hàng</span>
									<svg
										className={`ml-auto fill-current transition-transform duration-300 ${ordersOpen ? 'rotate-180' : ''
											}`}
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
											fill=""
										/>
									</svg>
								</div>
								<ul className={`${ordersOpen ? 'block' : 'hidden'} pl-6`}>
									<li>
										<NavLink
											to="/admin/orders"
											className="block py-2 px-4 text-bodydark2 hover:text-white"
										>
											Tất cả đơn hàng
										</NavLink>
									</li>
									<li>
										<NavLink
											to="/admin/orders/refund-request"
											className="block py-2 px-4 text-bodydark2 hover:text-white"
										>
											Yêu cầu hoàn tiền
										</NavLink>
									</li>
								</ul>
							</li>

							<li>
								<NavLink
									to="/admin/discounts"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('discounts') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<TicketPercent size={18} />
									Giảm giá
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/admin/post"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('post') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<Newspaper size={18} />
									Bài viết
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/admin/contact"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('contact') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<ContactRound size={18} />
									Liên hệ
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/admin/banner"
									className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('banner') &&
										'bg-graydark dark:bg-meta-4'
										}`}
								>
									<Image size={18} />
									Banner
								</NavLink>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</aside>
	);
};

export default Sidebar;
