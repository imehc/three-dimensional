/**
 * 根据两个维度坐标计算最大轨道半径
 * @param x - x坐标值
 * @param y - y坐标值
 * @returns 计算出的轨道半径，即对角线距离的一半
 */
export function maxOrbit(x: number, y: number) {
  const max = Math.max(x, y),
    diameter = Math.round(Math.sqrt(max * max + max * max));
  return diameter / 2;
}

/**
 * 生成指定范围内的随机整数
 * @param min - 随机数范围的最小值，默认为0
 * @param max - 随机数范围的最大值，默认为0
 * @returns 在指定范围内生成的随机整数
 */
export function random(min = 0, max = 0) {
  if (max === 0) {
    max = min;
    min = 0;
  }

  if (min > max) {
    const hold = max;
    max = min;
    min = hold;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
