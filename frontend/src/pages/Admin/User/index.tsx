import { useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import userService from '../../../services/admin/user';
import { User as UserType } from '../../../services/admin/user';
import { Link } from 'react-router-dom';
import { TrashIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';

const User = () => {
	const [users, setUsers] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(0);

	const fetchUsers = async () => {
		try {
			const response = await userService.getAll();
			const user = Array.isArray(response)
				? response
				: (Object.values(response) as UserType[]);
			setUsers(user);
			setTotalPages(Math.ceil(user.length / itemsPerPage));
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const getCurrentUsers = () => {
		const indexOfLastItem = currentPage * itemsPerPage;
		const indexOfFirstItem = indexOfLastItem - itemsPerPage;
		return users.slice(indexOfFirstItem, indexOfLastItem);
	};

	useEffect(() => {
		setLoading(true);
		fetchUsers();
		setLoading(false);
	}, []);

	const handleDelete = async (id: number) => {
		if (confirm('Are you sure you want to delete this user?')) {
			try {
				setLoading(true);
				await userService.delete(id);
				fetchUsers();
				toast.success('Delete user success');
			} catch (error) {
				console.error('Error deleting user:', error);
			} finally {
				setLoading(false);
			}
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
								Is verified
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Admin
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">Status</div>
							</th>
							<th scope="col" className="px-6 py-3">
								Created At
							</th>
							<th scope="col" className="px-6 py-3">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={5} className="text-center py-4">
									<LoadingIcon
										type="spinner"
										color="primary"
										size="md"
									/>
								</td>
							</tr>
						) : (
							getCurrentUsers().map((user) => (
								<tr
									key={user.id}
									className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
								>
									<td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
										<img
											src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
											alt=""
											className="w-10 h-10 rounded-full"
										/>
										{user.name}
									</td>
									<td className="px-6 py-4">{user.email}</td>
									<td className="px-6 py-4">{user.phone}</td>
									<td className="px-6 py-4">
										<span className="badge badge-success">
											Verified
										</span>
									</td>
									<td className="px-6 py-4">
										{user.role === 'admin' ? 'Admin' : 'User'}
									</td>
									<td className="px-6 py-4">
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												user.is_deleted
													? 'bg-danger/10 text-danger'
													: 'bg-success/10 text-success'
											}`}
										>
											{user.is_deleted ? 'Inactive' : 'Active'}
										</span>
									</td>
									<td className="px-6 py-4">
										{user.created_at
											? new Date(
													user.created_at
											  ).toLocaleDateString()
											: ''}
									</td>
									<td className="px-6 py-4">
										{user.role !== 'super-admin' && (
											<TrashIcon
												color="red"
												className="w-5 h-5 cursor-pointer"
												onClick={() => handleDelete(user.id!)}
											/>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<div className="join ms-auto">
				<button
					className={`join-item btn btn-sm ${
						currentPage === 1 ? 'btn-disabled' : ''
					}`}
					onClick={() => setCurrentPage(1)}
				>
					«
				</button>
				<button
					className={`join-item btn btn-sm ${
						currentPage === 1 ? 'btn-disabled' : ''
					}`}
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
				>
					‹
				</button>
				{[...Array(totalPages)].map((_, index) => (
					<button
						key={index + 1}
						className={`join-item btn btn-sm ${
							currentPage === index + 1 ? 'btn-active' : ''
						}`}
						onClick={() => setCurrentPage(index + 1)}
					>
						{index + 1}
					</button>
				))}
				<button
					className={`join-item btn btn-sm ${
						currentPage === totalPages ? 'btn-disabled' : ''
					}`}
					onClick={() =>
						setCurrentPage((prev) => Math.min(prev + 1, totalPages))
					}
				>
					›
				</button>
				<button
					className={`join-item btn btn-sm ${
						currentPage === totalPages ? 'btn-disabled' : ''
					}`}
					onClick={() => setCurrentPage(totalPages)}
				>
					»
				</button>
			</div>
		</div>
	);
};

export default User;
