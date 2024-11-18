import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Cookies from 'js-cookie';

interface PrivateRouteProps {
	children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
	const accessToken = Cookies.get('access_token');

	if (!accessToken) {
		return <Navigate to="/signin" />;
	}

	return <>{children}</>;
};

export default PrivateRoute;
