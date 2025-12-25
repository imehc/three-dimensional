import {
	Color,
	EllipsoidTerrainProvider,
	GeoJsonDataSource,
	UrlTemplateImageryProvider,
	Viewer,
} from "cesium";
import CesiumNavigation, {
	type NavigationOptions,
} from "cesium-navigation-es6";
import shp from "shpjs";

/**
 * 加载SHP
 *
 * @param el - 用于承载 Cesium Viewer 的 HTML 元素
 * @returns 返回配置好的 Viewer 实例
 */

export function initViewer(el: HTMLElement) {
	const viewer = new Viewer(el, {
		baseLayerPicker: false, // 隐藏底图选择器
		animation: false, // 隐藏动画控件
		timeline: false, // 隐藏时间轴
		fullscreenButton: false, // 隐藏全屏按钮
		geocoder: false, // 隐藏地理编码搜索框
		homeButton: false, // 隐藏主页按钮
		infoBox: false, // 隐藏信息框
		sceneModePicker: false, // 隐藏场景模式选择器(2D/3D/Columbus)
		selectionIndicator: false, // 隐藏选择指示器
		navigationHelpButton: false, // 隐藏导航帮助按钮
	});
	viewer.scene.debugShowFramesPerSecond = true; // 显示帧率
	viewer.imageryLayers.remove(viewer.imageryLayers.get(0)); // 移除默认影像
	viewer.scene.terrainProvider = new EllipsoidTerrainProvider({}); //移除默认地形
	const xyz = new UrlTemplateImageryProvider({
		url: "//data.mars3d.cn/tile/img/{z}/{x}/{y}.jpg",
	});
	viewer.imageryLayers.addImageryProvider(xyz);

	viewer.scene.globe.depthTestAgainstTerrain = true; // 启用深度检测

	const options = {
		enableCompass: true,
		enableZoomControls: true,
	} satisfies NavigationOptions;
	new CesiumNavigation(viewer, options);

	return viewer;
}

export async function loadShpFile(viewer: Viewer) {
	try {
		// 使用完整URL - shpjs 需要完整的 URL
		const baseUrl = window.location.origin;
		const geojson = await shp(`${baseUrl}/cesium/05/shp2/唐家泊果园.shp`);
		const dataSource = await GeoJsonDataSource.load(geojson, {
			clampToGround: true, // 贴地显示
			fill: Color.YELLOW.withAlpha(0.6), // 填充颜色
		});
		viewer.dataSources.add(dataSource);

		viewer.flyTo(dataSource);
	} catch (error) {
		console.error("加载SHP失败:", error);
		throw error;
	}
}
