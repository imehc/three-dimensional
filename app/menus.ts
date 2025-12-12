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
	{
		category: "React Examples",
		items: [
			{
				name: "Area Chart",
				folder: "/examples",
				href: "/examples/area-chart",
			},
			{
				name: "Area Chart Single",
				folder: "/examples",
				href: "/examples/area-chart-single",
			},
			{
				name: "Area Chart Tooltip",
				folder: "/examples",
				href: "/examples/area-chart-tooltip",
			},
			{
				name: "Area or Line Chart",
				folder: "/examples",
				href: "/examples/area-or-line-chart",
			},
			{
				name: "Bar Chart",
				folder: "/examples",
				href: "/examples/bar-chart",
			},
			{
				name: "Line Chart",
				folder: "/examples",
				href: "/examples/line-chart",
			},
			{
				name: "Pie Chart",
				folder: "/examples",
				href: "/examples/pie-chart",
			},
			{
				name: "Radar Chart",
				folder: "/examples",
				href: "/examples/radar-chart",
			},
		],
	},
	{
		category: "HTML Demos",
		items: [
			{
				name: "Area Chart",
				folder: "/html-demo",
				href: "/html-demo/area",
			},
			{
				name: "Bar Chart",
				folder: "/html-demo",
				href: "/html-demo/bar",
			},
			{
				name: "Bar Chart 2",
				folder: "/html-demo",
				href: "/html-demo/bar2",
			},
			{
				name: "Bar Chart 3",
				folder: "/html-demo",
				href: "/html-demo/bar3",
			},
			{
				name: "Bar Chart 4",
				folder: "/html-demo",
				href: "/html-demo/bar4",
			},
			{
				name: "Bar Chart 5",
				folder: "/html-demo",
				href: "/html-demo/bar5",
			},
			{
				name: "Line Multi",
				folder: "/html-demo",
				href: "/html-demo/line-multi",
			},
			{
				name: "Radar Chart",
				folder: "/html-demo",
				href: "/html-demo/radar",
			},
			{
				name: "Radar Chart 2",
				folder: "/html-demo",
				href: "/html-demo/radar2",
			},
			{
				name: "Radar Chart 3",
				folder: "/html-demo",
				href: "/html-demo/radar3",
			},
			{
				name: "Radar Chart 4",
				folder: "/html-demo",
				href: "/html-demo/radar4",
			},
			{
				name: "SVG Filter",
				folder: "/html-demo",
				href: "/html-demo/svg-filter",
			},
		],
	},
];

export default menus
	.map((item) => ({
		...item,
		items: item.items
			// .filter((item) => !item.folder.startsWith("/v1/"))
			.filter((item) => !item.hidden),
	}))
	.filter((item) => item.items.length);
