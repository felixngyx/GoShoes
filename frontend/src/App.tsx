import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/client/layout';
import SignIn from './pages/Client/SignIn';
import SignUp from './pages/Client/SignUp';
import ProductList from './pages/Client/ProductList';
import ProductDetail from './pages/Client/ProductDetail';
import Account from './pages/Client/User/Account';
import Profile from './pages/Client/User/Profile';
import DefaultLayout from './layout/DefaultLayout';
import PageTitle from './components/admin/PageTitle';
import ECommerce from './pages/Admin/Dashboard/ECommerce';
import Calendar from './pages/Admin/Calendar';
import FormElements from './pages/Admin/Form/FormElements';
import FormLayout from './pages/Admin/Form/FormLayout';
import Tables from './pages/Admin/Tables';
import Settings from './pages/Admin/Settings';
import Chart from './pages/Admin/Chart';
import Alerts from './pages/Admin/UiElements/Alerts';
import Buttons from './pages/Admin/UiElements/Buttons';
import { useEffect } from 'react';
import SignInAdmin from './pages/Admin/Authentication/SignIn';
import SignUpAdmin from './pages/Admin/Authentication/SignUp';
import ProfileAdmin from './pages/Admin/Profile';
import Order from './pages/Client/User/Order';
import NotfoundPage from './pages/Client/NotfoundPage';
import OrderDetail from './pages/Client/User/OrderDetail';
import Address from './pages/Client/User/Address/Address';
import User from './pages/Admin/User';
import ResetPassword from './pages/Client/ResetPassword';
import ForgetPassword from './pages/Client/ForgetPassword';
import Product from './pages/Admin/Product';
import { Toaster } from 'react-hot-toast';
import Attribute from './pages/Admin/Attribute';
import Homepage from './pages/Client/home';
import ContactUs from './pages/Client/ContactUs';
import ChatUI from './components/client/ChatUi';
import AddProduct from './pages/Admin/Product/AddProduct';

function App() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	const isAdminPage = pathname.startsWith('/admin');

	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
					<Route path="/products" element={<ProductList />} />
					<Route path="/products/:id" element={<ProductDetail />} />
					<Route path="/account" element={<Account />}>
						<Route index element={<Profile />} />
						<Route path="my-order" element={<Order />} />
						<Route path="my-order/:id" element={<OrderDetail />} />
						<Route path="my-address" element={<Address />} />
					</Route>
					<Route path="/contact-us" element={<ContactUs />}></Route>
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/forget-password" element={<ForgetPassword />} />
					<Route path="*" element={<NotfoundPage />} />
				</Route>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/admin" element={<DefaultLayout />}>
					<Route
						index
						element={
							<>
								<PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<ECommerce />
							</>
						}
					/>
					<Route path="user" element={<User />} />
					<Route path="product" element={<Product />} />
					<Route path="attribute" element={<Attribute />} />
					<Route path="create" element={<AddProduct />} />
					<Route
						path="calendar" // Changed from "/calendar" to "calendar"
						element={
							<>
								<PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Calendar />
							</>
						}
					/>
					<Route
						path="profile"
						element={
							<>
								<PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<ProfileAdmin />
							</>
						}
					/>
					<Route
						path="forms/form-elements"
						element={
							<>
								<PageTitle title="Form Elements | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<FormElements />
							</>
						}
					/>
					<Route
						path="forms/form-layout"
						element={
							<>
								<PageTitle title="Form Layout | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<FormLayout />
							</>
						}
					/>
					<Route
						path="tables"
						element={
							<>
								<PageTitle title="Tables | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Tables />
							</>
						}
					/>
					<Route
						path="settings"
						element={
							<>
								<PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Settings />
							</>
						}
					/>
					<Route
						path="chart"
						element={
							<>
								<PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Chart />
							</>
						}
					/>
					<Route
						path="ui/alerts"
						element={
							<>
								<PageTitle title="Alerts | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Alerts />
							</>
						}
					/>
					<Route
						path="ui/buttons"
						element={
							<>
								<PageTitle title="Buttons | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<Buttons />
							</>
						}
					/>
					<Route
						path="auth/signin"
						element={
							<>
								<PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<SignInAdmin />
							</>
						}
					/>
					<Route
						path="auth/signup"
						element={
							<>
								<PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
								<SignUpAdmin />
							</>
						}
					/>
				</Route>
			</Routes>
			<Toaster position="top-right" reverseOrder={false} />
			{!isAdminPage && <ChatUI />}
		</>
	);
}

export default App;
