import React from 'react';
import { Observable } from 'rxjs';
import { AreaChart3 } from '~/components';
import { useSubject } from '~/hooks';
import { data3 } from '~/mock/line_chart';

/**
 * 联动
 */
export const ExampleAreaChartTooltip: React.FC = () => {
  const tooltipSync = useSubject<
    Observable<{
      offsetX: number;
      dateUnderneathPointer: Date;
    } | null>
  >();
  return (
    <React.Fragment>
      <div className="h-[210px] w-[400px]">
        <AreaChart3
          tooltipSync={tooltipSync}
          charts={[
            {
              color: '#BBBBBB',
              key: 'value2',
              label: '值2',
              getY: (d) => d.value2 ?? 0,
              data: data3,
              getX: (d) => d.time,
            },
            {
              color: '#e22e2e',
              key: 'value3',
              label: '值3',
              getY: (d) => d.value3 ?? 0,
              data: data3,
              getX: (d) => d.time,
            },
          ]}
        />
      </div>
      <div className="h-[210px] w-[400px]">
        <AreaChart3
          tooltipSync={tooltipSync}
          charts={[
            {
              color: '#6377f4',
              key: 'value4',
              label: '值4',
              getY: (d) => d.value4 ?? 0,
              data: data3,
              getX: (d) => d.time,
            },
            {
              color: '#8be22e',
              key: 'value1',
              label: '值1',
              getY: (d) => d.value ?? 0,
              data: data3,
              getX: (d) => d.time,
            },
          ]}
        />
      </div>
    </React.Fragment>
  );
};
