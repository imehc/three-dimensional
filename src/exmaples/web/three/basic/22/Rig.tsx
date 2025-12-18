import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";

export const Rig = () => {
	const vec = useMemo(() => new Vector3(), []);

	return useFrame(({ camera, pointer }) => {
		vec.set(pointer.x * 2, pointer.y * 2, camera.position.z);
		camera.position.lerp(vec, 0.025);
		camera.lookAt(0, 0, 0);
	});
};
