import { MeshStandardMaterial } from 'three';

const createMaterials = () => {
  const body = new MeshStandardMaterial({ // 车身
    color: 'firebrick',
    flatShading: true,
  });

  const detail = new MeshStandardMaterial({ // 车轮
    color: 'darkslategray',
    flatShading: true,
  });

  return { body, detail };
}

export { createMaterials };