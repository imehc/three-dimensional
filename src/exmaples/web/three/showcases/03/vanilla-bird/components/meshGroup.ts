import { Group, MathUtils, Mesh, MeshStandardMaterial, SphereGeometry, } from "three";

/**
 * 创建组
 * @deprecated
 */
const createMeshGroup = () => {
  const group = new Group();

  const geometry = new SphereGeometry(0.25, 16, 16); // 原型球体
  const material = new MeshStandardMaterial({ // 材质
    color: 'indigo',
  });
  const protoSphere = new Mesh(geometry, material);
  group.add(protoSphere);

  for (let i = 0; i < 1; i += 0.05) {
    const sphere = protoSphere.clone();
    sphere.position.x = Math.cos(2 * Math.PI * i);
    sphere.position.y = Math.sin(2 * Math.PI * i);
    // sphere.position.z = -i * 5;

    sphere.scale.multiplyScalar(0.01 + i);

    group.add(sphere);
  }
  group.scale.multiplyScalar(2); // 扩大为两倍

  const radiansPerSecond = MathUtils.degToRad(30);
  (group as (typeof group) & { tick?(ms: number): void }).tick = (delta) => {
    group.rotation.z -= delta * radiansPerSecond;
  }

  return group;
}

export { createMeshGroup };