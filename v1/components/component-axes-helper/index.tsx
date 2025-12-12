import { Text } from "@react-three/drei";
import {
	OrbitControls,
} from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import React, { useRef } from "react";

interface AxisLabelsProps {
	axisLength: number;
}

const AxisLabels: React.FC<AxisLabelsProps> = ({ axisLength }) => {
	return (
		<React.Fragment>
			<Text
				position={[axisLength + 5, 0, 0]}
				fontSize={1}
				color={0xe56f6f}
				// rotation={[0, Math.PI / 2, 0]}
			>
				X
			</Text>
			<Text
				position={[0, axisLength + 5, 0]}
				fontSize={1}
				color={0x3daf42}
				// rotation={[0, Math.PI / 2, 0]}
			>
				Y
			</Text>
			<Text
				position={[0, 0, axisLength + 5]}
				fontSize={1}
				color={0x3a8cff}
				// rotation={[0, Math.PI / 2, 0]}
			>
				Z
			</Text>
		</React.Fragment>
	);
};

export const ThreeAxesHelper: React.FC = () => {
	const axesRef = useRef(null);

	return (
		<Canvas className="bg-[#616672]" style={{ height: "40vh", width: "40vw" }}>
			<OrbitControls />
			<ambientLight />
			<group ref={axesRef}>
				{/* here axes helper is applied */}
				<axesHelper args={[2]} />
				<AxisLabels axisLength={-3} />
			</group>
			<mesh scale={0.3}>
				<boxGeometry attach="geometry" args={[5, 5, 5]} />
				<meshBasicMaterial attach="material" color="lightblue" />
			</mesh>
		</Canvas>
	);
};
