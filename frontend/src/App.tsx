import { Route, Routes } from 'react-router-dom';
import Layout from './components/client/layout';
import Homepage from './pages/Client/Home';
import SignIn from './pages/Client/SignIn';
import SignUp from './pages/Client/SignUp';
import ProductList from './pages/Client/ProductList';
import ProductDetail from './pages/Client/ProductDetail';
import { ScrollToTop } from './utils';
import Account from './pages/Client/User/Account';
import Profile from './pages/Client/User/Profile';
function App() {
	return (
		<>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
					<Route path="/products" element={<ProductList />} />
					<Route path="/products/:id" element={<ProductDetail />} />
					<Route path="/account" element={<Account />}>
						<Route index element={<Profile />} />
					</Route>
				</Route>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
			</Routes>
		</>
	);
}

export default App;
