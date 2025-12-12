import { type FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
	Color,
	EquirectangularReflectionMapping,
	Fog,
	GridHelper,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MultiplyBlending,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	TextureLoader,
	WebGLRenderer,
} from "three";
import { DRACOLoader } from "three/addons/Addons.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
// import { useControls } from 'leva';
import "./style.css";

export const CarColor: FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	// const cameraOptions = useControls('Camera Position', {
	//   x: { value: -5, min: -10, max: 10, step: 0.1 },
	//   y: { value: 1.4, min: -10, max: 10, step: 0.1 },
	//   z: { value: -4.5, min: -10, max: 10, step: 0.1 },
	// });

	const scene = useMemo(() => {
		//创建一个场景对象，用来模拟3d世界
		const tmp = new Scene();
		//设置一个场景的背景颜色
		tmp.background = new Color(0x333333);
		//这个类中的参数定义了线性雾。也就是说，雾的密度是随着距离线性增大的
		// tmp.fog = new Fog('red', 10, 15);
		tmp.fog = new Fog(0x333333, 10, 15);
		//通过RGBELoader加载hdr文件，它是一种图像格式，将其用作场景的环境映射或者用来创建基于物理的材质
		tmp.environment = new HDRLoader().load("/models/car/venice_sunset_1k.hdr");
		tmp.environment.mapping = EquirectangularReflectionMapping;
		tmp.fog = new Fog(0x333333, 10, 15);
		return tmp;
	}, []);

	const grid = useMemo(() => {
		//创建网格对象，参数1:大小，参数2:网格细分次数,参数3:网格中线颜色，参数4:网格线条颜色
		const tmp = new GridHelper(40, 40, 0xffffff, 0xffffff);
		//网格透明度
		tmp.material.opacity = 1;
		tmp.material.depthWrite = false;
		tmp.material.transparent = true;
		tmp.material.opacity = 0.3;
		return tmp;
	}, []);

	const camera = useMemo(() => {
		const aspectRatio = typeof window !== 'undefined'
			? window.innerWidth / window.innerHeight
			: 1;
		const tmp = new PerspectiveCamera(
			40,
			aspectRatio,
			0.3,
			100,
		);
		tmp.position.set(-5, 1.4, -4.5);
		return tmp;
	}, []);

	const renderer = useMemo(() => {
		if (typeof window === 'undefined') {
			return null as any;
		}
		const tmp = new WebGLRenderer({ antialias: true });
		//设置设备像素比。通常用于避免HiDPI设备上绘图模糊
		tmp.setPixelRatio(window.devicePixelRatio);
		//设置渲染出来的画布范围
		tmp.setSize(window.innerWidth, window.innerHeight);
		return tmp;
	}, []);

	const getControls = useCallback((c: typeof camera, el: HTMLDivElement) => {
		const tmp = new OrbitControls(c, el);
		//你能够将相机向外移动多少（仅适用于PerspectiveCamera），其默认值为Infinity
		tmp.maxDistance = 9;
		//你能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI
		tmp.maxPolarAngle = MathUtils.degToRad(90);
		tmp.target.set(0, 0.5, 0);
		tmp.update();
		return tmp;
	}, []);

	const bodyMaterial = useMemo(() => {
		//物理网格材质(MeshPhysicalMaterial)
		//车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的
		return new MeshPhysicalMaterial({
			color: 0xff0000,
			metalness: 1.0,
			roughness: 0.5,
			clearcoat: 1.0,
			clearcoatRoughness: 0.03,
		});
	}, []);

	const hubMaterial = useMemo(() => {
		//物理网格材质(MeshPhysicalMaterial)
		//车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的
		//汽车轮毂的材质，采用了标准网格材质，threejs解析gltf模型，会用两种材质PBR材质去解析
		return new MeshStandardMaterial({
			color: 0xffffff,
			metalness: 1.0,
			roughness: 0.5,
		});
	}, []);

	const glassMaterial = useMemo(() => {
		//物理网格材质(MeshPhysicalMaterial)
		//车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的
		//汽车轮毂的材质，采用了标准网格材质，threejs解析gltf模型，会用两种材质PBR材质去解析
		//汽车玻璃的材质
		return new MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: 0.25,
			roughness: 0,
			transmission: 1.0,
		});
	}, []);

	useEffect(() => {
		const wheels: Mesh[] = [];
		const { current: container } = containerRef;
		if (!container || !renderer) return;

		// 更新渲染器和相机的尺寸以适配容器
		const width = container.clientWidth;
		const height = container.clientHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		scene.add(grid);
		const controls = getControls(camera, container);
		container.appendChild(renderer.domElement);

		const dracoLoader = new DRACOLoader();
		// TODO: 使用本地打包后不可见，待解决
		dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
		// dracoLoader.setDecoderPath(
		//   new URL(
		//     '/node_modules/three/examples/jsm/libs/draco/gltf/',
		//     new URL(import.meta.url).origin
		//   ).href
		// );
		const loader = new GLTFLoader();
		//设置GLTFLoader加载器使用DRACO来解析我们的模型数据
		loader.setDRACOLoader(dracoLoader);
		loader.load("/models/car/ferrari.glb", (gltf) => {
			//获取到模型的数据
			const carModel = gltf.scene.children[0];
			wheels.push(carModel.getObjectByName("rim_fl") as Mesh);
			wheels.push(carModel.getObjectByName("rim_fr") as Mesh);
			wheels.push(carModel.getObjectByName("rim_rr") as Mesh);
			wheels.push(carModel.getObjectByName("rim_rl") as Mesh);
			//获取模型中指定的模块，将默认材质替换为我们自定义材质
			(carModel.getObjectByName("body") as Mesh).material = bodyMaterial;
			//轮毂的材质替换
			for (const wheel in wheels) {
				if (Object.hasOwn(wheels, wheel)) {
					const element = wheels[wheel];
					element.material = hubMaterial;
				}
			}
			//座椅的材质
			(carModel.getObjectByName("trim") as Mesh).material = hubMaterial;
			//玻璃的材质替换
			(carModel.getObjectByName("glass") as Mesh).material = glassMaterial;
			// shadow阴影效果图片
			const shadow = new TextureLoader().load("/car/models/ferrari_ao.png");
			// 创建一个材质模型
			const mesh = new Mesh(
				new PlaneGeometry(0.655 * 4, 1.3 * 4),
				new MeshBasicMaterial({
					map: shadow,
					blending: MultiplyBlending,
					toneMapped: false,
					transparent: true,
				}),
			);
			mesh.rotation.x = -Math.PI / 2;
			mesh.renderOrder = 2;
			carModel.add(mesh);
			//将模型添加到3D场景中
			scene.add(carModel);
		});

		const render = () => {
			controls.update();
			//performance.now()是一个用于测量代码执行时间的方法。它返回一个高精度的时间戳，表示自页面加载以来的毫秒数
			const time = -performance.now() / 1000;
			//控制车轮的动画效果
			for (let i = 0; i < wheels.length; i++) {
				wheels[i].rotation.x = time * Math.PI * 2;
			}
			//控制网格的z轴移动
			grid.position.z = -time % 1;

			renderer.render(scene, camera);
			requestAnimationFrame(render);
		};
		render();

		// 处理窗口大小变化
		const handleResize = () => {
			if (!container) return;
			const width = container.clientWidth;
			const height = container.clientHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			renderer.dispose();
			container.removeChild(renderer.domElement);
			scene.remove(grid);
		};
	}, [
		bodyMaterial,
		camera,
		getControls,
		glassMaterial,
		grid,
		hubMaterial,
		renderer,
		scene,
	]);

	return (
		<div
			className="relative overflow-hidden overscroll-none w-full h-full bg-[#333] text-[#bbb] text-sm"
		>
			<div className="absolute top-0 left-0 w-full p-4 text-center z-10">
				<div className="inline-block mx-2.5">
					<input
						type="color"
						defaultValue="#ff0000"
						onChange={(e) => bodyMaterial.color.set(e.target.value)}
					/>
					<br />
					<span>Body</span>
				</div>
				<div className="inline-block mx-2.5">
					<input
						type="color"
						defaultValue="#ffffff"
						onChange={(e) => hubMaterial.color.set(e.target.value)}
					/>
					<br />
					<span>Hub</span>
				</div>
				<div className="inline-block mx-2.5">
					<input
						type="color"
						defaultValue="#ffffff"
						onChange={(e) => glassMaterial.color.set(e.target.value)}
					/>
					<br />
					<span>Glass</span>
				</div>
			</div>
			<div ref={containerRef} className="w-full h-full" />
		</div>
	);
};

export default CarColor;
