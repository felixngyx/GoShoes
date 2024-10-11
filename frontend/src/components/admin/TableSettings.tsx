import { BsFillTrashFill, BsFillPencilFill } from 'react-icons/bs';
import dataJSON from '../../../public/data.json';

export const Table = ({
	rows,
	deleteRow,
	editRow,
}: {
	rows: any;
	deleteRow: any;
	editRow: any;
}) => {
	const fields = Object.keys(Object.values(dataJSON)[0]).filter(
		(item: any) => !item.startsWith('delta_')
	);

	return (
		<div className="max-w-full overflow-x-auto table-wrapper">
			<table className="table">
				<thead>
					<tr className="bg-gray-2 text-left dark:bg-meta-4">
						{fields.map((field, index) => (
							<th
								key={index}
								className="py-4 px-4 font-medium text-black dark:text-white"
							>
								{field}
							</th>
						))}
						<th className="py-4 px-4 font-medium text-black dark:text-white">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row: any, idx: number) => {
						return (
							<tr key={idx} className="content-center">
								{fields.map((field, index) => (
									<td
										key={index}
										className="border-b border-[#eee] py-5 px-4 dark:border-strokedark"
									>
										{row[field]}
									</td>
								))}
								<td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
									<span className="actions flex grid-cols-2 gap-4">
										<BsFillTrashFill
											className="delete-btn cursor-pointer"
											onClick={() => deleteRow(idx)}
										/>

										<BsFillPencilFill
											className="edit-btn cursor-pointer"
											onClick={() => editRow(idx)}
										/>
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
