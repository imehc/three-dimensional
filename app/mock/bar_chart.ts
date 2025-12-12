export type BarData = {
  severity: number;
  count: number
  day: Date
}

const barData: BarData[] = [
  {
    severity: 3,
    count: 100,
    day: new Date("2022-11-23T00:00:00Z")
  },
  {
    severity: 1,
    count: 11388,
    day: new Date("2022-11-23T00:00:00Z")
  },
  {
    severity: 3,
    count: 1000,
    day: new Date("2022-11-24T00:00:00Z")
  },
  {
    severity: 1,
    count: 14008,
    day: new Date("2022-11-24T00:00:00Z")
  },
  {
    severity: 1,
    count: 16666,
    day: new Date("2022-11-25T00:00:00Z")
  },
  {
    severity: 3,
    count: 22707,
    day: new Date("2022-11-25T00:00:00Z")
  },
  {
    severity: 3,
    count: 20207,
    day: new Date("2022-11-26T00:00:00Z")
  },
  {
    severity: 1,
    count: 16145,
    day: new Date("2022-11-26T00:00:00Z")
  },
  {
    severity: 1,
    count: 14780,
    day: new Date("2022-11-27T00:00:00Z")
  },
  {
    severity: 3,
    count: 20160,
    day: new Date("2022-11-27T00:00:00Z")
  },
  {
    severity: 1,
    count: 11954,
    day: new Date("2022-11-28T00:00:00Z")
  },
  {
    severity: 3,
    count: 18547,
    day: new Date("2022-11-28T00:00:00Z")
  },
  {
    severity: 3,
    count: 16609,
    day: new Date("2022-11-29T00:00:00Z")
  },
  {
    severity: 1,
    count: 16545,
    day: new Date("2022-11-29T00:00:00Z")
  },
  {
    severity:3,
    count: 21445,
    day: new Date("2022-11-30T00:00:00Z")
  },
  {
    severity: 1,
    count: 16013,
    day: new Date("2022-11-30T00:00:00Z")
  },
  {
    severity: 3,
    count: 10028,
    day: new Date("2022-12-01T00:00:00Z")
  },
  {
    severity: 1,
    count: 5088,
    day: new Date("2022-12-01T00:00:00Z")
  },
  // {
  //   severity: 3,
  //   count: 10028,
  //   day: new Date("2022-12-02T00:00:00Z")
  // },
  // {
  //   severity: 1,
  //   count: 5088,
  //   day: new Date("2022-12-02T00:00:00Z")
  // },
  // {
  //   severity: 3,
  //   count: 10028,
  //   day: new Date("2022-12-03T00:00:00Z")
  // },
  // {
  //   severity: 1,
  //   count: 5088,
  //   day: new Date("2022-12-03T00:00:00Z")
  // },
  // {
  //   severity: 3,
  //   count: 10028,
  //   day: new Date("2022-12-04T00:00:00Z")
  // },
  // {
  //   severity: 1,
  //   count: 5088,
  //   day: new Date("2022-12-04T00:00:00Z")
  // },
  // {
  //   severity: 3,
  //   count: 10028,
  //   day: new Date("2022-12-05T00:00:00Z")
  // },
  // {
  //   severity: 1,
  //   count: 5088,
  //   day: new Date("2022-12-05T00:00:00Z")
  // },
]

export { barData }