import { Route, Routes } from 'react-router-dom';
import Layout from './components/client/layout';
import Homepage from './pages/Client/home/Homepage';
import SignIn from './pages/Client/SignIn/SignIn';
import SignUp from './pages/Client/SignUp/SignUp';
function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
				</Route>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />
			</Routes>
		</>
	);
}

export default App;
