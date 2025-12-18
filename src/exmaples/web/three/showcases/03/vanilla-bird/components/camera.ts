import { PerspectiveCamera } from "three";

/**
 * 创建相机
 */
const createCamera = () => {
  const camera = new PerspectiveCamera(
    35,// 视野
    1, // 纵横比
    0.1,// 近剪裁平面 近于该不可见
    100// 远剪裁平面 远于该不可见
  );
  camera.position.set(0, 0, 10);

  return camera;
}

export { createCamera };