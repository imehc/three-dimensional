import { useGLTF } from "@react-three/drei";
import {
	EffectComposer,
	Outline,
	Selection,
} from "@react-three/postprocessing";
import type { GLTFResult } from "../../types/use_gltf";
import { Selectable } from "./Selectable";

export const Scene = () => {
	const { nodes, materials } = useGLTF(
		"https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@teleport/public/models/scene-transformed.glb",
	) as unknown as GLTFResult;

	return (
		<group dispose={null}>
			<mesh
				geometry={nodes.Plane.geometry}
				material={nodes.Plane.material}
				scale={[10, 1, 10]}
			/>
			<Selection>
				<EffectComposer multisampling={8} autoClear={false}>
					<Outline
						blur
						// visibleEdgeColor="white"
						edgeStrength={100}
						width={1000}
					/>
				</EffectComposer>
				<Selectable
					geometry={nodes.Cube.geometry}
					material={materials.Material}
					position={[8, 1, 8] as any}
				/>
				<Selectable
					geometry={nodes.Cylinder.geometry}
					material={nodes.Cylinder.material as any}
					position={[8, 1, -8] as any}
				/>
				<Selectable
					geometry={nodes.Icosphere.geometry}
					material={nodes.Icosphere.material as any}
					position={[-8, 1, -8] as any}
				/>
				<Selectable
					geometry={nodes.Cone.geometry}
					material={nodes.Cone.material as any}
					position={[-8, 1, 8] as any}
				/>
				<Selectable
					geometry={nodes.Suzanne.geometry}
					material={nodes.Suzanne.material as any}
					position={[0, 1, 0] as any}
				/>
			</Selection>
		</group>
	);
};
