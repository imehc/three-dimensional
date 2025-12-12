import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import { BoxGeometry, DodecahedronGeometry, SphereGeometry } from "three";
import { Polyhedron } from "./Polyhedron";

/**
 * 性能统计面板
 */
const Demo07: React.FC = () => {
	const polyhedron = [
		new BoxGeometry(),
		new SphereGeometry(0.785398),
		new DodecahedronGeometry(0.785398),
	];
	return (
		<Canvas camera={{ position: [0, 0, 2] }}>
			<Polyhedron position={[-0.75, -0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[0.75, -0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[-0.75, 0.75, 0]} polyhedron={polyhedron} />
			<Polyhedron position={[0.75, 0.75, 0]} polyhedron={polyhedron} />
			{/* ISSUE: 无法正常显示统计面板 */}
			<Perf position="top-left" />
		</Canvas>
	);
};

export default Demo07;
