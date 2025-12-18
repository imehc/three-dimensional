import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Floor } from "./Floor";
import { Lights } from "./Lights";
import { Polyhedron } from "./Polyhedron";
import Container from "../../../componets/Container";

const Scene = () => {
	const texture = useLoader(TextureLoader, "/imgs/grid.png");
	return (
		<>
			<Lights />
			<Polyhedron
				name="meshBasicMaterial"
				position={[-3, 1, 0]}
			>
				<meshBasicMaterial map={texture} />
			</Polyhedron>
			<Polyhedron
				name="meshNormalMaterial"
				position={[-1, 1, 0]}
			>
				<meshNormalMaterial flatShading />
			</Polyhedron>
			<Polyhedron
				name="meshPhongMaterial"
				position={[1, 1, 0]}
			>
				<meshPhongMaterial flatShading map={texture} />
			</Polyhedron>
			<Polyhedron
				name="meshStandardMaterial"
				position={[3, 1, 0]}
			>
				<meshStandardMaterial flatShading map={texture} />
			</Polyhedron>
			<Floor />
			<OrbitControls target={[0, 1, 0]} />
			<axesHelper args={[5]} />
			<Stats />
		</>
	);
};

/**
 * 使用图片纹理
 */
const Demo15: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [4, 4, 1.5] }} shadows>
				<Scene />
			</Canvas>
		</Container>
	);
};

export default Demo15;
