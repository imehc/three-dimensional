import { Canvas } from "@react-three/fiber";
import { Box } from "./Box";

/**
 * 嵌套组件
 */
const Demo2v03 = () => {
	return (
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
	);
};

export default Demo2v03;
