import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
	MeshBasicMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
} from "three";
import { Floor } from "./Floor";
import { Lights } from "./Lights";
import { Polyhedron } from "./Polyhedron";
import Container from "../../../componets/Container";

/**
 * 阴影
 */
const Demo14: React.FC = () => {
	return (
		<Container>
			<Canvas camera={{ position: [4, 4, 1.5] }} shadows>
				<Lights />
				<Polyhedron
					name="meshBasicMaterial"
					position={[-3, 1, 0]}
					material={new MeshBasicMaterial({ color: "yellow" })}
				/>
				<Polyhedron
					name="meshNormalMaterial"
					position={[-1, 1, 0]}
					material={new MeshNormalMaterial({ flatShading: true })}
				/>
				<Polyhedron
					name="meshPhongMaterial"
					position={[1, 1, 0]}
					material={new MeshPhongMaterial({ color: "lime", flatShading: true })}
				/>
				<Polyhedron
					name="meshStandardMaterial"
					position={[3, 1, 0]}
					material={
						new MeshStandardMaterial({
							color: 0xff0033,
							flatShading: true,
						})
					}
				/>
				<Floor />
				<OrbitControls target={[2, 2, 0]} />
				<axesHelper args={[5]} />
				<Stats />
			</Canvas>
		</Container>
	);
};

export default Demo14;
