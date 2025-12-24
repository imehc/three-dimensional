import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Container from "../../../componets/Container";
import { Polyhedron } from "./Polyhedron";

/**
 * 修改几何属性
 */
const Demo2v02 = () => {
	return (
		<Container>
			<Canvas camera={{ position: [1, 1, 3] }}>
				<Polyhedron />
				<OrbitControls />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo2v02;
