import { useFrame } from "@react-three/fiber";
import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { type Group, Sphere, Vector3 } from "three";
import type { Octree } from "three/addons/math/Octree.js";
import * as Constants from "./Constants";
import type { Collider } from "./Physics";

interface Prpos {
	id: number;
	radius: number;
	octree: Octree;
	position: number[];
	colliders: Collider[];
	/**
	 * 检测球体与球体之间的碰撞
	 */
	checkSphereCollisions(sphere: Sphere, velocity: Vector3): void;
}

/**
 * 球形碰撞体
 */
export const SphereCollider: React.FC<PropsWithChildren<Prpos>> = ({
	id,
	radius,
	octree,
	position,
	colliders,
	checkSphereCollisions,
	children,
}) => {
	const ref = useRef<Group>(null);
	const sphere = useMemo(
		() => new Sphere(new Vector3(...position), radius),
		[position, radius],
	);
	const velocity = useMemo(() => new Vector3(), []);

	useEffect(() => {
		console.log("adding reference to this sphere collider");
		colliders[id] = { sphere: sphere, velocity: velocity };
	}, [colliders, id, sphere, velocity]);

	const updateSphere = useCallback<
		(delta: number, octree: Octree, sphere: Sphere, velocity: Vector3) => void
	>(
		(delta, octree, sphere, velocity) => {
			// 使用向量加法更新球体中心位置,根据速度向量velocity和时间间隔delta
			sphere.center.addScaledVector(velocity, delta);
			// 检测球体与其他物体是否相交
			const result = octree.sphereIntersect(sphere);
			// 如果检测到相交
			if (result) {
				// 计算法向量和速度向量的点积,作为反弹系数
				const factor = -result.normal.dot(velocity);
				// 根据法向量和系数更新速度向量,实现反弹
				velocity.addScaledVector(result.normal, factor * 1.5);
				// 根据法向量和深度值调整球体位置
				sphere.center.add(result.normal.multiplyScalar(result.depth));
			} else {
				// 考虑重力下落
				velocity.y -= Constants.Gravity * delta;
			}
			const damping = Math.exp(-1.5 * delta) - 1;
			velocity.addScaledVector(velocity, damping);

			checkSphereCollisions(sphere, velocity);
			if (!ref.current) return;
			// 更新三维场景球体对象
			ref.current.position.copy(sphere.center);
		},
		[checkSphereCollisions],
	);

	useFrame((_, delta) => {
		const deltaSteps = Math.min(0.05, delta) / Constants.frameSteps;
		for (let i = 0; i < Constants.frameSteps; i++) {
			updateSphere(deltaSteps, octree, sphere, velocity);
		}
	});

	return <group ref={ref}>{children}</group>;
};
