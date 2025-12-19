import { useEffect, useEffectEvent, useRef } from "react";
import { Viewer, ImageryLayer, SingleTileImageryProvider } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import Container from "../../../componets/Container";

export default function App() {
	const ref = useRef<HTMLDivElement>(null);

	const init = useEffectEvent((el: HTMLDivElement) => {
		const viewer = new Viewer(el, {
			baseLayerPicker: false,
			baseLayer: new ImageryLayer(
				new SingleTileImageryProvider({
					url: "/cesium/images/word.jpg",
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
		return viewer;
	});

	useEffect(() => {
		const container = ref.current;
		if (!container) return;
		const viewer = init(container);

		return () => {
			if (!viewer.isDestroyed()) {
				viewer.destroy();
			}
		};
	}, []);

	return (
		<Container className="md:w-2xl">
			<div className="size-full" ref={ref} />
		</Container>
	);
}
