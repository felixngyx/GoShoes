import { FaSort } from 'react-icons/fa';

const User = () => {
	const generateRandomUser = (index: number) => ({
		name: `User ${index + 1}`,
		email: `user${index + 1}@example.com`,
		phone: `08${Math.floor(Math.random() * 1000000000)}`,
		is_admin: Math.random() < 0.5,
		status:
			Math.random() < 0.5
				? 'active'
				: Math.random() < 0.5
				? 'verifing'
				: 'inactive',
		created_at: new Date().toLocaleDateString(),
		updated_at: new Date().toLocaleDateString(),
	});

	const userData = Array.from({ length: 5 }, (_, index) =>
		generateRandomUser(index)
	);

	const statusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'badge-success';
			case 'verifing':
				return 'badge-warning';
			case 'inactive':
				return 'badge-error';
			default:
				return '';
		}
	};

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<h4 className="text-xl font-semibold text-black dark:text-white">
				User List
			</h4>

			<div className="relative overflow-x-auto border border-stroke">
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="px-6 py-3">
								Name
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Email
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Phone
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Created At
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">Status</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{userData.map((user, key) => (
							<tr
								className={`bg-white dark:bg-slate-800 ${
									key !== userData.length - 1
										? 'border-b border-stroke'
										: ''
								}`}
								key={key}
							>
								<td className="px-6 py-3">
									<div className="flex items-center gap-2">
										<img
											src="https://avatar.iran.liara.run/public"
											alt=""
											className="w-10 h-10 rounded-full"
										/>
										{user.name}
									</div>
								</td>
								<td className="px-6 py-3">{user.email}</td>
								<td className="px-6 py-3">{user.phone}</td>
								<td className="px-6 py-3">{user.created_at}</td>
								<td className="px-6 py-3">
									<div
										className={`badge badge-sm text-white font-semibold ${statusColor(
											user.status
										)}`}
									>
										{user.status}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="join ms-auto">
				<button className="join-item btn btn-sm">1</button>
				<button className="join-item btn btn-sm">2</button>
				<button className="join-item btn btn-sm btn-disabled">...</button>
				<button className="join-item btn btn-sm">99</button>
				<button className="join-item btn btn-sm">100</button>
			</div>
		</div>
	);
};

export default User;
