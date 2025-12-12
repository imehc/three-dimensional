import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import NeuralNetwork from "./NeuralNetwork";

/**
 * 神经网络 copy
 */
export const Demo2v13 = () => {
	return (
		<Canvas camera={{ position: [0, 0, 20] }}>
			<NeuralNetwork />
			<OrbitControls />
		</Canvas>
	);
};

export default Demo2v13;
