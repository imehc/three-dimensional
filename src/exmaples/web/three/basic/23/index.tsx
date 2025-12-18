import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box } from "./Box";
import { Overlay } from "./Overlay";
import { useKeyboard } from "./useKeyboard";
import Container from "../../../componets/Container";

const Demo23: React.FC = () => {
	const keyMap = useKeyboard();

	return (
		<Container>
			<Canvas camera={{ position: [1, 2, 3] }}>
				<Box position={[-1.5, 0.5, 0]} keyMap={keyMap} />
				<Box position={[0, 0.5, 0]} keyMap={keyMap} selected />
				<Box position={[1.5, 0.5, 0]} keyMap={keyMap} />
				<OrbitControls />
				<axesHelper args={[5]} />
				<gridHelper />
				<Stats />
			</Canvas>
			<Overlay />
		</Container>
	);
};

export default Demo23;
