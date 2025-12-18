import { Html, OrbitControls, Sky } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box3, type PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls as OrbitControlsProps } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Container from "../../../componets/Container";

/**
 * 本地模型预览组件
 *
 * 核心功能：
 * - 上传本地GLTF/GLB格式的3D模型
 * - 自动调整相机位置以适配模型大小
 * - 使用OrbitControls进行交互控制
 */
export const SelectModel = () => {
	// 本地模型URL（由文件上传生成）
	const [localUrl, setLocalUrl] = useState<string>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 处理文件选择事件
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			throw new Error("未选择文件");
		}
		// 使用 URL.createObjectURL 创建本地文件URL
		setLocalUrl(window.URL.createObjectURL(file));
	};

	return (
		<Container>
			{/* 上传按钮 */}
			<div className="absolute left-2 top-2 z-10">
				<input
					ref={fileInputRef}
					type="file"
					accept="model/gltf-binary,.glb,.gltf"
					onChange={handleFileChange}
					className="hidden"
				/>
				<button
					type="button"
					className="btn"
					onClick={() => fileInputRef.current?.click()}
				>
					Upload Model
				</button>
			</div>
			{/* 模型预览组件 */}
			<PreviewModel url={localUrl} />
		</Container>
	);
};

export default SelectModel;

interface Props {
	/**
	 * 展示模型的地址
	 */
	url?: string;
}

/**
 * 3D 场景渲染组件
 * 使用 Canvas 作为渲染容器
 */
const PreviewModel: React.FC<Props> = (props) => {
	return (
		<Canvas className="h-full w-full">
			{/* Sky 组件提供天空背景 */}
			<Sky />
			{/* Suspense 用于处理异步加载状态 */}
			<Suspense
				fallback={
					<Html className="flex flex-col h-full items-center justify-center w-full">
						<p className="text-lg whitespace-nowrap">加载中...</p>
					</Html>
				}
			>
				{props.url && <Model url={props.url} />}
			</Suspense>
		</Canvas>
	);
};

/**
 * 模型加载和渲染组件
 *
 * 核心功能：
 * - GLTFLoader: 加载GLTF/GLB格式的3D模型文件
 * - Box3: 计算模型的包围盒（边界框）
 * - 自动调整相机位置以最佳展示模型
 */
const Model: React.FC<Required<Props>> = ({ url }) => {
	// GLTFLoader 用于加载GLTF格式的3D模型文件
	const { scene } = useLoader(GLTFLoader, url, (progress) => { });
	const { camera } = useThree();
	const controlsRef = useRef<OrbitControlsProps>(null);

	// 计算模型的包围盒（包含模型的最小矩形框）
	const box = useMemo(() => new Box3().setFromObject(scene), [scene]);

	// 获取包围盒的中心点作为OrbitControls的目标点
	const target = useMemo(
		() => new Vector3().copy(box.getCenter(new Vector3())),
		[box],
	);

	// 当模型加载完成后，自动调整相机位置
	useEffect(() => {
		if (!controlsRef.current) {
			return;
		}

		// 计算模型的大小
		const distance = box.getSize(new Vector3()).length();

		// 根据相机FOV和模型大小计算偏移距离
		// 使用三角函数确保模型完全在视景体内
		const offset =
			distance /
			Math.tan((Math.PI / 180.0) * (camera as PerspectiveCamera).fov * 0.5);

		// 设置控制器的目标点为模型中心
		controlsRef.current.target.copy(target);

		// 设置相机位置：在模型中心上方且后方
		controlsRef.current.object.position.set(
			target.x,
			target.y,
			target.z + offset,
		);

		// 更新控制器状态
		controlsRef.current.update();
	}, [box, camera, target]);

	return (
		<primitive object={scene}>
			{/* OrbitControls 提供鼠标交互控制（旋转、缩放、移动） */}
			<OrbitControls
				ref={controlsRef as any}
				target={target}
				enableDamping={true} // 启用阻尼效果，使旋转更平滑
				dampingFactor={0.1} // 阻尼系数，范围 0-1，值越小阻尼越强
			/>
		</primitive>

	);
};