import { LineChart } from '~/components';
import { data2 } from '~/mock/line_chart';

export const ExampleLineChart: React.FC = () => {
  return (
    <div className="h-[210px] w-[500px] ml-11 mt-11">
      <LineChart
        data={data2}
        getX={(d) => d.time}
        multiKey={(d) => d.key}
        // thresholds={mockThresholds}
        // thresholdKey={(t) => t.value}
        // areaChart
        lines={[
          {
            color: '#f15858',
            label: 'x',
            key: 'x',
            getter: (d) => d.value,
          },
          {
            color: '#76f748',
            label: 'y',
            key: 'y',
            getter: (d) => d.value,
          },
          // {
          //   color: '#ca5cee',
          //   label: 'z',
          //   key: 'z',
          //   getter: (d) => d.value,
          // },
          // {
          //   color: '#da63e7',
          //   label: '分类二',
          //   key: 'l',
          //   getter: (d) => d.value2,
          // },
          // {
          //   color: '#8cdaed',
          //   label: '分类三',
          //   key: 'y',
          //   getter: (d) => d.value3,
          // },
          // {
          //   color: '#948ced',
          //   label: '分类四',
          //   key: 'z',
          //   getter: (d) => d.value4,
          // },
        ]}
        yLabel="应力"
        yUnitLeftLabel="ms/s"
        yUnitRightLabel="hs/h"
        hasRightAxis
        margin={{ right: 50 }}
      />
    </div>
  );
};
