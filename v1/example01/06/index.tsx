import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BoxGeometry, DodecahedronGeometry, SphereGeometry } from "three";
import { Polyhedron } from "./Polyhedron";

/**
 * 统计面板
 */
const Demo06: React.FC = () => {
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
			{/* 设置默认视图 */}
			<Stats showPanel={2} />
		</Canvas>
	);
};

export default Demo06;
