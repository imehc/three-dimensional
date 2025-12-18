import { Select } from "@react-three/postprocessing";
import type React from "react";
import { useState } from "react";
import type { BufferGeometry, MeshStandardMaterial, Vector3 } from "three";
import { useStore } from "./use_store";

interface Props {
	geometry: BufferGeometry;
	material: MeshStandardMaterial;
	position: Vector3;
}

export const Selectable: React.FC<Props> = ({
	geometry,
	material,
	position,
}) => {
	const [hovered, hover] = useState(false);
	const { setOrbitmode, setAutoRotate, to } = useStore((state) => state);

	return (
		<Select enabled={hovered}>
			<mesh
				onPointerOver={(e) => {
					e.stopPropagation();
					hover(true);
				}}
				onPointerOut={() => hover(false)}
				onClick={(e) => {
					e.stopPropagation();
					to.set(...(position as unknown as [number, number, number]));
					setOrbitmode(true);
					setTimeout(() => setAutoRotate(true), 1000);
				}}
				geometry={geometry}
				material={material}
				position={position}
			/>
		</Select>
	);
};
