import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
	MeshBasicMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
} from "three";
import Container from "../../../componets/Container";
import { Polyhedron } from "./Polyhedron";

/**
 * 材质
 */
const Demo12: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [-1, 4, 2.5] }}>
				<directionalLight position={[1, 1, 1]} />
				<Polyhedron
					name="meshBasicMaterial 网格基础材料"
					position={[-3, 1, 0]}
					material={new MeshBasicMaterial()}
				/>
				<Polyhedron
					name="meshNormalMaterial 网格正常材料"
					position={[-1, 1, 0]}
					material={new MeshNormalMaterial()}
				/>
				<Polyhedron
					name="meshPhongMaterial 网蓬材料"
					position={[1, 1, 0]}
					material={new MeshPhongMaterial()}
				/>
				<Polyhedron
					name="meshStandardMaterial 网格标准材料"
					position={[3, 1, 0]}
					material={new MeshStandardMaterial()}
				/>
				<OrbitControls target-y={1} />
				<axesHelper args={[5]} />
				<gridHelper />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo12;
