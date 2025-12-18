import { useControls } from "leva";
import { useRef } from "react";
import type { DirectionalLight } from "three";

export const Lights: React.FC = () => {
	const directionalRef = useRef<DirectionalLight>(null);
	useControls("Directional Light", {
		intensity: {
			value: 1,
			min: 0,
			max: 5,
			step: 0.1,
			onChange: (v) => {
				if (!directionalRef.current) return;
				directionalRef.current.intensity = v;
			},
		},

		position: {
			value: { x: 3.3, y: 1.0, z: 4.4 },
			onChange: (v) => {
				if (!directionalRef.current) return;
				directionalRef.current.position.copy(v);
			},
		},
	});

	return <directionalLight ref={directionalRef} castShadow />;
};
