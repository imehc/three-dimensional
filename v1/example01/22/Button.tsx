import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import { Color, type Mesh, type MeshStandardMaterial } from "three";

type MeshProps = ThreeElements["mesh"];

const black = new Color("black");
export const Button: React.FC<MeshProps> = (props) => {
	const ref = useRef<Mesh>(null);
	const [hovered, setHovered] = useState(false);
	const [selected, setSelected] = useState(false);
	const colorTo = useMemo(
		() => new Color(Math.floor(Math.random() * 16777216)),
		[],
	);

	const lerp = useCallback((from: number, to: number, speed: number) => {
		const r = (1 - speed) * from + speed * to;
		return Math.abs(from - to) < 0.001 ? to : r;
	}, []);

	useFrame(() => {
		if (!ref.current) return;
		ref.current.rotation.x = hovered
			? lerp(ref.current.rotation.x, -Math.PI * 2, 0.025)
			: lerp(ref.current.rotation.x, 0, 0.025);
		// ? MathUtils.lerp(ref.current.rotation.x, -Math.PI * 2, 0.025)
		// : MathUtils.lerp(ref.current.rotation.x, 0, 0.025);

		ref.current.position.z = selected
			? // ? MathUtils.lerp(ref.current.position.z, 0, 0.025)
				// : MathUtils.lerp(ref.current.position.z, -3, 0.025);
				lerp(ref.current.position.z, 0, 0.025)
			: lerp(ref.current.position.z, -3, 0.025);

		(ref.current.material as MeshStandardMaterial).color.lerp(
			selected ? colorTo : black,
			0.025,
		);
	});

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerDown={() => {
				setSelected(!selected);
			}}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			<icosahedronGeometry />
			<meshPhysicalMaterial
				roughness={0}
				metalness={0}
				thickness={3.12}
				ior={1.74}
				transmission={1.0}
			/>
		</mesh>
	);
};
