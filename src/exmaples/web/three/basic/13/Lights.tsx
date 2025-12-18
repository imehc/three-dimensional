import { useControls } from "leva";
import { useRef } from "react";
import {
	type AmbientLight,
	Color,
	type DirectionalLight,
	type PointLight,
	type SpotLight,
} from "three";

export const Lights: React.FC = () => {
	const ambientRef = useRef<AmbientLight>(null);
	const directionalRef = useRef<DirectionalLight>(null);
	const pointRef = useRef<PointLight>(null);
	const spotRef = useRef<SpotLight>(null);

	useControls("Ambient Light 环境光", {
		visible: {
			value: false,
			onChange: (v) => {
				if (!ambientRef.current) return;
				ambientRef.current.visible = v;
			},
		},
		color: {
			value: "white",
			onChange: (v) => {
				if (!ambientRef.current) return;
				ambientRef.current.color = new Color(v);
			},
		},
	});

	useControls("Directional Light 定向光", {
		visible: {
			value: true,
			onChange: (v) => {
				if (!directionalRef.current) return;
				directionalRef.current.visible = v;
			},
		},
		position: {
			value: { x: 1, y: 1, z: 1 },
			onChange: (v) => {
				if (!directionalRef.current) return;
				directionalRef.current.position.copy(v);
			},
		},
		color: {
			value: "white",
			onChange: (v) => {
				if (!directionalRef.current) return;
				directionalRef.current.color = new Color(v);
			},
		},
	});

	useControls("Point Light 聚光灯", {
		visible: {
			value: false,
			onChange: (v) => {
				if (!pointRef.current) return;
				pointRef.current.visible = v;
			},
		},
		position: {
			value: { x: 2, y: 0, z: 0 },
			onChange: (v) => {
				if (!pointRef.current) return;
				pointRef.current.position.copy(v);
			},
		},
		color: {
			value: "white",
			onChange: (v) => {
				if (!pointRef.current) return;
				pointRef.current.color = new Color(v);
			},
		},
	});

	useControls("Spot Light 点光源", {
		visible: {
			value: false,
			onChange: (v) => {
				if (!spotRef.current) return;
				spotRef.current.visible = v;
			},
		},
		position: {
			value: { x: 3, y: 2.5, z: 1 },
			onChange: (v) => {
				if (!spotRef.current) return;
				spotRef.current.position.copy(v);
			},
		},
		color: {
			value: "white",
			onChange: (v) => {
				if (!spotRef.current) return;
				spotRef.current.color = new Color(v);
			},
		},
	});

	return (
		<>
			<ambientLight ref={ambientRef} />
			<directionalLight ref={directionalRef} />
			<pointLight ref={pointRef} />
			<spotLight ref={spotRef} />
		</>
	);
};
