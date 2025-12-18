import { WebGLRenderer } from "three";

/**
 * 创建渲染器
 */
const createRenderer = () => {
  const renderer = new WebGLRenderer({ antialias: true });// antialias 抗锯齿

  // 物理上正确的照明
  // renderer.physicallyCorrectLights = true;

  return renderer;
}

export { createRenderer };