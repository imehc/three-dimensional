import { Environment, OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { Model } from "./Model";
import Models from "./models.json";
import "./styles.css";
import Container from "../../../componets/Container";

/**
 * 添加注释
 */
const Demo20: React.FC = () => {
	const { model } = useControls({
		model: {
			value: "hammer",
			options: Object.keys(Models),
		},
	});

	return (
		<Container>
			<Canvas camera={{ position: [0, 0, -0.2], near: 0.025 }}>
				<Environment
					files="/models/assets-useGLTF/img/workshop_1k.hdr"
					background
				/>
				<group>
					<Model url={Models[model as keyof typeof Models]} />
				</group>
				<OrbitControls autoRotate />
				<Stats />
			</Canvas>
			<span>
				The {model.replace(/([A-Z])/g, " $1").toLowerCase()} is selected.
				{/* 
          let str = 'HelloWorld';
          str.replace(/([A-Z])/g, ' $1').toLowerCase();
          // 'hello world'
        */}
			</span>
		</Container>
	);
};
export default Demo20;
