type MenuItem = {
	name: string;
	folder: string;
	href: string;
	hidden?: boolean;
};
type Menu = {
	category: string;
	items: MenuItem[];
};

const menus: Menu[] = [
	
];

export default menus
	.map((item) => ({
		...item,
		items: item.items
			// .filter((item) => !item.folder.startsWith("/v1/"))
			.filter((item) => !item.hidden),
	}))
	.filter((item) => item.items.length);
