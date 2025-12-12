import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Model } from "./Model";
import "./styles.css";

const Models = [
	{ title: "Hammer", url: "/models/assets-useGLTF/models/hammer.glb" },
	{ title: "Drill", url: "/models/assets-useGLTF/models/drill.glb" },
	{
		title: "Tape Measure",
		url: "/models/assets-useGLTF/models/tapeMeasure.glb",
	},
];

/**
 * useGLTF
 */
const Demo19: React.FC = () => {
	const { title } = useControls({
		title: {
			options: Models.map(({ title }) => title),
		},
	});

	return (
		<>
			<Canvas camera={{ position: [0, 0, -0.2], near: 0.025 }}>
				<Environment
					files="/models/assets-useGLTF/img/workshop_1k.hdr"
					background
				/>
				<group>
					<Model url={Models[Models.findIndex((m) => m.title === title)].url} />
				</group>
				<OrbitControls autoRotate />
				<Stats />
			</Canvas>
			<span>The {title} is selected.</span>
		</>
	);
};

export default Demo19;
