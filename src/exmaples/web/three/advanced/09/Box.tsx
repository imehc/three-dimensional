import { Text } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, type Mesh, type MeshStandardMaterial } from "three";

type MeshProps = ThreeElements["mesh"];

interface Props extends MeshProps {
	text: string;
}

export const Box: React.FC<Props> = ({ text, ...props }) => {
	const ref = useRef<Mesh>(null);
	const black = useMemo(() => new Color("black"), []);
	const lime = useMemo(() => new Color("lime"), []);
	const [hovered, setHovered] = useState(false);

	useFrame(({ pointer, viewport }) => {
		const x = (pointer.x * viewport.width) / 2.5;
		const y = (pointer.y * viewport.height) / 2.5;
		if (!ref.current) return;
		ref.current.lookAt(x, y, 1);
		(ref.current.material as MeshStandardMaterial).color.lerp(
			hovered ? lime : black,
			0.05,
		);
	});

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			<boxGeometry />
			<meshStandardMaterial color={lime} />
			<Text fontSize={0.5} position-z={0.501}>
				{text}
			</Text>
			{props.children}
		</mesh>
	);
};
