import { useGLTF } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import type { Mesh } from "three";
import type { GLTFResult } from "../../types/use_gltf";
import MaterialMenu from "./MaterialMenu";

export default function ArmChair() {
	const [selected, setSelected] = useState(0);

	const ref = useRef<Mesh>(null);
	const { nodes, materials } = useGLTF(
		"/v212/models/armchair-transformed.glb",
	) as unknown as GLTFResult;

	const materialOverrides = useMemo(() => {
		return {
			0: materials.fabric_pattern_05,
			1: materials.red_leather,
			2: materials.fabric_pattern_7,
			3: materials.book_pattern,
			4: materials.denim_fabric_02,
		};
	}, [materials]);

	return (
		<>
			<group dispose={null} position={[1.5, 0.299, 1.5]}>
				<group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
					<mesh
						ref={ref}
						geometry={nodes.armchair001_1.geometry}
						material={
							materialOverrides[selected as keyof typeof materialOverrides]
						}
						castShadow
						receiveShadow
					/>
					<mesh
						geometry={nodes.armchair001_3.geometry}
						material={materials.wooden_legs}
						castShadow
					/>
				</group>
			</group>
			<MaterialMenu setSelected={setSelected} />
		</>
	);
}

useGLTF.preload("/v212/models/armchair-transformed.glb");
