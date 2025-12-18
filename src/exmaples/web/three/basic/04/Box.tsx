import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, type Mesh, SphereGeometry } from "three";

export const Box: React.FC<ThreeElements["mesh"]> = (props) => {
	const ref = useRef<Mesh>(null);

	const [count, setCount] = useState(0);
	const geometry = useMemo(
		() => [new BoxGeometry(), new SphereGeometry(0.785398)],
		[],
	);

	useEffect(() => {
		console.log(ref.current?.geometry.uuid);
	}, []);

	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.x += delta;
		ref.current.rotation.y += 0.5 * delta;
	});

	return (
		<mesh
			{...props}
			ref={ref}
			onPointerDown={() => setCount((count + 1) % 2)}
			geometry={geometry[count]}
		>
			<meshBasicMaterial color={"lime"} wireframe />
		</mesh>
	);
};
