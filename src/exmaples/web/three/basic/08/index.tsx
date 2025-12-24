import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BoxGeometry, DodecahedronGeometry, SphereGeometry } from "three";
import Container from "../../../componets/Container";
import { Polyhedron } from "./Polyhedron";

/**
 * 轨道控制
 */
const Demo08: React.FC = () => {
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
				<OrbitControls
					// 阻尼效果
					// enableDamping={false}
					// 平移
					// enablePan={false}
					// 旋转
					// enableRotate={false}
					// 缩放
					// enableZoom={false}
					// 限制向上/向下/向左/向右旋转的量
					minAzimuthAngle={-Math.PI / 4}
					maxAzimuthAngle={Math.PI / 4}
					minPolarAngle={Math.PI / 6}
					maxPolarAngle={Math.PI - Math.PI / 6}
				/>
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo08;
