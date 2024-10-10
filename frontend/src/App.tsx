import { Route, Routes } from 'react-router-dom';
import Layout from './components/client/layout';
import Homepage from './pages/Client/home';
import SignIn from './pages/Client/SignIn';
import SignUp from './pages/Client/SignUp';
import ProductList from './pages/ProductList';
function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
					<Route path="/products" element={<ProductList />} />
				</Route>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
			</Routes>
		</>
	);
}

export default App;
