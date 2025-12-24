import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Container from "../../../componets/Container";
import NeuralNetwork from "./NeuralNetwork";

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
