import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import {
	Color,
	type Mesh,
	type MeshBasicMaterial,
	type MeshNormalMaterial,
} from "three";

type MeshProps = ThreeElements["mesh"];

export const Polyhedron: React.FC<MeshProps> = (props) => {
	const ref = useRef<Mesh>(null);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += 0.2 * delta;
		ref.current.rotation.y += 0.05 * delta;
	});

	useControls(props.name as string, {
		wireframe: {
			value: false,
			onChange: (v) => {
				if (!ref.current) return;
				(ref.current.material as MeshBasicMaterial).wireframe = v;
			},
		},
		flatShading: {
			value: true,
			onChange: (v) => {
				if (!ref.current) return;
				(ref.current.material as MeshNormalMaterial).flatShading = v;
				(ref.current.material as MeshNormalMaterial).needsUpdate = true;
			},
		},
		color: {
			value: "lime",
			onChange: (v) => {
				if (!ref.current) return;
				(ref.current.material as MeshBasicMaterial).color = new Color(v);
			},
		},
	});

	return (
		<mesh {...props} ref={ref}>
			<icosahedronGeometry args={[1, 1]} />
		</mesh>
	);
};
