import { BoxGeometry, MathUtils, Mesh, MeshStandardMaterial, TextureLoader } from "three";

/**
 * 创建材质
 */
const createMaterial = () => {
  const textureLoader = new TextureLoader();
  // 加载纹理
  const texture = textureLoader.load(
    // TODO: 当前导入方式仅适用于vite，其它需自行修改
    new URL('../assets/textures/uv-test-bw.png', import.meta.url).href
  );

  // CSS 颜色名称的完整列表: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
  const material = new MeshStandardMaterial({ map: texture, color: 'peachpuff' });
  return material;
}

/**
 *  创建立方体 
 * @deprecated use createMeshGroup
 */
const createCube = () => {
  // 创建几何体
  const geometry = new BoxGeometry(2, 2, 2);

  const material = createMaterial();

  const cube = new Mesh(geometry, material);
  cube.rotation.set(-0.5, -0.1, 0.8);

  const radiansPerSecond = MathUtils.degToRad(30); // 旋转30度

  (cube as (typeof cube) & { tick?(ms: number): void }).tick = (delta) => {
    // increase the cube's rotation each frame
    // cube.rotation.z += radiansPerSecond * delta;
    // cube.rotation.x += radiansPerSecond * delta;
    // cube.rotation.y += radiansPerSecond * delta;
  };

  return cube;
}

export { createCube };