import {
	Cartesian3,
	EasingFunction,
	EllipsoidTerrainProvider,
	EventHelper,
	UrlTemplateImageryProvider,
	Viewer,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import CesiumNavigation, {
	type NavigationOptions,
} from "cesium-navigation-es6";
import proj4 from "proj4";
import './projDefs'

/**
 * 加载SNP
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

	// viewer.scene.globe.depthTestAgainstTerrain = true; // 启用深度检测

	// 转换坐标
	const convertedCoords = proj4("EPSG:4547", "EPSG:4326", [-219284.60702296568, 3295137.2366858963]);
	console.log(convertedCoords);
	const helper = new EventHelper();
	helper.add(viewer.scene.globe.tileLoadProgressEvent, (queuedTileCount: number) => {
		if (queuedTileCount === 0) {
			// 所有瓦片加载完成
			viewer.camera.flyTo({
				destination: Cartesian3.fromDegrees(
					convertedCoords[0],
					convertedCoords[1],
					10000
				),
				duration: 2,
			});
			helper.removeAll(); // 清理监听器
		}
	});

	const options = {
		enableCompass: true,
		enableZoomControls: true,
	} satisfies NavigationOptions;
	new CesiumNavigation(viewer, options);

	return viewer;
}
