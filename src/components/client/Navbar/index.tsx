import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { Link } from 'react-router-dom';

const useDebounce = (value: string, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

const Navbar = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	useEffect(() => {
		if (debouncedSearchTerm) {
			console.log(debouncedSearchTerm);
		}
	}, [debouncedSearchTerm]);

	return (
		<>
			<div className="drawer drawer-end sticky top-0 z-50">
				<input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content w-full">
					{/* Start Navbar */}
					<div className="shadow-md w-full">
						<div className="max-w-7xl mx-auto navbar bg-base-100 py-4">
							<div className="navbar-start">
								<Link to="/">
									<img
										src="/vector-logo/default-monochrome.svg"
										className="w-20"
										alt=""
									/>
								</Link>
							</div>

							<div className="navbar-center hidden lg:flex">
								<ul className="flex flex-row gap-8 font-semibold">
									<li>
										<Link to="/products">Man</Link>
									</li>
									<li>
										<Link to="/products">Women's</Link>
									</li>
									<li>
										<Link to="/products">Kids</Link>
									</li>
									<li>
										<Link to="/products">Sale</Link>
									</li>
									<li>
										<Link to="/products">New Arrivals</Link>
									</li>
									<li>
										<Link to="/products">Brands</Link>
									</li>
								</ul>
							</div>

							<div className="navbar-end flex flex-row gap-4">
								{/* Drawer */}
								<label htmlFor="my-drawer-4" className="drawer-button">
									<IoSearch size={24} />
								</label>

								<div className="relative">
									<div className="badge badge-error badge-xs absolute top-[-5px] right-[-5px] text-white font-semibold">
										0
									</div>
									<Link
										to="/cart"
										className="flex flex-row gap-2"
									>
										<MdOutlineShoppingCart size={24} />
									</Link>
								</div>

								<div className="dropdown dropdown-end w-fit">
									<div tabIndex={0} role="button" className="">
										<FaUser size={24} />
									</div>
									<ul
										tabIndex={0}
										className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow font-semibold"
									>
										<li>
											<Link
												to="/signin"
												className="flex flex-row gap-2"
											>
												Sign in
											</Link>
										</li>
										<li>
											<Link
												to="/signup"
												className="flex flex-row gap-2"
											>
												Sign up
											</Link>
										</li>
										<li>
											<Link
												to="/account"
												className="flex flex-row gap-2"
											>
												Account
											</Link>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					{/* End Navbar */}
				</div>
				<div className="drawer-side z-10">
					<label
						htmlFor="my-drawer-4"
						aria-label="close sidebar"
						className="drawer-overlay"
					></label>
					<div className="container h-screen w-[35%] bg-white p-6 overflow-y-scroll z-10">
						{/* Search input */}
						<div className="flex">
							<label className="input input-bordered input-sm rounded-full flex items-center gap-2 w-full">
								<input
									type="text"
									className="grow"
									placeholder="Search"
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<IoSearch size={24} />
							</label>
							<label
								htmlFor="my-drawer-4"
								aria-label="close sidebar"
								className="btn btn-ghost btn-sm rounded-full font-semibold"
							>
								Cancel
							</label>
						</div>

						{debouncedSearchTerm ? (
							<>
								<p className="text-lg font-semibold mt-4">
									Top suggestions
								</p>
								<ul className="flex flex-col mt-2 text-sm font-semibold">
									<li className="hover:bg-base-200 px-2 py-1 rounded-md">
										<a>Nike</a>
									</li>
									<li className="hover:bg-base-200 px-2 py-1 rounded-md">
										<a>Adidas</a>
									</li>
									<li className="hover:bg-base-200 px-2 py-1 rounded-md">
										<a>Puma</a>
									</li>
								</ul>
							</>
						) : (
							<>
								<p className="text-lg font-semibold mt-4">
									Popular search terms
								</p>
								{/* Popular search terms */}
								<div className="flex flex-row gap-2 mt-2 flex-wrap">
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Nike
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Adidas
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Puma
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Reebok
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										New Balance
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Under Armour
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Asics
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Vans
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Converse
									</button>
									<button className="btn btn-ghost btn-sm rounded-full bg-base-200">
										Saucony
									</button>
								</div>
							</>
						)}

						<div className="flex flex-col gap-2 mt-4">
							<div className="flex flex-row gap-2 items-center justify-between">
								<img src="/demo.png" alt="" className="size-40" />
								<div className="flex flex-col text-end">
									<p className="text-lg font-semibold">Nike Air Max</p>
									<p className="text-md text-gray-500">Men's Shoes</p>
									<p className="text-lg font-semibold">2.345.000₫</p>
								</div>
							</div>
							<div className="flex flex-row gap-2 items-center justify-between">
								<img src="/demo.png" alt="" className="size-40" />
								<div className="flex flex-col text-end">
									<p className="text-lg font-semibold">Nike Air Max</p>
									<p className="text-md text-gray-500">Men's Shoes</p>
									<p className="text-lg font-semibold">2.345.000₫</p>
								</div>
							</div>
							<div className="flex flex-row gap-2 items-center justify-between">
								<img src="/demo.png" alt="" className="size-40" />
								<div className="flex flex-col text-end">
									<p className="text-lg font-semibold">Nike Air Max</p>
									<p className="text-md text-gray-500">Men's Shoes</p>
									<p className="text-lg font-semibold">2.345.000₫</p>
								</div>
							</div>
							<div className="flex flex-row gap-2 items-center justify-between">
								<img src="/demo.png" alt="" className="size-40" />
								<div className="flex flex-col text-end">
									<p className="text-lg font-semibold">Nike Air Max</p>
									<p className="text-md text-gray-500">Men's Shoes</p>
									<p className="text-lg font-semibold">2.345.000₫</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
