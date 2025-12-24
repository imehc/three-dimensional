import { Canvas } from "@react-three/fiber";
import Container from "../../../componets/Container";
import { Box } from "./Box";

/**
 * 基本场景
 */
const Demo01: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 2] }}>
				<Box position={[-0.75, 0, 0]} name="A" />
				<Box position={[0.75, 0, 0]} name="B" />
			</Canvas>
		</Container>
	);
};

export default Demo01;
