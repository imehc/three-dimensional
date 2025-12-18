import { useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const Model: React.FC = () => {
	const { scene } = useLoader(GLTFLoader, "/models/scene.glb");
	const {
		x,
		y,
		z,
		visible,
		color,
		metalness,
		roughness,
		clearcoat,
		clearcoatRoughness,
		transmission,
		ior,
		thickness,
	} = useControls("Suzanne", {
		x: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
		y: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
		z: { value: 0, min: 0, max: Math.PI * 2, step: 0.01 },
		visible: true,
		color: { value: "#ffbc85" },
		metalness: {
			value: 0,
			min: 0,
			max: 1.0,
			step: 0.01,
			label: "金属度",
		},
		roughness: {
			value: 0,
			min: 0,
			max: 1.0,
			step: 0.01,
			label: "粗糙度",
		},
		clearcoat: {
			value: 1,
			min: 0,
			max: 1.0,
			step: 0.01,
			label: "清漆",
		},
		clearcoatRoughness: {
			value: 0,
			min: 0,
			max: 1.0,
			step: 0.01,
			label: "清漆粗糙度",
		},
		transmission: {
			value: 1.0,
			min: 0,
			max: 1.0,
			step: 0.01,
			label: "透射率",
		},
		ior: { value: 1.74, min: 1, max: 5, step: 0.01, label: "溶解率" },
		thickness: {
			value: 3.12,
			min: 0,
			max: 5,
			step: 0.01,
			label: "厚度",
		},
	});

	return (
		<primitive
			object={scene}
			children-0-rotation={[x, y, z]}
			children-0-visible={visible}
			children-0-material-color={color}
			children-0-material-metalness={metalness}
			children-0-material-roughness={roughness}
			children-0-material-clearcoat={clearcoat}
			children-0-material-clearcoatRoughness={clearcoatRoughness}
			children-0-material-transmission={transmission}
			children-0-material-ior={ior}
			children-0-material-thickness={thickness}
		/>
	);
};
