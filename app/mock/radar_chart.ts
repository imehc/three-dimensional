const ardarDatao = [
  [
    //iPhone
    { name: "Battery Life", value: 0.22 },
    { name: "Brand", value: 0.28 },
    { name: "Contract Cost", value: 0.29 },
    { name: "Design And Quality", value: 0.17 },
    { name: "Have Internet Connectivity", value: 0.22 },
    { name: "Large Screen", value: 0.02 },
    { name: "Price Of Device", value: 0.21 },
    { name: "To Be A Smartphone", value: 0.5 }
  ],
  [
    //Samsung
    { name: "Battery Life", value: 0.27 },
    { name: "Brand", value: 0.16 },
    { name: "Contract Cost", value: 0.35 },
    { name: "Design And Quality", value: 0.13 },
    { name: "Have Internet Connectivity", value: 0.2 },
    { name: "Large Screen", value: 0.13 },
    { name: "Price Of Device", value: 0.35 },
    { name: "To Be A Smartphone", value: 0.38 }
  ],
  [
    //Nokia Smartphone
    { name: "Battery Life", value: 0.26 },
    { name: "Brand", value: 0.1 },
    { name: "Contract Cost", value: 0.3 },
    { name: "Design And Quality", value: 0.14 },
    { name: "Have Internet Connectivity", value: 0.22 },
    { name: "Large Screen", value: 0.04 },
    { name: "Price Of Device", value: 0.41 },
    { name: "To Be A Smartphone", value: 0.3 }
  ]
];

export type Ardar = {
  brand: string
  online_rate: number
}

const ardarData: Ardar[] = [
  {
    brand: "品牌1",
    online_rate: 0.8444444444444444
  },
  {
    brand: "品牌2",
    online_rate: 0.25
  },
  {
    brand: "品牌3",
    online_rate: 1
  },
  {
    brand: "品牌4",
    online_rate: 1
  },
  {
    brand: "品牌5",
    online_rate: 1
  },
  {
    brand: "品牌6",
    online_rate: 1
  },
  {
    brand: "品牌7",
    online_rate: 1
  },
  // {
  //   brand: "品牌8",
  //   online_rate: 2
  // }
]

export {
  ardarData
}