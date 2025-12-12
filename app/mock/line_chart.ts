export type Data = {
  value: number;
  time: Date;
}
export type ObjectData = {
  [key: string]: Data[];
}
export type MockData = {
  key: "x" | "y" | "z"
} & Data

const random = (length: number) => {
  return [...new Array(length)].map((_, i) => {
    return {
      time: new Date(`2022-11-28 0${i}:00:00`),
      value: Number((Math.random() * 500 + 1).toFixed(0))
    } as MockData
  })
}
const random2 = (length: number) => {
  return [...new Array(length)].map((_, i) => {
    return {
      time: new Date(`2022-11-28 0${i}:00:00`),
      value: null
    }
  })
}

const random3 = (length: number) => {
  return [...new Array(length)].map((_, i) => {
    return {
      time: new Date(`2022-11-28 0${i}:00:00`),
      value: Number((Math.random() * 100  -99).toFixed(0))
    }
  })
}
const random4 = (length: number, range?: number) => {
  return [...new Array(length)].map((_, i) => {
    return {
      time: new Date(`2022-11-$10 0${i}:00:00`),
      value: Number((Math.random() * -50 + 1).toFixed(0)),
      value2: Number((Math.random() * 220 + 1).toFixed(0)),
      value3: Number((Math.random() * 50 + 1).toFixed(0)),
      value4: Number((Math.random() * 100 + 1).toFixed(0)),
    }
  })
}

const addKey = (data: Data[], key: Pick<MockData, 'key'>['key']): MockData[] => {
  return data.map((d) => ({
    ...d,
    key
  }))
}

const x = addKey(random(24), 'x')
const y = addKey(random3(24), 'y')
const z = addKey(random(24), 'z')
const data3 = [...random4(24)]

// const x = (random(24))
// const y = (random(24))
// const z = (random(24))

const d = { x, y, z }

const data2 = [...d.x, ...d.y]
// const data2 = [...d.z]
// const data = [...d.x,]
// const data = [{ x }, { y }, { z }]

// const data = [x, y, z]
const data: ObjectData = { x, y, z }

export {
  data,
  data2,
  data3
}



const legendData = [
  {
    name: "分类一",
    color: "#f5a209",
  },
  {
    name: "分类二",
    color: "#f54d33",
  },
  {
    name: "分类三",
    color: "#26fd00",
  }
]

type Thresholds = {
  time: Date;
  value?: number
}
const mockThresholds: Thresholds[] = [
  {
    time: new Date("2022-11-17 13:32"),
    value: 70
  },
  {
    time: new Date("2022-11-17 14:32"),
    // value: 150
  }
]

export {
  legendData,
  mockThresholds
}