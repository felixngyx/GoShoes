import { useEffect, useState } from 'react';
import { FaRegEye, FaSort } from 'react-icons/fa';
import userService from '../../../services/admin/user';
import { User as UserType } from '../../../services/admin/user';
import { Link } from 'react-router-dom';
import { Eye, TrashIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { X } from 'lucide-react';

const User = () => {
	const [users, setUsers] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(0);
	const [previewUser, setPreviewUser] = useState<UserType | null>(null);
	const [loadingUpdate, setLoadingUpdate] = useState(false);

	const fetchUsers = async () => {
		try {
			const response = await userService.getAll();
			let user = Array.isArray(response)
				? response
				: (Object.values(response) as UserType[]);

			user.sort((a, b) => {
				if (a.role === 'super-admin') return -1;
				if (b.role === 'super-admin') return 1;
				if (a.role === 'admin') return -1;
				if (b.role === 'admin') return 1;
				return 0;
			});
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

	const handleRoleChange = async (
		e: React.ChangeEvent<HTMLSelectElement>,
		id: number
	) => {
		toast.loading('Updating role...');
		setLoadingUpdate(true);
		const role = e.target.value;
		await userService.update(id, { admin: role });
		setLoadingUpdate(false);
		toast.dismiss();
		toast.success('Update role success');
	};

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

	const openUserDetailModal = (user: UserType) => {
		setPreviewUser(user);
	};

	const closeUserDetailModal = () => {
		setPreviewUser(null);
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
							{/* <th scope="col" className="px-6 py-3">
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
							</th> */}
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
									{/* <td className="px-6 py-4">{user.email}</td>
									<td className="px-6 py-4">{user.phone}</td> */}
									<td className="px-6 py-4">
										{new Date(
											user.email_verified_at
										).toLocaleDateString()}
									</td>
									<td className="px-6 py-4">
										<select
											defaultValue={user.role}
											className={`select select-bordered select-xs text-xs font-bold ${
												user.role === 'super-admin'
													? 'select-disabled text-info'
													: ''
											}`}
											disabled={loadingUpdate}
											onChange={(e) => handleRoleChange(e, user.id!)}
										>
											{user.role === 'super-admin' && (
												<option value="super-admin" disabled>
													Super Admin
												</option>
											)}
											{user.role !== 'super-admin' && (
												<>
													<option value="admin">Admin</option>
													<option value="user">User</option>
												</>
											)}
										</select>
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
											<div className="flex items-center gap-2">
												<button
													className="btn btn-sm btn-ghost p-2 rounded-md hover:bg-gray-100"
													onClick={() => openUserDetailModal(user)}
												>
													<FaRegEye
														size={18}
														className="cursor-pointer"
														color="primary"
													/>
												</button>
												<TrashIcon
													color="red"
													className="w-5 h-5 cursor-pointer"
													onClick={() => handleDelete(user.id!)}
												/>
											</div>
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
			{previewUser && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/2">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">User Details</h2>
							<button
								onClick={closeUserDetailModal}
								className="btn btn-sm btn-ghost"
							>
								<X size={20} />
							</button>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-4 border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<img
										src={`https://ui-avatars.com/api/?name=${previewUser.name}&background=random`}
										alt=""
										className="w-20 h-20 rounded-full"
									/>
									<div>
										<h3 className="font-semibold text-lg">
											{previewUser.name}
										</h3>
										<p className="text-sm text-gray-500">
											{previewUser.role}
										</p>
									</div>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Email:
									</p>
									<p className="font-medium">{previewUser.email}</p>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Phone:
									</p>
									<p className="font-medium">
										{previewUser.phone || 'N/A'}
									</p>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Gender:
									</p>
									<p className="font-medium capitalize">
										{previewUser.gender || 'N/A'}
									</p>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Birth Date:
									</p>
									<p className="font-medium">
										{previewUser.birth_date
											? new Date(
													previewUser.birth_date
											  ).toLocaleDateString()
											: 'N/A'}
									</p>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Status:
									</p>
									<span
										className={`px-2 py-1 rounded-full text-xs ${
											previewUser.is_deleted
												? 'bg-danger/10 text-danger'
												: 'bg-success/10 text-success'
										}`}
									>
										{previewUser.is_deleted ? 'Inactive' : 'Active'}
									</span>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Email Verified:
									</p>
									<p className="font-medium">
										{previewUser.email_verified_at
											? new Date(
													previewUser.email_verified_at
											  ).toLocaleDateString()
											: 'Not verified'}
									</p>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Created At:
									</p>
									<p className="font-medium">
										{previewUser.created_at
											? new Date(
													previewUser.created_at
											  ).toLocaleDateString()
											: 'N/A'}
									</p>
								</div>

								<div className="border border-gray-200 p-2 rounded-md bg-gray-50 shadow-sm">
									<p className="text-sm text-gray-600 font-semibold">
										Bio:
									</p>
									<p className="font-medium">
										{previewUser.bio || 'N/A'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default User;
