import { Environment, Hud, OrthographicCamera } from "@react-three/drei";
import { useLoader, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { TextureLoader } from "three";
import Button from "./Button";

export default function MaterialMenu({
	setSelected,
}: {
	setSelected(n: number): void;
}) {
	const texture = useLoader(TextureLoader, [
		"/v212/img/fabric_pattern_05.jpg",
		"/v212/img/leather_red.jpg",
		"/v212/img/fabric_pattern_07.jpg",
		"/v212/img/book_pattern.jpg",
		"/v212/img/denim_fabric_02.jpg",
	]);

	const { size } = useThree();

	// 根据视口宽度自动计算 zoom 值
	const zoom = useMemo(() => {
		// 基准宽度 800px 对应 zoom 16
		// 根据实际宽度按比例调整
		return (size.width / 800) * 24;
	}, [size.width]);

	return (
		<Hud>
			<OrthographicCamera makeDefault position={[0, 0, 2]} zoom={zoom} />
			<Environment preset="forest" />
			<Button
				id={0}
				texture={texture[0]}
				position={[-6, -6, 0]}
				setSelected={setSelected}
			/>
			<Button
				id={1}
				texture={texture[1]}
				position={[-3, -6, 0]}
				roughness={0.2}
				setSelected={setSelected}
			/>
			<Button
				id={2}
				texture={texture[2]}
				position={[-0, -6, 0]}
				setSelected={setSelected}
			/>
			<Button
				id={3}
				texture={texture[3]}
				position={[3, -6, 0]}
				roughness={0.5}
				setSelected={setSelected}
			/>
			<Button
				id={4}
				texture={texture[4]}
				position={[6, -6, 0]}
				setSelected={setSelected}
			/>
		</Hud>
	);
}
