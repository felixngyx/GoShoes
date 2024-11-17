import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Cookies from 'js-cookie';
interface AdminRouteProps {
	children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
	const { is_admin } = useSelector((state: RootState) => state.client.user);
	const accessToken = Cookies.get('access_token');

	if (!is_admin || !accessToken) {
		return <Navigate to="/admin/signin" />;
	}

	return <>{children}</>;
};

export default AdminRoute;
