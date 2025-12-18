import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type Camera, Vector3 } from "three";
import type { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import type { Collider } from "./Physics";
import { useKeyboard } from "./use_keyboard";

interface Props {
	ballCount: number;
	octree: Octree;
	colliders: Collider[];
}

const GRAVITY = 30;
const STEPS_PER_FRAME = 5;

export const Player: React.FC<Props> = ({ ballCount, octree, colliders }) => {
	const playerOnFloor = useRef<boolean>(false);
	const playerVelocity = useMemo(() => new Vector3(), []);
	const playerDirection = useMemo(() => new Vector3(), []);
	const capsule = useMemo(
		() => new Capsule(new Vector3(0, 10, 0), new Vector3(0, 11, 0), 0.5),
		[],
	);

	const { camera } = useThree();
	let clicked = 0;

	const throwBall = useCallback<
		(
			camera: Camera,
			capsule: Capsule,
			playerDirection: Vector3,
			playerVelocity: Vector3,
			count: number,
		) => void
	>(
		(camera, capsule, playerDirection, playerVelocity, count) => {
			// 从colliders数组中获取第count个球体的数据
			const { sphere, velocity } = colliders[count % ballCount];
			// 获取摄像机当前世界坐标下的前方向量playerDirection
			camera.getWorldDirection(playerDirection);
			// 将球体中心位置设置为胶囊末端位置,并沿前方向量移动半径1.5倍长度
			sphere?.center
				.copy(capsule.end)
				.addScaledVector(playerDirection, capsule.radius * 1.5);
			// 将球体速度向量初始化为前方向量方向,并缩放为大小50
			velocity.copy(playerDirection).multiplyScalar(50);
			// 将玩家控制产生的速度向量playerVelocity以2倍缩放添加到球体速度上
			velocity.addScaledVector(playerVelocity, 2);
		},
		[ballCount, colliders],
	);

	const onPointerDown = useCallback(() => {
		throwBall(camera, capsule, playerDirection, playerVelocity, clicked++);
	}, [camera, capsule, clicked, playerDirection, playerVelocity, throwBall]);

	useEffect(() => {
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [onPointerDown]);

	useEffect(() => {
		//console.log('adding reference to this capsule collider')
		colliders[ballCount] = { capsule: capsule, velocity: playerVelocity };
	}, [colliders, ballCount, capsule, playerVelocity]);

	const keyboard = useKeyboard();

	/**
	 * 获取摄像机前方向量
	 */
	const getForwardVector = useCallback<
		(camera: Camera, playerDirection: Vector3) => Vector3
	>((camera, playerDirection) => {
		// 获取摄像机当前世界坐标下的前方向量,存储到playerDirection参数中
		camera.getWorldDirection(playerDirection);
		// 将前方向量的y分量(垂直方向)置0
		playerDirection.y = 0;
		// 标准化前方向量,使其长度为1
		playerDirection.normalize();
		return playerDirection;
	}, []);

	const getSideVector = useCallback<
		(camera: Camera, playerDirection: Vector3) => Vector3
	>(() => {
		camera.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();
		// 得到在摄像机平面上左方向的单位向量
		playerDirection.cross(camera.up);
		return playerDirection;
	}, [camera, playerDirection]);

	const controls = useCallback<
		(
			camera: Camera,
			delta: number,
			playerVelocity: Vector3,
			playerOnFloor: boolean,
			playerDirection: Vector3,
		) => void
	>(
		(camera, delta, playerVelocity, playerOnFloor, playerDirection) => {
			// 定义速度增量,是否在地面上影响速度
			const speedDelta = delta * (playerOnFloor ? 25 : 8);
			// A键左移,获取右向量取反乘速度累加到速度上
			keyboard["KeyA"] &&
				playerVelocity.add(
					getSideVector(camera, playerDirection).multiplyScalar(-speedDelta),
				);
			// D键右移,获取右向量乘速度累加到速度上
			keyboard["KeyD"] &&
				playerVelocity.add(
					getSideVector(camera, playerDirection).multiplyScalar(speedDelta),
				);
			keyboard["KeyW"] &&
				playerVelocity.add(
					getForwardVector(camera, playerDirection).multiplyScalar(speedDelta),
				);
			keyboard["KeyS"] &&
				playerVelocity.add(
					getForwardVector(camera, playerDirection).multiplyScalar(-speedDelta),
				);
			if (playerOnFloor) {
				// 如果在地面,空格跳跃使速度上升
				if (keyboard["Space"]) {
					playerVelocity.y = 15;
				}
			}
		},
		[getForwardVector, getSideVector, keyboard],
	);

	const playerCollisions = useCallback<
		(capsule: Capsule, octree: Octree, playerVelocity: Vector3) => boolean
	>((capsule, octree, playerVelocity) => {
		// 使用octree检测胶囊体是否与场景中的任何物体相交
		const result = octree.capsuleIntersect(capsule);
		let playerOnFloor = false;
		if (result) {
			// playerOnFloor标记是否在地面上
			playerOnFloor = result.normal.y > 0;
			if (!playerOnFloor) {
				// 如果不在地面上,进行反弹运动学计算更新速度
				playerVelocity.addScaledVector(
					result.normal,
					-result.normal.dot(playerVelocity),
				);
			}
			// 将胶囊体移动result.depth个单位,抵消相交深度
			capsule.translate(result.normal.multiplyScalar(result.depth));
		}
		// 返回是否在地面标记
		return playerOnFloor;
	}, []);

	const updatePlayer = useCallback<
		(
			camera: Camera,
			delta: number,
			octree: Octree,
			capsule: Capsule,
			playerVelocity: Vector3,
			playerOnFloor: boolean,
		) => boolean
	>(
		(camera, delta, octree, capsule, playerVelocity, playerOnFloor) => {
			// 计算速度衰减
			let damping = Math.exp(-4 * delta) - 1;
			if (!playerOnFloor) {
				// 考虑重力影响更新速度y分量
				playerVelocity.y -= GRAVITY * delta;
				// 应用速度衰减更新速度
				damping *= 0.1; // small air resistance
			}
			// 根据速度和时间增量计算位置增量
			playerVelocity.addScaledVector(playerVelocity, damping);
			const deltaPosition = playerVelocity.clone().multiplyScalar(delta);
			// 更新胶囊体位置
			capsule.translate(deltaPosition);
			// 调用碰撞检测函数,更新是否在地面状态
			playerOnFloor = playerCollisions(capsule, octree, playerVelocity);
			// 更新摄像机位置跟随胶囊体
			camera.position.copy(capsule.end);
			return playerOnFloor;
		},
		[playerCollisions],
	);

	const teleportPlayerIfOob = useCallback<
		(camera: Camera, capsule: Capsule, playerVelocity: Vector3) => void
	>((camera, capsule, playerVelocity) => {
		// 检测摄像机位置y坐标是否小于-100,即掉出地图下限
		if (camera.position.y <= -100) {
			// 清零速度
			playerVelocity.set(0, 0, 0);
			// 将胶囊体重置到起始位置
			capsule.start.set(0, 10, 0);
			capsule.end.set(0, 11, 0);
			// 将摄像机位置和旋转重置
			camera.position.copy(capsule.end);
			camera.rotation.set(0, 0, 0);
		}
	}, []);

	useFrame(({ camera }, delta) => {
		controls(
			camera,
			delta,
			playerVelocity,
			playerOnFloor.current,
			playerDirection,
		);
		const deltaSteps = Math.min(0.05, delta) / STEPS_PER_FRAME;
		for (let i = 0; i < STEPS_PER_FRAME; i++) {
			playerOnFloor.current = updatePlayer(
				camera,
				deltaSteps,
				octree,
				capsule,
				playerVelocity,
				playerOnFloor.current,
			);
		}
		teleportPlayerIfOob(camera, capsule, playerVelocity);
	});

	return null;
};
