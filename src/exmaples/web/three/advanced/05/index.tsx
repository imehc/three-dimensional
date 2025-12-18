import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Arena } from "./Arena";
import { Tween } from "./Tween";
import Container from "../../../componets/Container";

/**
 * 更改相机位置及其面向位置
 */
const Demo2v05 = () => {
	const ref = useRef(null);
	return (
		<Container>
			<Canvas camera={{ position: [10, 10, 10] }} shadows>
				<directionalLight
					intensity={1}
					castShadow={true}
					shadow-bias={-0.0002}
					shadow-mapSize={[2048, 2048]}
					position={[85.0, 80.0, 70.0]}
					shadow-camera-left={-30}
					shadow-camera-right={30}
					shadow-camera-top={30}
					shadow-camera-bottom={-30}
				/>
				<Environment
					files="/imgs/drakensberg_solitary_mountain_1k.hdr"
					background
				/>
				<OrbitControls ref={ref} target={[0, 1, 0]} />
				<Arena controls={ref} />
				<Tween />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo2v05;
