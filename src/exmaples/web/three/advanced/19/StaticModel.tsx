import { Center, Html, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

/**
 * 静态模型加载组件
 *
 * 核心功能：
 * - 使用 useGLTF Hook 加载 GLTF/GLB 格式的 3D 模型
 * - 自动居中显示模型
 * - 提供加载中的占位符
 */
export const StaticModel = () => {
  // useGLTF: 加载 GLTF 格式的 3D 模型文件
  // 返回模型的场景对象
  const { scene } = useGLTF("/models/monkey.glb");

  return (
    <Suspense
      fallback={
        // 模型加载中显示加载文案
        <Center>
          <Html>加载中</Html>
        </Center>
      }
    >
      {/* primitive: 使用 Three.js 原生对象
          object={scene}: 渲染加载的模型场景 */}
      <primitive object={scene} />
    </Suspense>
  );
};