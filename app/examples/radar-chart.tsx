import { RadarChart2 } from '~/components';
import { ardarData } from '~/mock/radar_chart';

export const ExampleRadarChart: React.FC = () => {
  return (
    <div className="w-[500px] h-[210px] bg-purple-50">
      <RadarChart2
        data={ardarData}
        getKey={(d) => d.brand}
        getValue={(d) => d.online_rate}
      />
    </div>
  );
};
