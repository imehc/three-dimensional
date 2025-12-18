import { Canvas } from "@react-three/fiber";
import { getProject, type ISheet } from "@theatre/core";
import { editable as e, PerspectiveCamera, SheetProvider } from "@theatre/r3f";
// import extension from "@theatre/r3f/dist/extension";
// import studio from "@theatre/studio";
import React, { useEffect } from "react";

// 导入 Theatre.js 初始化模块（必须在使用任何 Theatre 功能之前导入）
import demoProjectState from "./theatre-project-state.json";

let demoSheet: ISheet;

/**
 * Theatre.js 初始化配置
 *
 * 必须在模块级别立即初始化，确保项目不会处于 pending 模式
 * 参考: https://www.theatrejs.com/docs/latest/manual/studio
 */
// studio.initialize: 初始化 Theatre.js 编辑器
// studio.initialize();

// // 扩展编辑器功能，支持 React Three Fiber 集成
// studio.extend(extension);

// // 隐藏编辑器 UI（可在需要时调用 studio.ui.show() 显示）
// studio.ui.hide();

/**
 * Theatre.js 编辑器内容组件
 *
 * 核心功能：
 * - 使用 Theatre.js 创建关键帧动画
 * - 集成 @theatre/r3f 以在 Three.js 中使用可编辑属性
 * - 加载预设的动画状态配置
 */
export const TheatreContent: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // 从 demoProjectState 获取或创建项目
    // getProject: 获取或创建一个 Theatre 项目
    // 第二个参数是初始状态配置
    demoSheet = getProject("Demo Project", { state: demoProjectState }).sheet(
      "Demo Sheet",
    );

    // 当项目加载完成后，开始播放动画序列
    demoSheet.project.ready.then(() => {
      console.log("Project loaded!");

      // 播放动画序列
      demoSheet.sequence.play();

      // 标记为就绪
      setIsReady(true);
    });
  }, []);

  // 项目初始化中
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Initializing Theatre.js...</p>
      </div>
    );
  }

  return (
    <Canvas gl={{ preserveDrawingBuffer: true }}>
      {/* SheetProvider: 为子组件提供动画表单上下文 */}
      <SheetProvider sheet={demoSheet}>
        {/* PerspectiveCamera: 可编辑的透视相机
            theatreKey: 在 Theatre 编辑器中的对象标识符
            makeDefault: 设置为默认相机 */}
        <PerspectiveCamera
          theatreKey="Camera"
          makeDefault
          position={[5, 5, -5]}
          fov={75}
        />

        {/* 环境光 - 提供整体光线 */}
        <ambientLight />

        {/* e.pointLight: 可编辑的点光源
            theatreKey: 在 Theatre 编辑器中可编辑位置 */}
        <e.pointLight theatreKey="Light" position={[10, 10, 10]} />

        {/* e.mesh: 可编辑的网格对象
            theatreKey: 在 Theatre 编辑器中可编辑位置、旋转、缩放等属性
            可以通过 Theatre.js 编辑器创建关键帧动画 */}
        <e.mesh theatreKey="Cube">
          {/* 立方体几何体 */}
          <boxGeometry args={[1, 1, 1]} />

          {/* 标准 PBR 材质 */}
          <meshStandardMaterial color="orange" />
        </e.mesh>
      </SheetProvider>
    </Canvas>
  );
};