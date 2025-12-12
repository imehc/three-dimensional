import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { useMemo } from "react";
import {
	BoxGeometry,
	type Color,
	DodecahedronGeometry,
	SphereGeometry,
} from "three";
import { Polyhedron } from "./Polyhedron";

/**
 * GUI组件
 */
const Demo11: React.FC = () => {
	const polyhedron = useMemo(
		() => [
			new BoxGeometry(),
			new SphereGeometry(0.785398),
			new DodecahedronGeometry(0.785398),
		],
		[],
	);

	const options = useMemo(() => {
		return {
			x: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
			y: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
			z: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
			visible: true,
			color: { value: "lime" },
		};
	}, []);
	const pA = useControls("Polyhedron A", options);
	const pB = useControls("Polyhedron B", options);

	return (
		<Canvas camera={{ position: [1, 2, 3] }}>
			<Polyhedron
				position={[-1, 1, 0]}
				rotation={[pA.x, pA.y, pA.z]}
				visible={pA.visible}
				color={pA.color as unknown as Color}
				polyhedron={polyhedron}
			/>
			<Polyhedron
				position={[1, 1, 0]}
				rotation={[pB.x, pB.y, pB.z]}
				visible={pB.visible}
				color={pB.color as unknown as Color}
				polyhedron={polyhedron}
			/>
			<OrbitControls target-y={1} />
			<axesHelper args={[5]} />
			<gridHelper />
			<Stats />
		</Canvas>
	);
};

export default Demo11;
