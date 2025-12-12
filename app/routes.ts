import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/home.layout.tsx", [
		index("routes/home.tsx"),
		// React Examples
		route("/examples/area-chart", "routes/examples/area-chart.tsx"),
		route("/examples/area-chart-single", "routes/examples/area-chart-single.tsx"),
		route("/examples/area-chart-tooltip", "routes/examples/area-chart-tooltip.tsx"),
		route("/examples/area-or-line-chart", "routes/examples/area-or-line-chart.tsx"),
		route("/examples/bar-chart", "routes/examples/bar-chart.tsx"),
		route("/examples/line-chart", "routes/examples/line-chart.tsx"),
		route("/examples/pie-chart", "routes/examples/pie-chart.tsx"),
		route("/examples/radar-chart", "routes/examples/radar-chart.tsx"),
		// HTML Demos
		route("/html-demo/area", "routes/html-demo/area.tsx"),
		route("/html-demo/bar", "routes/html-demo/bar.tsx"),
		route("/html-demo/bar2", "routes/html-demo/bar2.tsx"),
		route("/html-demo/bar3", "routes/html-demo/bar3.tsx"),
		route("/html-demo/bar4", "routes/html-demo/bar4.tsx"),
		route("/html-demo/bar5", "routes/html-demo/bar5.tsx"),
		route("/html-demo/line-multi", "routes/html-demo/line-multi.tsx"),
		route("/html-demo/radar", "routes/html-demo/radar.tsx"),
		route("/html-demo/radar2", "routes/html-demo/radar2.tsx"),
		route("/html-demo/radar3", "routes/html-demo/radar3.tsx"),
		route("/html-demo/radar4", "routes/html-demo/radar4.tsx"),
		route("/html-demo/svg-filter", "routes/html-demo/svg-filter.tsx"),
	]),
] satisfies RouteConfig;
