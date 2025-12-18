import {
	Environment,
	Html,
	OrbitControls,
	useProgress,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ArmChair from "./ArmChair";
import Room from "./Room";
import Container from "../../../componets/Container";

/**
 * 物料拾取 copy
 */
export const Demo2v12 = () => {
	return (
		<Container>
			<Canvas shadows camera={{ position: [2.25, 1, 2.25] }}>
				<Suspense fallback={<Loader />}>
					<Environment
						preset="forest"
						background
						ground={{
							height: 2,
							radius: 115,
							scale: 100,
						}}
					/>
					<directionalLight
						position={[5, 1.5, 3]}
						intensity={2}
						castShadow
						shadow-mapSize-width={1024}
						shadow-mapSize-height={1024}
						shadow-bias={-0.0001}
					/>
					<Room />
					<ArmChair />
					<OrbitControls
						target={[1.5, 0.8, 1.5]}
						minPolarAngle={0}
						maxPolarAngle={Math.PI / 2 + Math.PI / 12}
					/>
				</Suspense>
			</Canvas>
			{/* <div id="instructions">
				Models from
				<a href="https://sweethome3d.com" target="_blank" rel="noreferrer">
					Sweet Home 3D
				</a>
				<br />
				Textures from
				<a href="https://polyhaven.com" target="_blank" rel="noreferrer">
					Poly Haven
				</a>
			</div> */}
		</Container>
	);
};

function Loader() {
	const { progress } = useProgress();
	return (
		<Html center className="text-white">
			{progress.toFixed(2)} % loaded
		</Html>
	);
}

export default Demo2v12;
