import { useControls } from "leva";

export const Lights: React.FC = () => {
	const ambientCtl = useControls("Ambient Light 环境光", {
		visible: false,
		intensity: {
			value: 1.0,
			min: 0,
			max: 1.0,
			step: 0.1,
		},
	});

	const directionalCtl = useControls("Directional Light 定向光", {
		visible: true,
		position: {
			x: 3.3,
			y: 1.0,
			z: 4.4,
		},
		castShadow: true,
	});

	const pointCtl = useControls("Point Light 聚光灯", {
		visible: false,
		position: {
			x: 2,
			y: 0,
			z: 0,
		},
		castShadow: true,
	});

	const spotCtl = useControls("Spot Light 点光源", {
		visible: false,
		position: {
			x: 3,
			y: 2.5,
			z: 1,
		},
		castShadow: true,
	});

	return (
		<>
			<ambientLight
				visible={ambientCtl.visible}
				intensity={ambientCtl.intensity}
			/>
			<directionalLight
				visible={directionalCtl.visible}
				position={[
					directionalCtl.position.x,
					directionalCtl.position.y,
					directionalCtl.position.z,
				]}
				castShadow={directionalCtl.castShadow}
			/>
			<pointLight
				visible={pointCtl.visible}
				position={[
					pointCtl.position.x,
					pointCtl.position.y,
					pointCtl.position.z,
				]}
				castShadow={pointCtl.castShadow}
			/>
			<spotLight
				visible={spotCtl.visible}
				position={[spotCtl.position.x, spotCtl.position.y, spotCtl.position.z]}
				castShadow={spotCtl.castShadow}
			/>
		</>
	);
};
