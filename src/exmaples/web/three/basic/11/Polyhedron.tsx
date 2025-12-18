import type { ThreeElements } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Color, Mesh } from "three";

type MeshProps = ThreeElements["mesh"];

interface Props extends MeshProps {
	polyhedron: NonNullable<MeshProps["geometry"]>[];
	color: Color;
}

export const Polyhedron: React.FC<Props> = ({
	polyhedron,
	color,
	...props
}) => {
	const ref = useRef<Mesh>(null);
	const [count, setCount] = useState(2);

	console.log(polyhedron[count].uuid);

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerDown={() => {
				setCount((count + 1) % 3);
			}}
			geometry={polyhedron[count]}
		>
			<meshBasicMaterial color={color} wireframe />
		</mesh>
	);
};
