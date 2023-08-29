import { Scene, Color } from "three";

/**
 * 创建场景 
 */
const createScene = () => {
  const scene = new Scene();
  scene.background = new Color('skyblue');
  
  return scene;
}

export { createScene };