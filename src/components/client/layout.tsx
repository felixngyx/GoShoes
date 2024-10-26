import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const layout = () => {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
};

export default layout;
