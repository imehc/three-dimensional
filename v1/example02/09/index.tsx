import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { GridHelper } from "three";
import { Box } from "./Box";
import { Rig } from "./Rig";

/**
 * 鼠标滑动
 */
const Demo2v09 = () => {
	const ref = useRef<GridHelper>(null);
	return (
		<Canvas camera={{ position: [0, 0, 6] }}>
			<directionalLight position={[0, 0, 1]} />
			{[...Array(7).keys()].map((i) => (
				<group key={i * 9}>
					<Box position={[-5, -4.5 + i * 1.5, 0]} text={"S"} />
					<Box position={[-3, -4.5 + i * 1.5, 0]} text={"B"} />
					<Box position={[-1, -4.5 + i * 1.5, 0]} text={"C"} />
					<Box position={[1, -4.5 + i * 1.5, 0]} text={"O"} />
					<Box position={[3, -4.5 + i * 1.5, 0]} text={"D"} />
					<Box position={[5, -4.5 + i * 1.5, 0]} text={"E"} />
				</group>
			))}
			<Rig />
			<Stats />
		</Canvas>
	);
};

export default Demo2v09;
