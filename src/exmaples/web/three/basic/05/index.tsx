import { Canvas } from "@react-three/fiber";
import { BoxGeometry, DodecahedronGeometry, SphereGeometry } from "three";
import { Polyhedron } from "./Polyhedron";
import Container from "../../../componets/Container";

/**
 * 共享对象
 */
const Demo05: React.FC = () => {
	const polyhedron = [
		new BoxGeometry(),
		new SphereGeometry(0.785398),
		new DodecahedronGeometry(0.785398),
	];

	return (
		<Container>
			<Canvas camera={{ position: [0, 0, 3] }}>
				<Polyhedron position={[-0.75, -0.75, 0]} polyhedron={polyhedron} />
				<Polyhedron position={[0.75, -0.75, 0]} polyhedron={polyhedron} />
				<Polyhedron position={[-0.75, 0.75, 0]} polyhedron={polyhedron} />
				<Polyhedron position={[0.75, 0.75, 0]} polyhedron={polyhedron} />
			</Canvas>
		</Container>
	);
};

export default Demo05;
