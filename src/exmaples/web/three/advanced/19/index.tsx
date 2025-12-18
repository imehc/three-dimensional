import {
  GizmoHelper,
  GizmoViewport,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { SkyBox } from "./SkyBox";
import { StaticModel } from "./StaticModel";
import Loading from "../../../componets/Loading";
import Container from "../../../componets/Container";

/**
 * 可用的天空盒列表
 * 每个天空盒由 6 张图片组成（立方体的 6 个面）
 */
const sceneBg = [
  "skyBox1",
  "skyBox2",
  "skyBox3",
  "skyBox4",
  "skyBox5",
  "skyBox6",
] as const;

/**
 * 3D 场景背景切换组件
 *
 * 核心功能：
 * - 提供多个天空盒背景供选择
 * - 实时切换场景背景
 * - 响应式布局，自适应窗口大小
 * - 显示 Gizmo 助手（坐标系可视化）
 */
export const ThreeDimensional: React.FC = () => {
  // 当前选中的背景
  const [bgUrl, setBgUrl] = useState<(typeof sceneBg)[number]>("skyBox5");

  // 窗口宽高比（用于相机投影）
  const [aspect, setAspect] = useState(1.5);

  useEffect(() => {
    // 仅在客户端获取窗口尺寸
    if (typeof window !== "undefined") {
      // 初始化宽高比
      setAspect(window.innerWidth / window.innerHeight);

      // 监听窗口大小变化
      const handleResize = () => {
        setAspect(window.innerWidth / window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      // 清理事件监听器
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <Container>
      {/* 背景选择下拉菜单 */}
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

      {/* 3D 渲染画布 */}
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <Suspense
          fallback={
            <Html className="flex h-full items-center justify-center w-full">
              <Loading />
            </Html>
          }
        >
          {/* 主要组件组 */}
          <group>
            {/* 轨道控制 - 允许鼠标交互 */}
            <OrbitControls makeDefault />

            {/* 方向光 - 平行光源，用于投影和阴影 */}
            <directionalLight position={[0, 0, 10]} />

            {/* 点光源 - 从单点发出的光线 */}
            <pointLight position={[0, 0, 10]} />

            {/* 透视相机配置 */}
            <PerspectiveCamera
              fov={75} // 视野角度（度）
              aspect={aspect} // 宽高比
              near={0.1} // 近裁剪面
              far={1000} // 远裁剪面
              position={[2, 3, 2]} // 相机位置
              lookAt={() => [0, 0, 0]} // 相机指向点
            />

            {/* 天空盒背景 - 根据 bgUrl 切换 */}
            <SkyBox url={bgUrl} />

            {/* Gizmo 助手 - 显示坐标系和视角切换
                alignment: 对齐方式（右下角）
                margin: 距离边框的距离 */}
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport />
            </GizmoHelper>
          </group>

          {/* 模型渲染组 */}
          <group>
            {/* 静态模型加载 */}
            <StaticModel />
          </group>
        </Suspense>
      </Canvas>
    </Container>
  );
};

export default ThreeDimensional;