import { randomPoint } from "@turf/turf";
import {
	BillboardCollection,
	Cartesian3,
	Color,
	EllipsoidTerrainProvider,
	HeadingPitchRange,
	HeightReference,
	HorizontalOrigin,
	NearFarScalar,
	ScreenSpaceEventHandler,
	ScreenSpaceEventType,
	UrlTemplateImageryProvider,
	VerticalOrigin,
	Viewer,
} from "cesium";
import CesiumNavigation, {
	type NavigationOptions,
} from "cesium-navigation-es6";
import { GUI } from "dat.gui";
import { Popup, Tooltip } from "./popup";

/**
 * 点线面图标示例
 *
 * @param el - 用于承载 Cesium Viewer 的 HTML 元素
 * @returns 返回配置好的 Viewer 实例和 GUI
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
	// viewer.scene.globe.depthTestAgainstTerrain = true; // 启用深度检测
	viewer.scene.debugShowFramesPerSecond = true; // 显示帧率
	viewer.imageryLayers.remove(viewer.imageryLayers.get(0)); // 移除默认影像
	viewer.scene.terrainProvider = new EllipsoidTerrainProvider({}); //移除默认地形
	const xyz = new UrlTemplateImageryProvider({
		url: "//data.mars3d.cn/tile/img/{z}/{x}/{y}.jpg",
	});
	viewer.imageryLayers.addImageryProvider(xyz);
	// 加载火星地形
	// CesiumTerrainProvider.fromUrl("//data.mars3d.cn/terrain").then(
	// 	(terrainProvider) => {
	// 		viewer.terrainProvider = terrainProvider;
	// 	},
	// );

	// 取消默认的单击和双击事件，右上角弹窗很丑
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
		ScreenSpaceEventType.LEFT_CLICK,
	);
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
		ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
	);

	const options = {
		enableCompass: true,
		enableZoomControls: true,
	} satisfies NavigationOptions;
	new CesiumNavigation(viewer, options);

	// 创建 dat.gui 控制面板
	const gui = new GUI();
	gui.domElement.style.position = "fixed";
	gui.domElement.style.bottom = "50%";
	gui.domElement.style.transform = "translateY(-50%)";
	gui.domElement.style.left = "0";

	// 示例配置
	const controls = {
		示例类型: "点",
		图标数量: 1000,
	};

	function flyTo(viewer: Viewer) {
		viewer.flyTo(viewer.entities, {
			offset: new HeadingPitchRange(0, -Math.PI / 2, 50000), // 距离50000米，俯角45度
		});
	}

	// 可用的示例类型
	const exampleTypes = {
		点: () => {
			loadPoint(viewer);
			flyTo(viewer);
		},
		线: () => {
			loadPolyline(viewer);
			viewer.flyTo(viewer.entities); // 自动计算视图范围
		},
		面: () => {
			loadPolygon(viewer);
			viewer.flyTo(viewer.entities);
		},
		图标: () => {
			loadIcon(viewer);
			flyTo(viewer);
		},
		许多图标: () => {
			loadMultipleIcon(viewer, controls.图标数量);
			// 缩放到全球视图
			viewer.camera.flyHome(1);
		},
		弹窗: () => {
			loadPopup(viewer);
		},
		工具提示: () => {
			loadTooltip(viewer);
			viewer.flyTo(viewer.entities);
		},
	};

	// 添加示例类型切换控制
	gui
		.add(controls, "示例类型", Object.keys(exampleTypes))
		.name("示例类型")
		.onChange((value: keyof typeof exampleTypes) => {
			exampleTypes[value]();
		});

	// 添加图标数量控制（只在选择"许多图标"时生效）
	gui
		.add(controls, "图标数量", 1000, 100000, 1000)
		.name("图标数量")
		.onChange(() => {
			if (controls.示例类型 === "许多图标") {
				loadMultipleIcon(viewer, controls.图标数量);
			}
		});

	loadPoint(viewer);
	flyTo(viewer);

	return { viewer, gui };
}

function removeEntities(viewer: Viewer) {
	// 清除所有实体
	viewer.entities.removeAll();

	// 清除 BillboardCollection
	const primitives = viewer.scene.primitives;
	for (let i = primitives.length - 1; i >= 0; i--) {
		const primitive = primitives.get(i);
		if (primitive instanceof BillboardCollection) {
			primitives.remove(primitive);
		}
	}

	// 清除所有 CustomDataSource (Tooltip 使用)
	const dataSources = viewer.dataSources;
	for (let i = dataSources.length - 1; i >= 0; i--) {
		dataSources.remove(dataSources.get(i));
	}

	// 清除 Popup 添加的 DOM 元素
	const container = viewer.container;
	const popups = container.querySelectorAll('[id^="popup_"]');
	popups.forEach((popup) => {
		popup.remove();
	});
}

function loadPoint(viewer: Viewer) {
	removeEntities(viewer);
	viewer.entities.add({
		name: "点",
		position: Cartesian3.fromDegrees(-95.166493, 39.9060534, 2000),
		point: {
			pixelSize: 5,
			color: Color.RED,
			outlineColor: Color.WHITE,
			outlineWidth: 2,
		},
		label: {
			text: "点",
			font: "14pt monospace",
			outlineWidth: 2,
		},
	});
}

function loadPolyline(viewer: Viewer) {
	removeEntities(viewer);
	viewer.entities.add({
		name: "线",
		polyline: {
			positions: Cartesian3.fromDegreesArray([-77, 35, -80, 35, -90, 45]), // 或 [Cartesian3.fromDegrees,Cartesian3.fromDegrees]
			width: 3,
			material: Color.BLUE,
			clampToGround: false, //true未贴地画线,false则不贴地
		},
	});
}

function loadPolygon(viewer: Viewer) {
	removeEntities(viewer);
	viewer.entities.add({
		name: "最简单的贴地面",
		polygon: {
			hierarchy: Cartesian3.fromDegreesArray([
				-115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0, 35.0,
			]),
			material: Color.RED.withAlpha(0.5),
		},
		polyline: {
			positions: Cartesian3.fromDegreesArray([
				-115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0, 35.0,
				-115.0, 37.0,
			]),
			width: 3,
			material: Color.BLUE,
			clampToGround: true, //贴地画线
		},
	});

	viewer.entities.add({
		name: "贴地围墙",
		polygon: {
			hierarchy: Cartesian3.fromDegreesArray([
				-108.0, 42.0, -100.0, 42.0, -104.0, 40.0,
			]),
			extrudedHeight: 50000.0,
			material: Color.GREEN,
			closeTop: false,
			closeBottom: false,
		},
	});

	viewer.entities.add({
		name: "立面拉伸填充面",
		polygon: {
			hierarchy: Cartesian3.fromDegreesArrayHeights([
				-108.0, 25.0, 100000, -100.0, 25.0, 100000, -100.0, 30.0, 100000,
				-108.0, 30.0, 300000,
			]),
			extrudedHeight: 0,
			perPositionHeight: true,
			material: Color.ORANGE.withAlpha(0.5),
			outline: true,
			outlineColor: Color.BLACK,
		},
	});

	viewer.entities.add({
		name: "立体悬浮面",
		polygon: {
			hierarchy: Cartesian3.fromDegreesArrayHeights([
				-90.0, 41.0, 0.0, -85.0, 41.0, 5000.0, -80.0, 36.0, 95550.0,
			]),
			perPositionHeight: true,
			material: Color.CYAN.withAlpha(0.5),
			outline: true,
			outlineColor: Color.BLACK,
		},
	});
}

function loadIcon(viewer: Viewer) {
	removeEntities(viewer);
	viewer.entities.add({
		position: Cartesian3.fromDegrees(-115.59777, 40.03883),
		billboard: {
			image: "/cesium/06/icon.png",
			heightReference: HeightReference.CLAMP_TO_GROUND, // 贴附地面

			scaleByDistance: new NearFarScalar(2000000, 1.5, 8000000, 0.5),

			// scaleByDistance 根据摄像机的距离来设置缩放比例
			// Cesium.NearFarScalar （near:摄像机范围的下限，nearValue:摄像机范围下限的值，far:摄像机范围的上限，farValue:摄像机范围上限的值）

			// new Cesium.NearFarScalar(100, 0.8, 1000, 0.2)
			// 0-100米，缩放比固定为0.8
			// 100-1000米，缩放比随着距离变大，由0.8插值变成0.2
			// 1000米以上，缩放比固定为0.2

			// scaleByDistance 设置距离方位内，Billboard或Label的缩放比例
			// translucencyByDistance  设置距离方位内，Billboard或Label的半透明度比例
			// pixelOffsetScaleByDistance ： 设置距离方位内，Billboard或Label的偏移量比例

			scale: 1,
			show: true,
			// pixelOffset: new Cesium.Cartesian2(10, -10),
			horizontalOrigin: HorizontalOrigin.CENTER,
			verticalOrigin: VerticalOrigin.BOTTOM,
			width: 32,
			height: 32,
		},
	});
}

function loadMultipleIcon(viewer: Viewer, count = 50000) {
	removeEntities(viewer);

	const points = randomPoint(count, { bbox: [-180, -90, 180, 90] });
	const billboardCollection = viewer.scene.primitives.add(
		new BillboardCollection(),
	);
	points.features.forEach((k) => {
		const cor = k.geometry.coordinates;
		billboardCollection.add({
			//根据距离缩放
			scaleByDistance: new NearFarScalar(2000000, 1, 8000000, 0.1),
			position: Cartesian3.fromDegrees(cor[0], cor[1]),
			image: "/cesium/06/icon.png",
			width: 32,
			height: 32,
		});
	});
}

function loadPopup(viewer: Viewer) {
	removeEntities(viewer);

	// 添加一个点实体作为弹窗的触发点
	const entity = viewer.entities.add({
		name: "数据点",
		position: Cartesian3.fromDegrees(-75.166493, 39.9060534),
		point: {
			pixelSize: 12,
			color: Color.fromCssColorString("#3B82F6"),
			outlineColor: Color.WHITE,
			outlineWidth: 3,
			heightReference: HeightReference.CLAMP_TO_GROUND,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
		},
	});

	const popup = new Popup({
		viewer,
	});

	let popupId: string | null = null;

	const mockData = {
		position: Cartesian3.fromDegrees(-75.166493, 39.9060534),
		content: {
			header: "数据点",
			content: `<div class="tw:flex tw:justify-between tw:mb-1"><span class="tw:text-gray-500">监控名称：</span><span class="tw:font-medium">监控名称</span></div>
					  <div class="tw:flex tw:justify-between tw:mb-1"><span class="tw:text-gray-500">监控编号：</span><span class="tw:font-medium">${parseInt(`${Math.random() * 100}`, 10)}</span></div>
					  <div class="tw:flex tw:justify-between tw:mb-1"><span class="tw:text-gray-500">监控类型：</span><span class="tw:font-medium">监控类型</span></div>
					  <div class="tw:flex tw:justify-between"><span class="tw:text-gray-500">监控状态：</span><span class="tw:text-green-500 tw:font-medium">在线</span></div>
					`,
		},
		isClose: true,
	};

	// 添加点击事件监听
	const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
	handler.setInputAction(
		(movement: ScreenSpaceEventHandler.PositionedEvent) => {
			const pickedObject = viewer.scene.pick(movement.position);
			if (pickedObject && pickedObject.id === entity) {
				// 如果弹窗不存在，则创建
				if (!popupId || !popup.has(popupId)) {
					popupId = popup.add(mockData);
				}
			}
		},
		ScreenSpaceEventType.LEFT_CLICK,
	);

	// 先飞到点的位置，等动画结束后再显示弹窗
	viewer
		.flyTo(entity, {
			offset: new HeadingPitchRange(0, -Math.PI / 4, 50000), // 距离50000米，俯角45度
		})
		.then(() => {
			// 动画结束后显示弹窗
			popupId = popup.add(mockData);
		});
}

function loadTooltip(viewer: Viewer) {
	removeEntities(viewer);

	const tooltip = new Tooltip({
		viewer,
	});

	// 创建多个不同位置和样式的 Tooltip
	const positions = [
		{
			lng: -95.0,
			lat: 40.0,
			header: "监控点 A",
			content: "设备状态: 正常<br/>信号强度: 85%<br/>在线时长: 24小时",
		},
		{
			lng: -100.0,
			lat: 42.0,
			header: "监控点 B",
			content: "设备状态: 维护中<br/>信号强度: 60%<br/>最后更新: 2分钟前",
		},
		{
			lng: -90.0,
			lat: 38.0,
			header: "监控点 C",
			content: "设备状态: 正常<br/>温度: 25°C<br/>湿度: 45%<br/>电量: 92%",
		},
		{
			lng: -105.0,
			lat: 35.0,
			header: "数据中心",
			content:
				"CPU使用率: 45%<br/>内存: 8.2GB/16GB<br/>网络流量: 125Mbps<br/>连接数: 1,245",
		},
	];

	// 添加点实体和对应的 Tooltip
	positions.forEach((pos) => {
		viewer.entities.add({
			name: pos.header,
			position: Cartesian3.fromDegrees(pos.lng, pos.lat),
			point: {
				pixelSize: 10,
				color: Color.fromCssColorString("#10B981"), // 绿色
				outlineColor: Color.WHITE,
				outlineWidth: 2,
				heightReference: HeightReference.CLAMP_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
			},
		});

		// 添加 Tooltip
		tooltip.add({
			position: Cartesian3.fromDegrees(pos.lng, pos.lat),
			header: pos.header,
			content: pos.content,
			width: 220,
		});
	});
}
