import { PieChart } from '~/components';
import { pieData } from '~/mock/pie_chart';

export const ExamplePieChart: React.FC = () => {
  return (
    <div className="h-[210px] w-[500px] ml-11 mt-11">
      <PieChart
        data={pieData}
        getKey={(d) => d.name}
        getValue={(d) => d.value}
        onChange={(d) => console.log(d, 'd...')}
      />
    </div>
  );
};
