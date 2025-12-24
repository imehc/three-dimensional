import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
	MeshBasicMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
} from "three";
import Container from "../../../componets/Container";
import { Lights } from "./Lights";
import { Polyhedron } from "./Polyhedron";

/**
 * 灯光
 */
const Demo13: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [4, 4, 1.5] }}>
				<Lights />
				<directionalLight position={[1, 1, 1]} />
				<Polyhedron
					name="meshBasicMaterial 网格基础材料"
					position={[-3, 1, 0]}
					material={new MeshBasicMaterial({ color: "yellow" })}
				/>
				<Polyhedron
					name="meshNormalMaterial 网格正常材料"
					position={[-1, 1, 0]}
					material={new MeshNormalMaterial({ flatShading: true })}
				/>
				<Polyhedron
					name="meshPhongMaterial 网蓬材料"
					position={[1, 1, 0]}
					material={new MeshPhongMaterial({ color: "lime", flatShading: true })}
				/>
				<Polyhedron
					name="meshStandardMaterial 网格标准材料"
					position={[3, 1, 0]}
					material={
						new MeshStandardMaterial({ color: 0xff0033, flatShading: true })
					}
				/>
				<OrbitControls target={[2, 2, 0]} />
				<axesHelper args={[5]} />
				<gridHelper />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo13;
