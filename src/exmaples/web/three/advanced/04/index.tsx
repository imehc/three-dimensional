import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Container from "../../../componets/Container";
import { Box } from "./Box";
import { Rig } from "./Rig";

/**
 * 事件传播
 */
const Demo2v04 = () => {
	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 4] }}>
				<directionalLight position={[1, 1, 1]} />
				<Box position={[0, 1.5, 0]} name="A0">
					<Box position={[-0.66, -1, 0]} name="B0">
						<Box position={[-0.66, -1, 0]} name="C0">
							<Box position={[-0.66, -1, 0]} name="D0" />
							<Box position={[0.66, -1, 0]} name="D1" />
						</Box>
						<Box position={[0.66, -1, 0]} name="C1">
							<Box position={[0.66, -1, 0]} name="D2" />
						</Box>
					</Box>
					<Box position={[0.66, -1, 0]} name="B1">
						<Box position={[0.66, -1, 0]} name="C2">
							<Box position={[0.66, -1, 0]} name="D3" />
						</Box>
					</Box>
				</Box>
				<Rig />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo2v04;
