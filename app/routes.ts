import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";
import menus from "./menus";

export default [
	layout("routes/home.layout.tsx", [
		index("routes/home.tsx"),
		...menus
			.flatMap((item) => item.items)
			.map((menu) => route(menu.href, `..${menu.folder}/index.tsx`)),
	]),
] satisfies RouteConfig;
