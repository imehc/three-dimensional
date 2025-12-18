import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import NeuralNetwork from "./NeuralNetwork";
import Container from "../../../componets/Container";

/**
 * 神经网络 copy
 */
export const Demo2v13 = () => {
	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 20] }}>
				<NeuralNetwork />
				<OrbitControls />
			</Canvas>
		</Container>
	);
};

export default Demo2v13;
