import Breadcrumb from '../../components/admin/Breadcrumbs/Breadcrumb';
import TableOne from '../../components/admin/Tables/TableOne';
import TableThree from '../../components/admin/Tables/TableThree';
import TableTwo from '../../components/admin/Tables/TableTwo';

const Tables = () => {
	return (
		<>
			<Breadcrumb pageName="Tables" />

			<div className="flex flex-col gap-10">
				<TableOne />
				<TableTwo />
				<TableThree />
			</div>
		</>
	);
};

export default Tables;
