import { useEffect, useRef } from "react";
import KLineChart from "./k-line-chart";
import { option } from "./option";

export default function Canvas05() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		const container = containerRef.current;
		if (!container || !canvas) return;
		new KLineChart(canvas, { ...option, target: container });
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full h-full flex justify-center items-center"
		>
			<canvas ref={ref} className="w-full h-full" />
		</div>
	);
}
