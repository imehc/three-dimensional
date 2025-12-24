import { useControls } from "leva";
import { useMemo } from "react";
import { BufferGeometry, DoubleSide, Vector3 } from "three";

export const Polyhedron = () => {
	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const points = [
			new Vector3(-1, 1, -1), //c
			new Vector3(-1, -1, 1), //b
			new Vector3(1, 1, 1), //a

			new Vector3(1, 1, 1), //a
			new Vector3(1, -1, -1), //d
			new Vector3(-1, 1, -1), //c

			new Vector3(-1, -1, 1), //b
			new Vector3(1, -1, -1), //d
			new Vector3(1, 1, 1), //a

			new Vector3(-1, 1, -1), //c
			new Vector3(1, -1, -1), //d
			new Vector3(-1, -1, 1), //b
		];
		g.setFromPoints(points);
		g.computeVertexNormals();
		return g;
	}, []);

	useControls({
		x: {
			value: geometry.attributes.position.array[4],
			min: -1,
			max: 2,
			step: 0.1,
			onChange: (e) => {
				geometry.attributes.position.array[4] = e;
				geometry.attributes.position.needsUpdate = true;
			},
		},
	});

	return (
		<mesh geometry={geometry}>
			<meshNormalMaterial side={DoubleSide} />
		</mesh>
	);
};
