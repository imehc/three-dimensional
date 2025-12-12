import { useEffect, useRef } from "react";
import { BarChart } from "./bar-chart";

export default function Canvas03() {
	const containerRef = useRef<HTMLDivElement>(null);
	const labelContainerRef = useRef<HTMLDivElement>(null);
	const legendRef = useRef<HTMLLegendElement>(null);
	const ref = useRef<HTMLCanvasElement>(null);
	const barChartRef = useRef<BarChart | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		const labelContainer = labelContainerRef.current;
		const legend = legendRef.current;
		const canvas = ref.current;
		if (!container || !labelContainer || !legend || !canvas) return;

		const initChart = () => {
			// 先给 canvas 设置初始尺寸（使用容器的完整高度）
			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight;

			// 清空现有的 barChart 实例
			if (barChartRef.current) {
				barChartRef.current = null;
			}

			// 创建 BarChart 实例（这会动态创建 legend 内容）
			barChartRef.current = new BarChart({
				canvas,
				labelContainer,
				legend,
				seriesName: "fruit shop",
				padding: 30,
				gridStep: 5,
				gridColor: "black",
				data: {
					Banana: 16,
					Apple: 12,
					Orange: 20,
					Strawberry: 3,
				},
				hoverColor: "red",
				colors: ["#5470C6", "#91CC75", "#fac858", "#ee6666"],
				titleOptions: {
					align: "center",
					fill: "black",
					font: {
						weight: "bold",
						size: "18px",
						family: "Lato",
					},
				},
			});

			// 使用 ResizeObserver 监听 legend 的高度变化
			const resizeObserver = new ResizeObserver(() => {
				// legend 内容创建后，重新调整 canvas 高度
				const legendHeight = legend.offsetHeight;
				if (legendHeight > 0 && canvas.height !== container.clientHeight - legendHeight) {
					canvas.height = container.clientHeight - legendHeight;
					// 使用 redraw 而不是 draw，避免重置动画状态
					barChartRef.current?.redraw();
				}
			});

			resizeObserver.observe(legend);

			// 首次绘制
			barChartRef.current.draw();

			return resizeObserver;
		};

		const resizeObserver = initChart();

		// 监听窗口大小变化
		const handleResize = () => {
			const legend = legendRef.current;
			const canvas = ref.current;
			const container = containerRef.current;
			if (!legend || !canvas || !container) return;

			const legendHeight = legend.offsetHeight;
			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight - legendHeight;
			barChartRef.current?.draw();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full relative">
			<div
				ref={labelContainerRef}
				className="absolute left-0 top-0 p-4 flex items-center rounded invisible shadow-[2px,2px,20px,2px,#a3a3a3] bg-white pointer-events-none z-10 transition-all duration-200 ease-out"
			/>
			<legend ref={legendRef} />
			<canvas ref={ref} />
		</div>
	);
}
