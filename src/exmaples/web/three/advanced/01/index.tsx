import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group } from "@tweenjs/tween.js";
import { Suspense, useRef } from "react";
import Container from "../../../componets/Container";
import { Annotations } from "./Annotations";
import { House } from "./House";
import { Loader } from "./Loader";

// Create a shared TWEEN group for this demo
export const tweenGroup = new Group();

const Tween = () => {
	useFrame(() => {
		tweenGroup.update();
	});

	return null;
};

/**
 * 房子
 */
const Demo2v01: React.FC = () => {
	const ref = useRef(null);
	const position = [8, 2, 3] as [number, number, number];

	return (
		<Container>
			<Canvas camera={{ position: [8, 2, 12] }}>
				<OrbitControls ref={ref} target={position} />
				<Suspense fallback={<Loader position={position} />}>
					<Environment preset="forest" background blur={0.75} />
					<House />
					<Annotations controls={ref} />
					<Tween />
				</Suspense>
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo2v01;
