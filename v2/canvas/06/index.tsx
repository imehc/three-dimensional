import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage, Text } from "react-konva";

export default function Canvas06() {
	const containerref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		const container = containerref.current;
		if (!container) return;
		const { clientWidth, clientHeight } = container;
		setSize({ width: clientWidth, height: clientHeight });
	}, []);

	return (
		<div ref={containerref} className="w-full h-full">
			<Stage width={size.width} height={size.height}>
				<Layer>
					<Text text="Try click on rect" />
					<ColoredRect />
				</Layer>
			</Stage>
		</div>
	);
}
const ColoredRect = () => {
	const [color, setColor] = useState("green");

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor());
	};

	return (
		<Rect
			x={0}
			y={20}
			width={50}
			height={50}
			fill={color}
			shadowBlur={5}
			onClick={handleClick}
		/>
	);
};
