import { subDays } from 'date-fns';
import { type LineConfig } from '~/components';

const random = ({ length, range }: { length: number; range: number }) => {
  return [...new Array(length)]
    .map((_, i) => ({
      time: subDays(new Date(), i),
      value: Number((Math.random() * range - 200).toFixed(2)),
    }))
    .reverse();
};
const random2 = ({ length, range }: { length: number; range: number }) => {
  return [...new Array(length)]
    .map((_, i) => ({
      t: subDays(new Date(), i),
      v: Number((Math.random() * range - 200).toFixed(2)),
    }))
    .reverse();
};

type SampleConfig = {
  time: Date;
  value: number;
};
type SampleConfig2 = {
  t: Date;
  v: number;
};

const lines: LineConfig<SampleConfig>[] = [
  {
    color: '#f00',
    data: random({ length: 100, range: 200 }),
    uniqueId: 'uniqueId1',
    unit: '度',
    label: '模拟一',
    getX: (d) => d.time,
    getY: (d) => d.value,
  },
  {
    color: '#0f0',
    data: random({ length: 100, range: 300 }),
    uniqueId: 'uniqueId2',
    unit: '度',
    label: '模拟二',
    getX: (d) => d.time,
    getY: (d) => d.value,
    isArea: true,
  },
  {
    color: '#00f',
    data: random({ length: 100, range: 100 }),
    uniqueId: 'uniqueId3',
    unit: '度',
    label: '模拟三',
    getX: (d) => d.time,
    getY: (d) => d.value,
  },
  {
    color: '#f0f',
    data: random2({ length: 100, range: 250 }) as any,
    uniqueId: 'uniqueId4',
    unit: '度',
    label: '模拟四',
    getX: (d: any) => d.t,
    getY: (d: any) => d.v,
    isArea: true,
  },
  {
    color: '#ff0',
    data: random2({ length: 100, range: 350 }) as any,
    uniqueId: 'uniqueId5',
    unit: '度',
    label: '模拟五',
    getX: (d: any) => d.t,
    getY: (d: any) => d.v,
  },
  {
    color: '#0ff',
    data: random2({ length: 100, range: 150 }) as any,
    uniqueId: 'uniqueId6',
    unit: '度',
    label: '模拟六',
    getX: (d: any) => d.t,
    getY: (d: any) => d.v,
  },
];

export { lines };
