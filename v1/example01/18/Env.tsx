import { Environment } from "@react-three/drei";
import { useControls } from "leva";

export const Env = () => {
	const { height, radius, scale } = useControls("Ground", {
		height: { value: 10, min: 0, max: 100, step: 1 },
		radius: { value: 115, min: 0, max: 1000, step: 1 },
		scale: { value: 100, min: 0, max: 1000, step: 1 },
	});

	return (
		<Environment
			preset="sunset"
			background
			ground={{
				height: height,
				radius: radius,
				scale: scale,
			}}
		/>
	);
};
