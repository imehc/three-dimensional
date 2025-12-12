import { AreaChart, ResponsiveContainer } from '~/components';
import { data3 } from '~/mock/line_chart';

export const ExampleAreaChartSingle: React.FC = () => {
  return (
    <div className="h-[200px] w-[300px] ml-11 mt-11">
      <ResponsiveContainer>
        <AreaChart data={data3} getX={(d) => d.time} getY={(d) => d.value2} />
      </ResponsiveContainer>
    </div>
  );
};
