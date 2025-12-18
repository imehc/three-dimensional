import type { Camera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const createControls = (camera: Camera, canvas: HTMLCanvasElement) => {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true; // 阻尼
  // controls.enabled = false; // 为相机或目标设置动画时禁用控件
  // controls.enabled = false; // 禁用控件
  // controls.enableRotate = false; // 禁用控件的其中一种 禁用旋转
  // controls.enableZoom = false; // 禁用控件的其中一种 禁用缩放
  // controls.enablePan = false; // 禁用控件的其中一种 禁用平移 默认鼠标右键
  // controls.listenToKeyEvents(window); // 启用箭头键
  controls.autoRotate = true; // 自动旋转 ⚠️控件禁用，仍然可以工作
  controls.autoRotateSpeed = Math.PI; // 旋转速度
  // controls.minDistance = 5; // 限制缩小的距离
  // controls.maxDistance = 5; // 限制放大的距离
  // controls.minAzimuthAngle = -Infinity; // 限制水平旋转（方位角）的角度 default 弧度
  // controls.maxAzimuthAngle = Infinity; // 限制水平旋转（方位角）的角度 default 弧度
  // controls.minPolarAngle = 0; // 限制垂直（极角）的角度 default 弧度
  // controls.maxPolarAngle = Math.PI; // 限制垂直（极角）的角度 default 弧度

  (controls as typeof controls & { tick?(ms: number): void }).tick = () => {
    controls.update()
  };

  return controls;
}

export { createControls };