import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { GridHelper } from "three";
import { Ball } from "./Ball";
import { Overlay } from "./Overlay";

/**
 * 无限滚动
 */
const Demo2v08 = () => {
	const ref = useRef<GridHelper>(null);
	return (
		<>
			<Canvas
				camera={{ position: [0, 2.5, 2.5] }}
				onCreated={({ camera }) => camera.lookAt(0, 1, 0)}
			>
				<gridHelper ref={ref} args={[100, 100]} />
				<Ball floor={ref} />
				<Stats />
			</Canvas>
			<Overlay />
		</>
	);
};

export default Demo2v08;
