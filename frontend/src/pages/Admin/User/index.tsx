import { useEffect, useState } from 'react';
import { FaRegEye, FaSort } from 'react-icons/fa';
import userService from '../../../services/admin/user';
import { User as UserType } from '../../../services/admin/user';
import { Eye, RotateCcw, TrashIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { X } from 'lucide-react';
import Pagination from '../../../components/admin/Pagination';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const User = () => {
	const [users, setUsers] = useState<UserType[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [previewUser, setPreviewUser] = useState<UserType | null>(null);
	const [loadingUpdate, setLoadingUpdate] = useState(false);
	const { role } = useSelector((state: RootState) => state.client.user);

	const fetchUsers = async () => {
		try {
			const response = await userService.getAll(currentPage, 10);
			console.log('Users----------', response.data.data);
			setUsers(response.data.data);
			setTotalPages(response.data.total_pages);
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	useEffect(() => {
		setLoading(true);
		fetchUsers();
		setLoading(false);
	}, [currentPage]);

	const handleRoleChange = async (
		e: React.ChangeEvent<HTMLSelectElement>,
		id: number
	) => {
		toast.loading('Updating role...');
		setLoadingUpdate(true);
		const role = e.target.value;
		await userService.update(id, { role: role as 'user' | 'admin' });
		fetchUsers();
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

	const updateStatus = async (id: number, status: boolean) => {
		if (!status) {
			if (confirm('Are you sure you want to restore this user?')) {
				try {
					setLoading(true);
					await userService.update(id, {
						is_deleted: status,
					});
					fetchUsers();
					toast.success('Restore user success');
				} catch (error) {
					console.error('Error restoring user:', error);
				} finally {
					setLoading(false);
				}
			}
		} else {
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
							users.map((user) => (
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
											{role === 'super-admin' &&
												(user.is_deleted ? (
													<RotateCcw
														size={20}
														className="cursor-pointer"
														color="#40bfff"
														onClick={() =>
															updateStatus(user.id!, false)
														}
													/>
												) : (
													<TrashIcon
														size={20}
														className="cursor-pointer"
														color="red"
														onClick={() =>
															updateStatus(user.id!, true)
														}
													/>
												))}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
			/>
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
