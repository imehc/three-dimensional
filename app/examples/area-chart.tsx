import { AreaChart2 } from "~/components";
import { data3 } from "~/mock/line_chart";

export const ExampleAreaChart: React.FC = () => {
  return (
    <div className="h-[210px] w-[500px] ml-11 mt-11">
      <AreaChart2
        data={data3}
        getX={(item) => item.time}
        areas={[
          {
            color: '#da63e7',
            label: '分类二',
            key: 'l',
            getter: (d) => d.value2,
          },
          {
            color: '#8cdaed',
            label: '分类三',
            key: 'y',
            getter: (d) => d.value3,
          },
          {
            color: '#948ced',
            label: '分类四',
            key: 'z',
            getter: (d) => d.value4,
          },
        ]}
      />
    </div>
  );
};
