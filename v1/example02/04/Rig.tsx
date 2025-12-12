import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";

/**
 * 平滑移动相机
 */
export const Rig = () => {
	const { camera, pointer } = useThree();
	const vec = useMemo(() => new Vector3(), []);

	return useFrame(() => {
		camera.position.lerp(
			vec.set(pointer.x, pointer.y, camera.position.z),
			0.05,
		);
		camera.lookAt(0, 0, 0);
	});
};
