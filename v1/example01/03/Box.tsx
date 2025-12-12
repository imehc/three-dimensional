import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

export const Box: React.FC<ThreeElements["mesh"]> = (props) => {
	const ref = useRef<Mesh>(null);

	const [hovered, setHover] = useState<boolean>(false);
	const [rotate, setRotate] = useState<boolean>(false);

	useFrame((_, delta) => {
		if (!ref.current) return;
		if (rotate) {
			ref.current.rotation.x += 1 * delta;
			ref.current.rotation.y += 0.5 * delta;
		}
	});

	return (
		<mesh
			{...props}
			ref={ref}
			scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
			onPointerDown={() => setRotate(!rotate)}
			onPointerOver={() => setHover(true)}
			onPointerOut={() => setHover(false)}
		>
			<boxGeometry />
			<meshBasicMaterial color={hovered ? 0xff0000 : 0x00ff00} wireframe />
		</mesh>
	);
};
