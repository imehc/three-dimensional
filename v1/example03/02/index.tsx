import {
	Environment,
	Lightformer,
	useGLTF,
	useTexture,
} from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
	BallCollider,
	CuboidCollider,
	Physics,
	type RapierRigidBody,
	RigidBody,
	type RigidBodyOptions,
	useRopeJoint,
	useSphericalJoint,
} from "@react-three/rapier";
import { useControls } from "leva";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	CatmullRomCurve3,
	type Mesh,
	type MeshPhysicalMaterial,
	RepeatWrapping,
	Vector3,
} from "three";

extend({ MeshLineGeometry, MeshLineMaterial });
useGLTF.preload("/card/tag.glb");
useTexture.preload("/card/band.jpeg");

/**
 * @see https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber
 */
export const Demo0302 = () => {
	const { debug } = useControls({ debug: false });
	return (
		<Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
			<ambientLight intensity={Math.PI} />
			<Physics
				debug={debug}
				interpolate
				gravity={[0, -40, 0]}
				timeStep={1 / 60}
			>
				<Band />
			</Physics>
			<Environment background blur={0.75}>
				<color attach="background" args={["black"]} />
				<Lightformer
					intensity={2}
					color="white"
					position={[0, -1, 5]}
					rotation={[0, 0, Math.PI / 3]}
					scale={[100, 0.1, 1]}
				/>
				<Lightformer
					intensity={3}
					color="white"
					position={[-1, -1, 1]}
					rotation={[0, 0, Math.PI / 3]}
					scale={[100, 0.1, 1]}
				/>
				<Lightformer
					intensity={3}
					color="white"
					position={[1, 1, 1]}
					rotation={[0, 0, Math.PI / 3]}
					scale={[100, 0.1, 1]}
				/>
				<Lightformer
					intensity={10}
					color="white"
					position={[-10, 0, 14]}
					rotation={[0, Math.PI / 2, Math.PI / 3]}
					scale={[100, 10, 1]}
				/>
			</Environment>
		</Canvas>
	);
};

const Band = () => {
	const band = useRef<Mesh>(null),
		fixed = useRef<RapierRigidBody>(null),
		j1 = useRef<RapierRigidBody>(null),
		j2 = useRef<RapierRigidBody>(null),
		j3 = useRef<RapierRigidBody>(null),
		card = useRef<RapierRigidBody>(null);
	const { vec, ang, rot, dir } = useMemo(
		() => ({
			vec: new Vector3(),
			ang: new Vector3(),
			rot: new Vector3(),
			dir: new Vector3(),
		}),
		[],
	);
	const segmentProps = {
		type: "dynamic",
		canSleep: true,
		colliders: false,
		angularDamping: 2,
		linearDamping: 2,
	} satisfies Pick<
		RigidBodyOptions,
		"type" | "canSleep" | "colliders" | "angularDamping" | "linearDamping"
	>;
	const { nodes, materials } = useGLTF("/card/tag.glb");
	const texture = useTexture("/card/band.jpeg");
	const { width, height } = useThree((state) => state.size);
	const curve = useMemo(() => {
		return new CatmullRomCurve3([
			new Vector3(),
			new Vector3(),
			new Vector3(),
			new Vector3(),
		]);
	}, []);
	const [dragged, drag] = useState<false | Vector3>(false);
	const [hovered, hover] = useState(false);

	useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
	useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
	useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
	useSphericalJoint(j3, card, [
		[0, 0, 0],
		[0, 1.45, 0],
	]);

	useEffect(() => {
		if (hovered) {
			document.body.style.cursor = dragged ? "grabbing" : "grab";
			return () => void (document.body.style.cursor = "auto");
		}
	}, [hovered, dragged]);

	useFrame((state, delta) => {
		if (dragged) {
			vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
			dir.copy(vec).sub(state.camera.position).normalize();
			vec.add(dir.multiplyScalar(state.camera.position.length()));
			[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
			card.current?.setNextKinematicTranslation({
				x: vec.x - dragged.x,
				y: vec.y - dragged.y,
				z: vec.z - dragged.z,
			});
		}
		if (fixed.current) {
			// Calculate catmul curve
			curve.points[0].copy(j3.current!.translation() as Vector3);
			curve.points[1].copy(j2.current!.translation() as Vector3);
			curve.points[2].copy(j1.current!.translation() as Vector3);
			curve.points[3].copy(fixed.current!.translation() as Vector3);
			(band.current!.geometry as any).setPoints(curve.getPoints(32));
			// Tilt it back towards the screen
			ang.copy(card.current!.angvel() as Vector3);
			rot.copy(card.current!.rotation() as unknown as Vector3);
			card.current!.setAngvel(
				{ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
				false,
			);
		}
	});

	curve.curveType = "chordal";
	texture.wrapS = texture.wrapT = RepeatWrapping;

	return (
		<>
			<group position={[0, 4, 0]}>
				<RigidBody ref={fixed} {...segmentProps} />
				<RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
					<BallCollider args={[0.1]} />
				</RigidBody>
				<RigidBody
					position={[2.0, 0, 0]}
					ref={card}
					{...segmentProps}
					type={dragged ? "kinematicPosition" : "dynamic"}
				>
					<CuboidCollider args={[0.8, 1.125, 0.01]} />
					<group
						scale={2.25}
						position={[0, -1.2, -0.05]}
						onPointerOver={() => hover(true)}
						onPointerOut={() => hover(false)}
						onPointerUp={(e) => (
							(e.target as unknown as Element)?.releasePointerCapture(
								e.pointerId,
							),
							drag(false)
						)}
						onPointerDown={(e) => (
							(e.target as unknown as Element)?.setPointerCapture(e.pointerId),
							drag(
								new Vector3()
									.copy(e.point)
									.sub(vec.copy(card.current!.translation() as Vector3)),
							)
						)}
					>
						<mesh geometry={(nodes.card as Mesh).geometry}>
							<meshPhysicalMaterial
								map={(materials.base as MeshPhysicalMaterial).map}
								map-anisotropy={16}
								clearcoat={1}
								clearcoatRoughness={0.15}
								roughness={0.3}
								metalness={0.5}
							/>
						</mesh>
						<mesh
							geometry={(nodes.clip as Mesh).geometry}
							material={materials.metal}
							material-roughness={0.3}
						/>
						<mesh
							geometry={(nodes.clamp as Mesh).geometry}
							material={materials.metal}
						/>
					</group>
				</RigidBody>
			</group>
			<mesh ref={band}>
				<meshLineGeometry />
				<meshLineMaterial
					color="white"
					depthTest={false}
					resolution={[width, height]}
					useMap
					map={texture}
					repeat={[-3, 1]}
					lineWidth={1}
				/>
			</mesh>
		</>
	);
};

export default Demo0302;
