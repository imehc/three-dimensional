import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BoxGeometry, DodecahedronGeometry, SphereGeometry } from "three";
import { Polyhedron } from "./Polyhedron";

/**
 * 助手
 */
const Demo10: React.FC = () => {
	const polyhedron = [
		new BoxGeometry(),
		new SphereGeometry(0.785398),
		new DodecahedronGeometry(0.785398),
	];

	return (
		<Canvas camera={{ position: [0, 0, 3] }}>
			<Polyhedron position={[-0.75, -0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[0.75, -0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[-0.75, 0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[0.75, 0.75, 0]} polyhedron={polyhedron} />
			<OrbitControls />
			<axesHelper args={[5]} />
			<gridHelper />
			<Stats />
		</Canvas>
	);
};

export default Demo10;
