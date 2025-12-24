import { useGLTF } from "@react-three/drei";
import { Easing, Tween } from "@tweenjs/tween.js";
import type { GLTFResult } from "../../types/use_gltf";
import { tweenGroup } from "./index";

export function Model({ controls }: any) {
	const { nodes, materials } = useGLTF(
		"/models/scan-transformed.glb",
	) as unknown as GLTFResult;

	return (
		<group dispose={null}>
			<mesh geometry={nodes.Mesh_0.geometry} material={materials.material_0} />

			{/* A box used for raycasting since the photogrammetry geometry has so many faces that it makes the raycaster slow */}
			{/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
			<mesh
				position={[0, -0.25, -0.6]}
				rotation-y={-Math.PI / 64}
				onDoubleClick={({ point }) => {
					const targetTween = new Tween(controls.current.target, tweenGroup)
						.to(
							{
								x: point.x,
								y: point.y,
								z: point.z,
							},
							500,
						)
						.easing(Easing.Cubic.Out);
					targetTween.start();
				}}
			>
				<boxGeometry args={[30, 3, 0.1]} />
				<meshBasicMaterial wireframe visible={false} />
			</mesh>
		</group>
	);
}

useGLTF.preload("/models/scan-transformed.glb");
