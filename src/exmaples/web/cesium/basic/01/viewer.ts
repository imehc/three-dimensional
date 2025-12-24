import {
	EllipsoidTerrainProvider,
	GeographicTilingScheme,
	ImageryLayer,
	type ImageryProvider,
	SingleTileImageryProvider,
	UrlTemplateImageryProvider,
	Viewer,
	WebMapServiceImageryProvider,
	WebMapTileServiceImageryProvider,
} from "cesium";
import CesiumNavigation, {
	type NavigationOptions,
} from "cesium-navigation-es6";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { GUI } from "dat.gui";

/**
 * 影像底图
 *
 * @param el - 用于承载 Cesium Viewer 的 HTML 元素
 * @returns 返回配置好的 Viewer 实例
 */
export function initViewer(el: HTMLElement) {
	const viewer = new Viewer(el, {
		baseLayerPicker: false,
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

	// 创建 dat.gui 控制面板
	const gui = new GUI();
	gui.domElement.style.position = "fixed";
	gui.domElement.style.bottom = "50%";
	gui.domElement.style.transform = "translateY(-50%)";
	gui.domElement.style.left = "0";

	// 底图配置
	const imageryOptions: Record<string, keyof typeof imageryTypes> = {
		底图类型: "map1",
	};

	// 可用的底图类型
	const imageryTypes = {
		map1: "/cesium/01/word.jpg",
		map2: "/cesium/01/world_b.jpg",
		xyz: "//data.mars3d.cn/tile/img/{z}/{x}/{y}.jpg",
		mapbox:
			"https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?sku=1016Ab1dNMw2X&access_token=pk.eyJ1IjoidHJhbXBqd2wiLCJhIjoiY2xhYXIxbHExMDN3dzN3cGliOHdrMThxMiJ9.6er2aYb1EBjSsK1-t9d2-w",
		wms: "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
		天地图: "http://t{s}.tianditu.gov.cn/",
		影像: "/cesium/01/word.jpg",
	} as const;

	type BaseLayerType = Pick<typeof imageryTypes, "map1" | "map2">;
	function loadBaseLayer(url: BaseLayerType[keyof BaseLayerType]) {
		return new ImageryLayer(
			new SingleTileImageryProvider({
				url,
				tileWidth: 256,
				tileHeight: 256,
			}),
		);
	}
	// 添加默认底图 map1
	viewer.imageryLayers.add(loadBaseLayer(imageryTypes.map1));

	// 添加底图切换控制
	gui
		.add(imageryOptions, "底图类型", Object.keys(imageryTypes))
		.name("底图类型")
		.onChange((value: keyof typeof imageryTypes) => {
			// 移除当前所有影像图层
			viewer.imageryLayers.removeAll();

			let newLayer: ImageryLayer | undefined;
			let newProvider: ImageryProvider | undefined;

			switch (value) {
				case "map2":
					newLayer = loadBaseLayer(imageryTypes.map2);
					break;
				case "xyz":
					newProvider = new UrlTemplateImageryProvider({
						url: imageryTypes.xyz,
					});
					break;
				case "mapbox":
					newProvider = new UrlTemplateImageryProvider({
						credit: "mapbox",
						url: imageryTypes.mapbox,
					});
					break;
				case "wms":
					newProvider = new WebMapServiceImageryProvider({
						url: imageryTypes.wms,
						layers: "nexrad-n0r",
						credit: "demo",
						parameters: {
							transparent: "true",
							format: "image/png",
						},
					});
					break;
				case "天地图":
					{
						const _layer = "vec";
						const token = "bcc62222fc634ec736589c483de933e6";
						const maxLevel = 18;
						const matrixIds = new Array(maxLevel);
						for (let z = 0; z <= maxLevel; z++) {
							matrixIds[z] = (z + 1).toString();
						}
						const _url =
							imageryTypes.天地图 +
							_layer +
							"_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=" +
							_layer +
							"&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=" +
							token;
						newProvider = new WebMapTileServiceImageryProvider({
							url: _url,
							layer: _layer,
							credit: "opts.credit",
							style: "default",
							format: "tiles",
							tileMatrixSetID: "c",
							subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
							tileMatrixLabels: matrixIds,
							tilingScheme: new GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
							maximumLevel: maxLevel,
						});
					}
					break;
				case "影像":
					{
						const imageryProvider = new SingleTileImageryProvider({
							url: imageryTypes.影像,
							tileWidth: 256,
							tileHeight: 256,
						});
						const lay =
							viewer.imageryLayers.addImageryProvider(imageryProvider);
						lay.alpha = 0.5; // 0.0  全透明.  1.0 不透明.
						lay.brightness = 2.0; // > 1.0 增加亮度  < 1.0减少亮度
						lay.contrast = 2.0; //对比度
						lay.hue = 2.0; //色调
						lay.saturation = 2.0; //饱和度
						// 图层顺序
						viewer.scene.imageryLayers.lower(lay);
						viewer.scene.imageryLayers.lowerToBottom(lay);
						viewer.scene.imageryLayers.raise(lay);
						viewer.scene.imageryLayers.raiseToTop(lay);

						// 获取图层
						viewer.scene.imageryLayers.get(0);
						viewer.scene.imageryLayers.indexOf(lay);

						// 是否包含图层
						viewer.scene.imageryLayers.contains(lay);
					}
					break;
				default:
					newLayer = loadBaseLayer(imageryTypes.map1);
					break;
			}

			if (newLayer) {
				viewer.imageryLayers.add(newLayer);
			}
			if (newProvider) {
				viewer.imageryLayers.addImageryProvider(newProvider);
			}
		});

	const options = {
		enableCompass: true,
		enableZoomControls: true,
	} satisfies NavigationOptions;
	new CesiumNavigation(viewer, options);

	return { viewer, gui };
}
