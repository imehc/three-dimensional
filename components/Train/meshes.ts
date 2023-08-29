import { Mesh } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';

const createMeshes = () => {
  const geometries = createGeometries();
  const materials = createMaterials();

  const cabin = new Mesh(geometries.cabin, materials.body); // 货舱网格
  cabin.position.set(1.5, 1.4, 0);

  const chimney = new Mesh(geometries.chimney, materials.detail); // 烟囱网格
  chimney.position.set(-2, 1.9, 0);

  const nose = new Mesh(geometries.nose, materials.body);// 鼻子网格
  nose.position.set(-1, 1, 0);
  nose.rotation.z = Math.PI / 2;

  const smallWhellRear = new Mesh(geometries.whell, materials.detail); // 车轮网格
  smallWhellRear.position.y = 0.5;
  smallWhellRear.rotation.x = Math.PI / 2;

  const smallWhellCenter = smallWhellRear.clone();
  smallWhellCenter.position.x = -1;

  const smallWhellFront = smallWhellRear.clone();
  smallWhellFront.position.x = -2;

  const bigWheel = smallWhellRear.clone(); // 大后轮网格
  bigWheel.position.set(1.5, 0.9, 0);
  bigWheel.scale.set(2, 1.25, 2);

  return {
    nose,
    cabin,
    chimney,
    smallWhellRear,
    smallWhellCenter,
    smallWhellFront,
    bigWheel,
  };
}

export { createMeshes };