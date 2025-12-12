import { BarChart } from '~/components';
import { barData } from '~/mock/bar_chart';

export const ExampleBarChart: React.FC = () => {
  return (
    <div className="h-[210px] w-[500px] ml-11 mt-11">
      <BarChart
        data={barData}
        getX={(d) => d.day}
        getCategary={(d) => d.severity}
        getValue={(d) => d.count}
      />
    </div>
  );
};
