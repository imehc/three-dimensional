import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, MathUtils, type Mesh, type MeshBasicMaterial } from "three";

type MeshProps = ThreeElements["mesh"];

export const Box: React.FC<MeshProps> = (props) => {
	const ref = useRef<Mesh>(null);
	const [hovered, setHover] = useState(false);
	const [rotate, setRotate] = useState(false);
	const color = new Color();

	useFrame((_, delta) => {
		if (!ref.current) return;
		if (rotate) {
			ref.current.rotation.x += 1 * delta;
		}
		ref.current.scale.y = ref.current.scale.z = MathUtils.lerp(
			ref.current.scale.y,
			hovered ? 1.2 : 1,
			0.1,
		);
		(ref.current.material as MeshBasicMaterial).color.lerp(
			color.set(hovered ? 0xff0000 : 0x00ff00),
			0.1,
		);
	});

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerDown={(e) => {
				e.stopPropagation();
				setRotate(!rotate);
			}}
			onPointerOver={(e) => {
				e.stopPropagation();
				setHover(true);
			}}
			onPointerOut={(e) => {
				e.stopPropagation();
				setHover(false);
			}}
		>
			<boxGeometry onUpdate={(e) => e.rotateZ(Math.PI / 2)} />
			<meshBasicMaterial wireframe />
			{props.children}
		</mesh>
	);
};
