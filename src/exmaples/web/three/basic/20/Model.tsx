import { Html, useGLTF } from "@react-three/drei";
import { type JSX, useState } from "react";

interface Props {
	url: string;
}

export const Model: React.FC<Props> = ({ url }) => {
	const { scene } = useGLTF(url);
	const [cache, setCache] = useState<Record<string, JSX.Element>>({});

	if (!cache[url]) {
		const annotations: JSX.Element[] = [];

		scene.traverse((o) => {
			if (o.userData.prop) {
				annotations.push(
					<Html
						key={o.uuid}
						position={[o.position.x, o.position.y, o.position.z]}
						distanceFactor={0.25}
						// 如果要在 HTML 标签位于几何图形后面时将其隐藏
						// occlude
						// HTML 将始终面向相机。如果希望它随场景旋转，则可以添加变换选项
						// https://codesandbox.io/s/9keg6?file=/src/App.js
						// transform
					>
						<div className="annotation">{o.userData.prop}</div>
					</Html>,
				);
			}
		});

		console.log(`Caching JSX for url ${url}`);
		setCache({
			...cache,
			[url]: <primitive object={scene}>{annotations}</primitive>,
		});
	}
	return cache[url];
};
