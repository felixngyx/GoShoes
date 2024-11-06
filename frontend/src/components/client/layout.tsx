import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const layout = () => {
	return (
		<>
			<Navbar />
			<div className="min-h-[calc(100vh-100px)] mt-10">
				<Outlet />
			</div>
			<Footer />
		</>
	);
};

export default layout;
