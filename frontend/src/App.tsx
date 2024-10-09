import { Route, Routes } from 'react-router-dom';
import Layout from './components/client/layout';
import Homepage from './pages/Client/Home/Homepage';
function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Homepage />} />
				</Route>
			</Routes>
		</>
	);
}

export default App;
