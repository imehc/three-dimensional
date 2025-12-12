import { type ThreeElements, useFrame } from "@react-three/fiber";
import { type ReactNode, useRef } from "react";
import type { Mesh } from "three";

type MeshProps = ThreeElements["mesh"] & {
	children?: ReactNode;
};

export const Polyhedron: React.FC<MeshProps> = ({ children, ...props }) => {
	const ref = useRef<Mesh>(null);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += 0.2 * delta;
		ref.current.rotation.y += 0.05 * delta;
	});

	return (
		<mesh {...props} ref={ref} castShadow receiveShadow>
			<icosahedronGeometry args={[1, 1]} />
			{children}
		</mesh>
	);
};
