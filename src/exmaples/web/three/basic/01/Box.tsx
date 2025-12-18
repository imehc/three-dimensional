import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

export const Box: React.FC<ThreeElements["mesh"]> = (props) => {
	const ref = useRef<Mesh>(null);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += 1 * delta;
		ref.current.rotation.y += 0.5 * delta;
	});

	return (
		<mesh {...props} ref={ref}>
			<boxGeometry />
			<meshBasicMaterial color={0x00ff00} wireframe />
		</mesh>
	);
};
