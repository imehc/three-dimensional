import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

/**
 * 带鼠标事件的立方体组件
 *
 * 核心概念：
 * - onPointerDown: 鼠标按下事件
 * - onPointerUp: 鼠标释放事件
 * - onPointerOver: 鼠标移入事件（类似 hover）
 * - onPointerOut: 鼠标移出事件
 * - onUpdate: 组件更新事件
 * - 事件对象 e 包含 object 属性，可访问 mesh 的属性（如 name）
 */
export const Box: React.FC<ThreeElements["mesh"]> = (props) => {
	const ref = useRef<Mesh>(null);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += 1 * delta;
		ref.current.rotation.y += 0.5 * delta;
	});

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerDown={(e) => console.log(`pointer down ${e.object.name}`)}
			onPointerUp={(e) => console.log(`pointer up ${e.object.name}`)}
			onPointerOver={(e) => console.log(`pointer over ${e.object.name}`)}
			onPointerOut={(e) => console.log(`pointer out ${e.object.name}`)}
			onUpdate={(self) => console.log(self)}
		>
			<boxGeometry />
			<meshBasicMaterial color={0x00ff00} wireframe />
		</mesh>
	);
};