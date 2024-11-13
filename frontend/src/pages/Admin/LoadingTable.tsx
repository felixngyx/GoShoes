const LoadingTable = () => {
	return (
		<tr className="bg-white dark:bg-slate-800 h-20">
			<td colSpan={10} className="text-center">
				<span className="loading loading-spinner loading-lg"></span>
			</td>
		</tr>
	);
};

export default LoadingTable;
