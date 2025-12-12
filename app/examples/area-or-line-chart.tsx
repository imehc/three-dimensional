import { LineChart3 } from '~/components';
import temp from '~/mock/line_chart3_temp';

export const ExampleAreaOrLineChart: React.FC = () => {
  return (
    <div className="w-[1000px] h-[800px] p-10">
      <LineChart3
        // lines={lines}
        // timeScale={[subDays(new Date(), 100), new Date()]}
        timeScale={[new Date('2022-12-01'), new Date('2022-12-31')]}
        lines={temp as any}
      />
    </div>
  );
};
