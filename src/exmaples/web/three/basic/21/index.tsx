import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Model } from "./Model";
import Container from "../../../componets/Container";

/**
 * GLTFJSX 模型转换为jsx
 * 生成之后需要自己修改一下
 *
 * 教程  https://sbcode.net/react-three-fiber/gltfjsx/
 *
 * doc  https://github.com/pmndrs/gltfjsx
 *
 * 在线生成  https://gltf.pmnd.rs/
 * ``` bash
 *  npx gltfjsx@latest [模型路径] -o [输出路径] -t
 * ```
 */
const Demo21: React.FC = () => {
	return (
		<Container>
			<Canvas shadows camera={{ position: [0, 0, 1.66] }}>
				<Environment preset="forest" />
				<Model />
				<ContactShadows position={[0, -0.8, 0]} color="#ffffff" />
				<OrbitControls autoRotate />
			</Canvas>
		</Container>
	);
};

export default Demo21;
