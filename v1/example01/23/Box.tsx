import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";
import type { useKeyboard } from "./useKeyboard";

type MeshProps = ThreeElements["mesh"];

interface Props extends MeshProps {
	selected?: boolean;
	keyMap: ReturnType<typeof useKeyboard>;
}

export const Box: React.FC<Props> = ({
	selected: _selected = false,
	keyMap,
	...props
}) => {
	const ref = useRef<Mesh>(null);
	const [selected, setSelected] = useState(_selected);

	useFrame((_, delta) => {
		if (!ref.current) return;
		if (keyMap.KeyA && selected) ref.current.position.x -= 1 * delta;
		if (keyMap.KeyD && selected) ref.current.position.x += 1 * delta;
		if (keyMap.KeyW && selected) ref.current.position.z -= 1 * delta;
		if (keyMap.KeyS && selected) ref.current.position.z += 1 * delta;
	});

	return (
		<mesh
			ref={ref}
			{...props}
			onPointerDown={(e) => {
				e.stopPropagation();
				setSelected(!selected);
			}}
		>
			<boxGeometry />
			<meshBasicMaterial color={0x00ff00} wireframe={!selected} />
		</mesh>
	);
};
