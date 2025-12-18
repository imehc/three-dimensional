import { Canvas } from "@react-three/fiber";
import { Box } from "./Box";
import Container from "../../../componets/Container";

/**
 * 使用useMemo进行优化
 */
const Demo04: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 2] }}>
				<Box position={[-0.75, 0, 0]} name="A" />
				<Box position={[0.75, 0, 0]} name="B" />
			</Canvas>
		</Container>
	);
};

export default Demo04;
