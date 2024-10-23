import { Link } from 'react-router-dom';

interface BreadcrumbProps {
	name: string;
	link: string;
}

const Breadcrumb = ({ items }: { items: BreadcrumbProps[] }) => {
	return (
		<nav className="container w-full mx-auto my-10 flex justify-center bg-[#F6F7F8] py-4 items-center gap-4">
			{items.map((item, index) => (
				<div key={index}>
					<Link to={`/${item.link.toLowerCase()}`}>
						<p
							className={`text-sm font-normal ${
								index === items.length - 1
									? 'text-[#40BFFF]'
									: 'text-[#808080]'
							}`}
						>
							{item.name}
						</p>
					</Link>
					{index < items.length - 1 && <span> / </span>}
				</div>
			))}
		</nav>
	);
};

export default Breadcrumb;
