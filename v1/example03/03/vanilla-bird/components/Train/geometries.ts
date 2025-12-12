import { BoxGeometry, CylinderGeometry } from "three";

const createGeometries = () => {
  const cabin = new BoxGeometry(2, 2.55, 1.5);// 货舱几何体

  const nose = new CylinderGeometry( // 鼻子几何体
    0.75, // 顶部半径
    0.75, // 底部半径
    3, // 高度
    12, // 径向段
  );

  const whell = new CylinderGeometry(0.4, 0.4, 1.75, 16); // 车轮几何体

  const chimney = new CylinderGeometry(0.3, 0.1, 0.5); // 烟囱几何体 

  return {
    cabin,
    nose,
    whell,
    chimney,
  };
}

export { createGeometries };