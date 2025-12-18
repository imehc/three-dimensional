import { Canvas } from "@react-three/fiber";
import { Box } from "./Box";
import Container from "../../../componets/Container";

/**
 * 嵌套组件
 */
const Demo2v03 = () => {
	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 4] }}>
				<Box position-x={-2.5}>
					<Box position-x={1.25}>
						<Box position-x={1.25}>
							<Box position-x={1.25}>
								<Box position-x={1.25} />
							</Box>
						</Box>
					</Box>
				</Box>
			</Canvas>
		</Container>
	);
};

export default Demo2v03;
