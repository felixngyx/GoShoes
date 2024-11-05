interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	maxVisibleButtons?: number;
}

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	maxVisibleButtons = 5,
}: PaginationProps) => {
	const renderPaginationButtons = () => {
		const buttons = [];

		// Always show first page
		buttons.push(
			<button
				key={1}
				onClick={() => onPageChange(1)}
				className={`join-item btn btn-sm ${
					currentPage === 1 ? 'btn-active' : ''
				}`}
			>
				1
			</button>
		);

		if (totalPages <= maxVisibleButtons) {
			// Show all pages if total is small
			for (let i = 2; i <= totalPages; i++) {
				buttons.push(
					<button
						key={i}
						onClick={() => onPageChange(i)}
						className={`join-item btn btn-sm ${
							currentPage === i ? 'btn-active' : ''
						}`}
					>
						{i}
					</button>
				);
			}
		} else {
			// Show dots and last few pages
			if (currentPage > 3) {
				buttons.push(
					<button
						key="dots1"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Show current page and neighbors
			for (
				let i = Math.max(2, currentPage - 1);
				i <= Math.min(currentPage + 1, totalPages - 1);
				i++
			) {
				buttons.push(
					<button
						key={i}
						onClick={() => onPageChange(i)}
						className={`join-item btn btn-sm ${
							currentPage === i ? 'btn-active' : ''
						}`}
					>
						{i}
					</button>
				);
			}

			if (currentPage < totalPages - 2) {
				buttons.push(
					<button
						key="dots2"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Always show last page
			buttons.push(
				<button
					key={totalPages}
					onClick={() => onPageChange(totalPages)}
					className={`join-item btn btn-sm ${
						currentPage === totalPages ? 'btn-active' : ''
					}`}
				>
					{totalPages}
				</button>
			);
		}

		return buttons;
	};

	return <div className="join ms-auto">{renderPaginationButtons()}</div>;
};

export default Pagination;
