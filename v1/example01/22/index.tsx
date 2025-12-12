import { Center, Environment, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Button } from "./Button";
import { Rig } from "./Rig";

/**
 * 使用插值 （Lerp） 对对象变换和材质属性进行动画处理。
 */
const Demo22: React.FC = () => {
	return (
		<Canvas camera={{ position: [0, 0, 5] }}>
			<Environment preset="forest" background />
			<Center>
				{[...Array(5).keys()].map((x) =>
					[...Array(3).keys()].map((y) => (
						<Button key={x + y * 5} position={[x * 2.5, y * 2.5, 0]} />
					)),
				)}
			</Center>
			<Rig />
			<Stats />
		</Canvas>
	);
};

export default Demo22;
