import Breadcrumb from '../../../components/client/Breadcrumb';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
const Account = () => {
	return (
		<>
			<Breadcrumb
				items={[
					{ name: 'Home', link: '' },
					{ name: 'Account', link: 'account' },
				]}
			/>
			<div className="container max-w-7xl mx-auto grid grid-cols-12 gap-10 my-10">
				<Sidebar />
				<Outlet />
			</div>
		</>
	);
};

export default Account;
