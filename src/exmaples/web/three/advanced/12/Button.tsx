import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, type Mesh, type Texture } from "three";

export default function Button({
	id,
	texture,
	position,
	setSelected,
	roughness,
}: {
	id: number;
	texture: Texture;
	position: [number, number, number];
	setSelected(n: number): void;
	roughness?: number;
}) {
	const ref = useRef<Mesh>(null);
	const [hovered, setHovered] = useState(false);
	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.scale.y =
			ref.current.scale.x =
			ref.current.scale.z =
				MathUtils.lerp(ref.current.scale.y, hovered ? 1.5 : 1, 0.25);
		hovered && ref.current.rotateY(delta * 5);
	});
	return (
		<mesh
			ref={ref}
			position={position}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
			onPointerDown={() => setSelected(id)}
		>
			<sphereGeometry />
			<meshStandardMaterial
				map={texture}
				roughness={roughness}
				envMapIntensity={1.5}
			/>
		</mesh>
	);
}
