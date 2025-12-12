import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

type MeshProps = ThreeElements["mesh"];

interface Props extends MeshProps {
	polyhedron: NonNullable<MeshProps["geometry"]>[];
}

export const Polyhedron: React.FC<Props> = ({ position, polyhedron }) => {
	const ref = useRef<Mesh>(null);
	const [count, setCount] = useState(0);

	console.log(polyhedron);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += delta;
		ref.current.rotation.y += 0.5 * delta;
	});

	return (
		<mesh
			position={position}
			ref={ref}
			onPointerDown={() => {
				setCount((count + 1) % 3);
			}}
			geometry={polyhedron[count]}
		>
			<meshBasicMaterial color={"lime"} wireframe />
		</mesh>
	);
};
