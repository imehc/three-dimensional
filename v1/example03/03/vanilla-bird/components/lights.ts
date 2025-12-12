

// DirectionalLight 阳光
// PointLight 灯泡
// RectAreaLight 条形照明或明亮的窗户
// SpotLight 聚光

import { AmbientLight, DirectionalLight, HemisphereLight } from "three";

/**
 * 创建灯光 
 */
const createLights = () => {
  // const ambientLight = new AmbientLight('white', 5); // TODO: 两者的区别
  const ambientLight = new HemisphereLight(
    'white', // bright sky color
    'darkslategrey', // dim ground color
    5, // intensity
  ); // 环境光

  const mainLight = new DirectionalLight('white', 5); // 直射光
  mainLight.position.set(10, 10, 10);
  // mainLight.visible = false; // 隐藏

  return { ambientLight, mainLight };
}

export { createLights };