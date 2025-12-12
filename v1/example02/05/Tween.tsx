import { useFrame } from "@react-three/fiber";
import { Group } from "@tweenjs/tween.js";

// Create a shared TWEEN group
export const tweenGroup = new Group();

export const Tween = () => {
	useFrame(() => {
		tweenGroup.update();
	});

	return null;
};
