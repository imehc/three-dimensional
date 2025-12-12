import { useBounds } from "@react-three/drei";
import { useControls } from "leva";
import { useMemo, useState } from "react";
import { MathUtils, OctahedronGeometry, Vector3 } from "three";

export const Squircle = () => {
	const [n, setN] = useState(2);
	const bounds = useBounds();

	const geometry = useMemo(() => {
		const g = new OctahedronGeometry(1, 16);
		const p = g.attributes.position.array;

		for (let i = 0; i < p.length; i += 3) {
			const v = new Vector3(p[i], p[i + 1], p[i + 2]);
			v.x = Math.tanh(v.x);
			v.y = Math.tanh(v.y);
			v.z = Math.tanh(v.z);
			p[i] = MathUtils.lerp(p[i], v.x, n);
			p[i + 1] = MathUtils.lerp(p[i + 1], v.y, n);
			p[i + 2] = MathUtils.lerp(p[i + 2], v.z, n);
		}
		return g;
	}, [n]);

	useControls("Squircle", {
		segments: {
			value: 2,
			min: -64,
			max: 64,
			step: 0.1,
			onChange: (v) => {
				setN(v);
				bounds.refresh().fit();
			},
		},
	});

	return (
		<mesh geometry={geometry} position-y={1}>
			<meshPhysicalMaterial
				metalness={0}
				roughness={0.36}
				clearcoat={1}
				transmission={1}
				ior={1.53}
				thickness={5}
			/>
		</mesh>
	);
};
