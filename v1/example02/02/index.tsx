import { Stats, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Polyhedron } from "./Polyhedron";

/**
 * 修改几何属性
 */
const Demo2v02 = () => {
	return (
		<Canvas camera={{ position: [1, 1, 3] }}>
			<Polyhedron />
			<OrbitControls />
			<Stats />
		</Canvas>
	);
};

export default Demo2v02;
