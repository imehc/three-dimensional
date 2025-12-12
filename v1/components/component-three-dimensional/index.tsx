import {
	GizmoHelper,
	GizmoViewport,
	Html,
	OrbitControls,
	PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loading } from "components/component-loading";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { SkyBox } from "./SkyBox";
import { StaticModel } from "./StaticModel";

// https://codesandbox.io/p/sandbox/react-three-shi-jiao-zhu-shou-2nd3wj?file=%2Fsrc%2FApp.js%3A1%2C29

const sceneBg = [
	"skyBox1",
	"skyBox2",
	"skyBox3",
	"skyBox4",
	"skyBox5",
	"skyBox6",
] as const;

export const ThreeDimensional: React.FC = () => {
	const [bgUrl, setBgUrl] = useState<(typeof sceneBg)[number]>("skyBox5");
	const [aspect, setAspect] = useState(1.5); // 默认宽高比

	useEffect(() => {
		// 只在客户端获取窗口尺寸
		if (typeof window !== "undefined") {
			setAspect(window.innerWidth / window.innerHeight);

			const handleResize = () => {
				setAspect(window.innerWidth / window.innerHeight);
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	return (
		<div className="h-full relative w-full">
			<div className="absolute bg-[rgba(96,165,250,.7)] left-0 p-1 rounded-br-lg top-0 z-1">
				<div>
					<span>背景：</span>
					<select
						onChange={(e) => setBgUrl(e.target.value as typeof bgUrl)}
						defaultValue={bgUrl}
					>
						{sceneBg.map((bg) => (
							<option key={bg} value={bg}>
								{bg}
							</option>
						))}
					</select>
				</div>
			</div>
			<Canvas gl={{ preserveDrawingBuffer: true }}>
				<Suspense
					fallback={
						<Html className="flex h-full items-center justify-center w-full">
							<Loading />
						</Html>
					}
				>
					<group>
						<OrbitControls makeDefault />
						<directionalLight position={[0, 0, 10]} />
						<pointLight position={[0, 0, 10]} />
						<PerspectiveCamera
							fov={75}
							aspect={aspect}
							near={0.1}
							far={1000}
							position={[2, 3, 2]}
							lookAt={() => [0, 0, 0]}
						/>
						<SkyBox url={bgUrl} />
						<GizmoHelper alignment="bottom-right" margin={[80, 80]}>
							<GizmoViewport
							// axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']}
							// labelColor="white"
							/>
						</GizmoHelper>
					</group>
					<group>
						<StaticModel />
					</group>
				</Suspense>
			</Canvas>
		</div>
	);
};

export default ThreeDimensional;
