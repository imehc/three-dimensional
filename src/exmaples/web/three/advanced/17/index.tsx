import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { geoMercator } from "d3";
import type { FeatureCollection, Position } from "geojson";
import type React from "react";
import { Suspense, useCallback, useMemo } from "react";
import {
	AxesHelper,
	BufferGeometry,
	ExtrudeGeometry,
	FileLoader,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Shape,
	Vector3,
} from "three";
import Container from "../../../componets/Container";

/**
 * 3D 地图类型定义
 * 扩展 Object3D 以支持地理属性
 */
type ExpantedObject3D = {
	properties?: string;
} & Object3D;

/**
 * 3D 地图主组件
 *
 * 核心功能：
 * - 使用 D3.js 进行地理数据投影和变换
 * - 使用 Three.js 渲染 3D 地理信息
 * - 支持鼠标交互和动画
 */
const ThreeMap: React.FC = () => {
	return (
		<Container>
			<Canvas>
				<Suspense fallback={null}>
					{/* 轨道控制 - 允许鼠标交互 */}
					<OrbitControls />

					{/* 透视相机配置 */}
					<PerspectiveCamera
						fov={40}
						aspect={2}
						far={10000}
						lookAt={() => [0, 0, 0]}
						position={[0, 0, 300]}
					/>

					{/* 环境光 - 提供整体亮度 */}
					<ambientLight color={0xffffff} intensity={1} />

					{/* 地图数据渲染 */}
					<Map />
				</Suspense>
			</Canvas>
		</Container>
	);
};

/**
 * 地图数据处理和渲染组件
 *
 * 核心步骤：
 * 1. 加载 GeoJSON 格式的地理数据
 * 2. 使用 D3.js geoMercator 投影转换地理坐标
 * 3. 创建立体几何体（ExtrudeGeometry）表示地区
 * 4. 添加边框线条（Line）表示地区边界
 */
const Map: React.FC = () => {
	const { scene } = useThree();

	// D3.js 地理投影配置
	// geoMercator: 墨卡托投影，用于将地理坐标转换为屏幕坐标
	// center: 设置投影中心（北京的经纬度）
	// translate: 平移投影结果到原点
	const projection = useMemo(
		() => geoMercator().center([116.412318, 39.909843]).translate([0, 0]),
		[],
	);

	// 从 CDN 加载中国地理边界数据（GeoJSON 格式）
	// 数据来源：DataV 数据可视化平台
	const loader = useLoader(
		FileLoader,
		"https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
	);

	// 创建一个 Object3D 容器用于存放所有地区数据
	const map = useMemo(() => new Object3D(), []);

	// 绘制立体拉伸几何体（表示地区的立体感）
	const drawExtrudeMesh = useCallback<
		(polygon: Position[], color: string) => Mesh
	>((polygon, color) => {
		// Shape: 用于定义 2D 形状的轮廓
		const shape = new Shape();

		// 遍历多边形的所有顶点
		polygon.forEach((row, i) => {
			// 投影转换：将地理坐标转换为屏幕坐标
			const [x, y] = [row[0], row[1]];

			// 第一个点使用 moveTo，其他点使用 lineTo
			if (i === 0) {
				shape.moveTo(x, -y);
			}
			shape.lineTo(x, -y);
		});

		// ExtrudeGeometry: 将 2D 形状拉伸成 3D 几何体
		// depth: 拉伸高度（10个单位）
		// bevelEnabled: 禁用倒角效果
		const geometry = new ExtrudeGeometry(shape, {
			depth: 10,
			bevelEnabled: false,
		});

		// 基础网格材质
		const material = new MeshBasicMaterial({
			color: color, // 颜色（蓝色或黄色）
			transparent: true, // 启用透明度
			opacity: 0.5, // 透明度值
		});

		return new Mesh(geometry, material);
	}, []);

	// 绘制边框线条（表示地区边界）
	const lineDraw = useCallback<(polygon: Position[], color: string) => Line>(
		(polygon, color) => {
			// BufferGeometry: 用于存储顶点数据的高效数据结构
			const lineGeometry = new BufferGeometry();
			const pointsArray = [];

			// 遍历多边形顶点，创建 3D 点
			polygon.forEach((row) => {
				// 使用 D3.js 投影转换地理坐标
				const [x, y] = projection(row as [number, number])!;
				// 创建三维点（Z 坐标设为 9，位于拉伸几何体上方）
				pointsArray.push(new Vector3(x, -y, 9));
			});

			// 将所有点设置到几何体
			lineGeometry.setFromPoints(pointsArray);

			// 线条材质
			const lineMaterial = new LineBasicMaterial({
				color: color,
			});

			return new Line(lineGeometry, lineMaterial);
		},
		[projection],
	);

	// 处理地理数据
	const operationData = useMemo(() => {
		if (!loader) return;

		// 解析 GeoJSON 数据
		const jsondata = JSON.parse(loader as string) as FeatureCollection;
		const features = jsondata.features;

		// 遍历所有地区特征
		features.forEach((feature) => {
			// 为每个省份创建一个 Object3D 容器
			const province = new Object3D() as ExpantedObject3D;

			// 存储地区名称信息
			province.properties = feature.properties!.name;

			// 根据地区名称设置不同的颜色
			// 特殊处理的地区：重庆市和上海市显示为蓝色
			const color = ["重庆市", "上海市"].includes(feature.properties!.name)
				? "blue"
				: "yellow";

			// 处理 MultiPolygon 类型的几何体（多个多边形）
			if (feature.geometry.type === "MultiPolygon") {
				const coordinates = feature.geometry.coordinates;

				// 遍历所有多边形
				coordinates.forEach((coordinate) => {
					// 遍历每个多边形内的环（外环和内环）
					coordinate.forEach((rows) => {
						// 创建拉伸网格和边框线
						const mesh = drawExtrudeMesh(rows, color);
						const line = lineDraw(rows, color);

						// 添加到省份容器
						province.add(line);
						province.add(mesh);
					});
				});
			}

			// 处理 Polygon 类型的几何体（单个多边形）
			if (feature.geometry.type === "Polygon") {
				const coordinates = feature.geometry.coordinates;

				// 遍历多边形的所有环
				coordinates.forEach((coordinate) => {
					const mesh = drawExtrudeMesh(coordinate, color);
					const line = lineDraw(coordinate, color);

					province.add(line);
					province.add(mesh);
				});
			}

			// 将省份添加到地图容器
			map.add(province);
		});

		// 将地图添加到场景
		scene.add(map);
	}, [drawExtrudeMesh, lineDraw, loader, map, scene]);

	// 显示坐标轴辅助器（用于调试）
	return <primitive object={new AxesHelper(100)} />;
};

export default ThreeMap;