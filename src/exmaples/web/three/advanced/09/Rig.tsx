import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

export const Rig = () => {
	const { camera, pointer } = useThree();
	const vec = new Vector3();

	return useFrame(() => {
		camera.position.lerp(
			vec.set(pointer.x, pointer.y, camera.position.z),
			0.05,
		);
		camera.lookAt(0, 0, 0);
	});
};
