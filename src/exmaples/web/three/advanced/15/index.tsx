import {
	Environment,
	Html,
	OrbitControls,
	useProgress,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Group } from "@tweenjs/tween.js";
import { Suspense, useRef } from "react";
import Container from "../../../componets/Container";
import { Model } from "./Scan";

// Create a shared TWEEN group for this demo
export const tweenGroup = new Group();

/**
 * 摄影测量
 */
export const Demo2v15 = () => {
	const ref = useRef<any>(null);
	return (
		<Container>
			<Canvas shadows camera={{ position: [4, 0, 3] }}>
				<Suspense fallback={<Loader />}>
					<Environment preset="forest" />
					<OrbitControls ref={ref} target={[4, 0, 0]} />
					<Model controls={ref} />
					<Tween />
				</Suspense>
			</Canvas>
			<div className="absolute left-2 top-2">
				Doubleclick to change OrbitControls target
			</div>
		</Container>
	);
};

function Loader() {
	const { progress } = useProgress();
	return <Html center>{progress} % loaded</Html>;
}

function Tween() {
	useFrame(() => {
		tweenGroup.update();
	});
	return null;
}

export default Demo2v15;
