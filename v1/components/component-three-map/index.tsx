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

type ExpantedObject3D = {
	properties?: string;
} & Object3D;

export const ThreeMap: React.FC = () => {
	return (
		<Canvas>
			<Suspense fallback={null}>
				<OrbitControls />
				<PerspectiveCamera
					fov={40}
					aspect={2}
					far={10000}
					lookAt={() => [0, 0, 0]}
					position={[0, 0, 300]}
				/>

				<ambientLight color={0xffffff} intensity={1} />
				<Map />
			</Suspense>
		</Canvas>
	);
};

const Map: React.FC = () => {
	const { scene } = useThree();

	const projection = useMemo(
		() => geoMercator().center([116.412318, 39.909843]).translate([0, 0]),
		[],
	);

	// http://datav.aliyun.com/portal/school/atlas/area_selector
	const loader = useLoader(
		FileLoader,
		"https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
	);

	const map = useMemo(() => new Object3D(), []);

	// 立体几何图形
	const drawExtrudeMesh = useCallback<
		(polygon: Position[], color: string) => Mesh
	>((polygon, color) => {
		const shape = new Shape();
		polygon.forEach((row, i) => {
			const [x, y] = [row[0], row[1]];
			if (i === 0) {
				shape.moveTo(x, -y);
			}
			shape.lineTo(x, -y);
		});
		// 拉伸
		const geometry = new ExtrudeGeometry(shape, {
			depth: 10,
			bevelEnabled: false,
		});
		const material = new MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: 0.5,
		});
		return new Mesh(geometry, material);
	}, []);

	// 边框图形绘制
	const lineDraw = useCallback<(polygon: Position[], color: string) => Line>(
		(polygon, color) => {
			const lineGeometry = new BufferGeometry();
			const pointsArray = [];
			polygon.forEach((row) => {
				const [x, y] = projection(row as [number, number])!;
				// 创建三维点
				pointsArray.push(new Vector3(x, -y, 9));
			});
			// 放入多个点
			lineGeometry.setFromPoints(pointsArray);
			const lineMaterial = new LineBasicMaterial({
				color: color,
			});
			return new Line(lineGeometry, lineMaterial);
		},
		[projection],
	);

	const operationData = useMemo(() => {
		if (!loader) return;
		const jsondata = JSON.parse(loader as string) as FeatureCollection;
		// 解析数据
		const features = jsondata.features;
		// 全国信息
		features.forEach((feature) => {
			// 单个省份 对象
			const province = new Object3D() as ExpantedObject3D;
			// 地址
			province.properties = feature.properties!.name;
			const color = ["重庆市", "上海市"].includes(feature.properties!.name)
				? "blue"
				: "yellow";
			if (feature.geometry.type === "MultiPolygon") {
				const coordinates = feature.geometry.coordinates;
				// 多个多边形
				coordinates.forEach((coordinate) => {
					// 多边形数据
					coordinate.forEach((rows) => {
						const mesh = drawExtrudeMesh(rows, color);
						const line = lineDraw(rows, color);
						province.add(line);
						province.add(mesh);
					});
				});
			}
			if (feature.geometry.type === "Polygon") {
				const coordinates = feature.geometry.coordinates;
				// 多边形
				coordinates.forEach((coordinate) => {
					const mesh = drawExtrudeMesh(coordinate, color);
					const line = lineDraw(coordinate, color);
					province.add(line);
					province.add(mesh);
				});
			}
			map.add(province);
		});
		scene.add(map);
	}, [drawExtrudeMesh, lineDraw, loader, map, scene]);

	return <primitive object={new AxesHelper(100)} />;
};

export default ThreeMap;