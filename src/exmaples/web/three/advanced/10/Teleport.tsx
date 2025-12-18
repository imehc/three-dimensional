import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
	type Group,
	MathUtils,
	type Mesh,
	type MeshBasicMaterial,
	Vector2,
} from "three";
import { useStore } from "./use_store";

export const Teleport = () => {
	const pivotY = useRef<Group>(null);
	const pivotX = useRef<Group>(null);
	const offset = useRef<Group>(null);
	const circleRef = useRef<Mesh>(null);
	const circleEffectRef = useRef<Mesh>(null);
	const date = useRef(0);
	const dragVector = useMemo(() => new Vector2(), []);
	const { orbitmode, setOrbitmode, autoRotate, setAutoRotate, to } = useStore(
		(state) => state,
	);

	useEffect(() => {
		const onPointerMove = (e: PointerEvent) => {
			dragVector.set(e.movementX, e.movementY);

			if (!pivotX.current) return;
			if (!pivotY.current) return;
			if (e.buttons) {
				if (orbitmode) {
					setAutoRotate(false);
					pivotX.current.rotation.x -= e.movementY / 1000;
					pivotY.current.rotation.y -= ((dragVector.x / 5) * Math.PI) / 180;
				} else {
					pivotX.current.rotation.x += ((dragVector.y / 10) * Math.PI) / 180;
					pivotY.current.rotation.y += ((dragVector.x / 10) * Math.PI) / 180;
				}
			}
		};
		document.addEventListener("pointermove", onPointerMove);
		return () => {
			document.removeEventListener("pointermove", onPointerMove);
		};
	});
	useFrame((_, delta) => {
		if (!offset.current) return;
		if (!pivotY.current) return;
		if (orbitmode) {
			offset.current.position.z = MathUtils.lerp(
				offset.current.position.z,
				4,
				delta * 2,
			);
			autoRotate && (pivotY.current.rotation.y += delta / 2);
		} else {
			offset.current.position.z = MathUtils.lerp(
				offset.current.position.z,
				0,
				delta * 2,
			);
		}

		if (!circleEffectRef.current) return;

		pivotY.current.position.lerp(to, delta * 2);
		(circleEffectRef.current.material as MeshBasicMaterial).opacity > 0.02
			? ((circleEffectRef.current.material as MeshBasicMaterial).opacity -=
					delta * 0.5)
			: (circleEffectRef.current.visible = false);
	});

	return (
		<>
			<group ref={pivotY}>
				<group ref={pivotX}>
					<group ref={offset}>
						<PerspectiveCamera makeDefault />
					</group>
				</group>
			</group>
			<mesh
				visible={false}
				rotation-x={-Math.PI / 2}
				position={[0, 0, 0]}
				onPointerMove={({ point }) => {
					if (!circleRef.current) return;
					circleRef.current.position.z = point.z;
					circleRef.current.position.x = point.x;
				}}
				onPointerDown={() => {
					date.current = Date.now();
				}}
				onPointerUp={({ point }) => {
					if (Date.now() - date.current < 200) {
						// a quick click
						setOrbitmode(false);
						to.set(point.x, 1, point.z);
						if (!circleEffectRef.current) return;
						if (!circleRef.current) return;
						circleEffectRef.current.position.copy(circleRef.current.position);
						(circleEffectRef.current.material as MeshBasicMaterial).opacity =
							0.99;
						circleEffectRef.current.visible = true;
					}
				}}
			>
				<planeGeometry args={[19.4, 19.4]} />
			</mesh>
			<mesh ref={circleRef} rotation-x={-Math.PI / 2} position-y={0.011}>
				<ringGeometry args={[0.3, 0.4]} />
				<meshBasicMaterial color={0x000000} transparent opacity={0.25} />
			</mesh>
			<mesh ref={circleEffectRef} rotation-x={-Math.PI / 2} position-y={0.01}>
				<ringGeometry args={[0, 0.3]} />
				<meshBasicMaterial color={0x000000} transparent />
			</mesh>
		</>
	);
};
