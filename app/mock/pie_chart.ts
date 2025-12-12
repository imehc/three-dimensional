export type PieData = {
  name: string;
  value: number
}

const pieData: PieData[] = [
  {
    name: "加速度计",
    value: 25
  },
  {
    name: "应力计",
    value: 45
  },
  {
    name: "裂缝计",
    value: 2
  },
  {
    name: "倾斜监测仪",
    value: 4
  },
  {
    name: "位移计",
    value: 4
  },
  {
    name: "结构温度传感器",
    value: 2
  },
  {
    name: "温湿度传感器",
    value: 1
  },
  {
    name: "静力水准仪",
    value: 1
  }
]

export { pieData }