import { useGLTF } from "@react-three/drei";
import { useCallback, useRef } from "react";
import type { Sphere, Vector3 } from "three";
import type { Capsule } from "three/addons/math/Capsule.js";
import { Ball } from "./Ball";
import * as Constants from "./Constants";
import { Player } from "./Player";
import { SphereCollider } from "./SphereCollider";
import { useOctree } from "./use_octree";
import { useOctreeHelper } from "./use_octree_helper";
import { GLTFResult } from "../../types/use_gltf";

export type Collider = {
	sphere?: Sphere;
	velocity: Vector3;
	capsule?: Capsule;
};

export const Physics = () => {
	const { nodes, scene } = useGLTF(
		"/models/scene-transformed.glb",
	) as unknown as GLTFResult;
	const octree = useOctree(scene);
	useOctreeHelper(octree);

	const colliders = useRef<Collider[]>([]);

	const checkSphereCollisions = useCallback<
		(sphere: Sphere, velocity: Vector3) => void
	>((sphere, velocity) => {
		for (let i = 0, length = colliders.current.length; i < length; i++) {
			const c = colliders.current[i];
			// 监测是否发生碰撞
			if (c.sphere) {
				// 计算两个球体中心点距离的平方d2
				const d2 = sphere.center.distanceToSquared(c.sphere.center);
				const r = sphere.radius + c.sphere.radius;
				// 计算两个球体半径之和的平方r2
				const r2 = r * r;
				// 判断d2是否小于r2,如果是则表示发生碰撞
				if (d2 < r2) {
					// 计算单位法向量normal
					const normal = Constants.v1
						.subVectors(sphere.center, c.sphere.center)
						.normalize();
					// 计算两个物体在normal方向上的相对速度分量impact1和impact2
					const impact1 = Constants.v2
						.copy(normal)
						.multiplyScalar(normal.dot(velocity));
					const impact2 = Constants.v3
						.copy(normal)
						.multiplyScalar(normal.dot(c.velocity));
					// 根据impact对两个物体的速度velocity和c.velocity进行调整,实现碰撞后反弹
					velocity.add(impact2).sub(impact1);
					c.velocity.add(impact1).sub(impact2);
					// 计算两个球体中心点需要移动的距离d
					const d = (r - Math.sqrt(d2)) / 2;
					// 根据法向量normal对两个球体中心点进行位置调整
					sphere.center.addScaledVector(normal, d);
					c.sphere.center.addScaledVector(normal, -d);
				}
			} else if (c.capsule) {
				// 计算胶囊体的中心点center
				const center = Constants.v1
					.addVectors(c.capsule.start, c.capsule.end)
					.multiplyScalar(0.5);
				// 计算球体和胶囊体半径之和r
				const r = sphere.radius + c.capsule.radius;
				const r2 = r * r;
				// 对胶囊体的两个端点和中心点进行循环
				for (const point of [c.capsule.start, c.capsule.end, center]) {
					// 对每个点计算与球体中心的距离平方d2
					const d2 = point.distanceToSquared(sphere.center);
					// 判断d2是否小于r2,如果是则发生碰撞
					if (d2 < r2) {
						const normal = Constants.v1
							.subVectors(point, sphere.center)
							.normalize();
						// 计算单位法向量normal和速度分量impact
						const impact1 = Constants.v2
							.copy(normal)
							.multiplyScalar(normal.dot(c.velocity));
						const impact2 = Constants.v3
							.copy(normal)
							.multiplyScalar(normal.dot(velocity));
						// 根据impact调整球体和胶囊体的速度velocity和c.velocity
						c.velocity.add(impact2).sub(impact1);
						velocity.add(impact1).sub(impact2);
						// 计算球体中心需要移动的距离d
						const d = (r - Math.sqrt(d2)) / 2;
						// 根据normal移动球体中心
						sphere.center.addScaledVector(normal, -d);
					}
				}
			}
		}
	}, []);

	return (
		<>
			<group dispose={null}>
				<mesh
					castShadow
					receiveShadow
					geometry={nodes.Suzanne007.geometry}
					material={nodes.Suzanne007.material}
					position={[1.74, 1.04, 24.97]}
				/>
			</group>
			{Constants.balls.map(({ position }, i) => (
				<SphereCollider
					key={i}
					id={i}
					radius={Constants.radius}
					octree={octree}
					position={position}
					colliders={colliders.current}
					checkSphereCollisions={checkSphereCollisions}
				>
					<Ball radius={Constants.radius} />
				</SphereCollider>
			))}
			<Player
				ballCount={Constants.ballCount}
				octree={octree}
				colliders={colliders.current}
			/>
		</>
	);
};
