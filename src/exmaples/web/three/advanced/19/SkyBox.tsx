import { useCubeTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import gsap from "gsap";

interface Props {
    /**
     * 天空盒资源 URL 前缀
     * 例如: "skyBox1" 会加载 /textures/skyBox/skyBox1/ 目录下的 6 张图片
     */
    url: string;
}

/**
 * 天空盒组件
 *
 * 核心功能：
 * - 使用立方体纹理创建环境背景
 * - 使用 GSAP 实现平滑的背景切换动画
 * - 支持加载 6 张贴图组成的立方体背景
 */
export const SkyBox: React.FC<Props> = ({ url }) => {
    const { scene } = useThree();

    // useCubeTexture: 加载立方体纹理（6 张图片）
    // 参数顺序对应立方体的 6 个面：右、左、顶、底、前、后
    const textures = useCubeTexture(
        [
            `${url}/posx.jpg`, // 右侧（+X 轴）
            `${url}/negx.jpg`, // 左侧（-X 轴）
            `${url}/posy.jpg`, // 顶部（+Y 轴）
            `${url}/negy.jpg`, // 底部（-Y 轴）
            `${url}/posz.jpg`, // 前侧（+Z 轴）
            `${url}/negz.jpg`, // 后侧（-Z 轴）
        ],
        { path: "/textures/skyBox/" },
    );

    // 当背景图片加载完成后，使用动画切换场景背景
    useEffect(() => {
        // 使用 GSAP 创建 1 秒的过渡动画
        gsap.to(scene, {
            duration: 1,
            onUpdate: () => {
                // 在动画过程中更新场景背景
                scene.background = textures;
            },
        });
    }, [textures, scene]);

    // 此组件不需要渲染任何可见元素
    return null;
};