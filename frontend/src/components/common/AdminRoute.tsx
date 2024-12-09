import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
interface AdminRouteProps {
	children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
	const user = useSelector((state: RootState) => state.client.user);
	const roles = ['super-admin', 'admin'];
	const navigate = useNavigate();

	useEffect(() => {
		if (!user.name) {
			navigate('/admin/signin');
			return;
		}
		if (!roles.includes(user.role)) {
			navigate('/');
			toast.error('You are not authorized to access this page');
			return;
		}
	}, []);

	return <>{children}</>;
};

export default AdminRoute;
