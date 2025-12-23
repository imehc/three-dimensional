import { ImageryLayer, SingleTileImageryProvider, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

/**
 * 使用单张图片作为底图
 * 
 * @param el - 用于承载 Cesium Viewer 的 HTML 元素
 * @returns 返回配置好的 Viewer 实例
 */
export function initViewer(el: HTMLElement) {
	return new Viewer(el, {
		baseLayerPicker: false,
		baseLayer: new ImageryLayer(
			new SingleTileImageryProvider({
				url: "/cesium/01/word.jpg",
				tileWidth: 256,
				tileHeight: 256,
			}),
		),
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
}
