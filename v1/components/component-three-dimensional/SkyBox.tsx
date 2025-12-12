import { useCubeTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import gsap from "gsap";

interface Props {
	url: string;
}

export const SkyBox: React.FC<Props> = ({ url }) => {
	const { scene } = useThree();
	const textures = useCubeTexture(
		[
			`${url}/posx.jpg`, // 右侧
			`${url}/negx.jpg`, // 左侧
			`${url}/posy.jpg`, // 顶部
			`${url}/negy.jpg`, // 底部
			`${url}/posz.jpg`, // 前侧
			`${url}/negz.jpg`, // 后侧
		],
		{ path: "/textures/skyBox/" },
	);

	useEffect(() => {
		gsap.to(scene, {
			duration: 1,
			onUpdate: () => {
				scene.background = textures;
			},
		});
	}, [textures, scene]);

	return null;
};
