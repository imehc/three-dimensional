import {
  curveLinearClosed,
  lineRadial,
  max,
  range,
  scaleLinear,
  select,
} from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { useLatest } from '~/hooks';

interface Props<T> {
  data: T[];
  getKey: (d: T) => string;
  getValue: (d: T) => number;
}

type RadarBasicConf = {
  /** 极坐标每一圈的点数 */
  pointNum: number;
  /** 多少个圈 */
  circleNum: number;
  /** 每一圈之间的距离 */
  circleSetp: number;
};

/**
 * 
 * @deprecated 
 */
export const RadarChart = <T,>({
  data,
  getKey,
  getValue,
}: Props<T>): JSX.Element => {
  const [container, setContainer] = useState<HTMLDivElement | null>();
  const [{ width, height }, setRadarSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const getKeyRef = useLatest(getKey);
  const getValueRef = useLatest(getValue);

  const { pointNum, circleNum, circleSetp } = useMemo<RadarBasicConf>(() => {
    return {
      pointNum: data.length,
      circleNum: 5,
      circleSetp: 13,
    };
  }, [data]);

  useEffect(() => {
    if (!container) {
      return;
    }

    const angles = range(0, 2 * Math.PI, (2 * Math.PI) / pointNum);
    const scale = scaleLinear()
      .domain([0, max([...data.map(getValueRef.current)]) ?? 1])
      .range([0, circleNum * circleSetp]);

    const svg = select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    for (let i = 1; i <= circleNum; i++) {
      //画每一个圈
      const lin = lineRadial<number>()
        .curve(curveLinearClosed)
        .angle((d) => parseFloat(d.toFixed(2)))
        .radius(() => circleSetp * i);
      svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .append('path')
        .attr('d', lin(angles))
        .attr('stroke', '#e9e9e9')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    }

    //绘制线条
    svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('polyline')
      .data(angles)
      .enter()
      .append('polyline')
      .attr('points', (d) => {
        let r = circleNum * circleSetp,
          x = r * Math.cos(d),
          y = r * Math.sin(d);
        return `0,0 ${x},${y}`;
      })
      .attr('stroke', '#e9e9e9')
      .attr('stroke-width', 2);
    //绘制文字
    const text = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('text')
      .data(angles)
      .enter();

    const drawText = (drawRatio: boolean) => {
      text
        .append('text')
        .text((_, i) => {
          if (drawRatio) {
            const rate = getValueRef.current(data[i]);
            if (max([...data.map(getValueRef.current)]) ?? 0 <= 1) {
              return (rate * 100).toFixed(0) + '%';
            }
            return rate.toFixed(0) + '%';
          }
          return getKeyRef.current(data[i]);
        })
        .attr('transform', (d) => {
          let r = circleNum * circleSetp;
          let x = r * Math.cos(d);
          let y = r * Math.sin(d);
          if (d > Math.PI / 2 && d < (Math.PI * 3) / 2) {
            x -= 10;
            if (drawRatio) {
              y += 15;
            }
          } else if (d === (Math.PI * 3) / 2) {
            y -= 20;
            if (drawRatio) {
              y += 15;
            }
          } else if (d === Math.PI / 2) {
            y += 30;
            if (drawRatio) {
              y -= 15;
            }
          } else {
            x += 10;
            if (drawRatio) {
              y -= 15;
              x += 5;
            }
          }
          return `translate(${x},${y})`;
        })
        .attr('text-anchor', (d) => {
          if (d > Math.PI / 2 && d < (Math.PI * 3) / 2) {
            return 'end';
          } else if (d === Math.PI / 2 || d === (Math.PI * 3) / 2) {
            return 'middle';
          } else {
            return 'start';
          }
        })
        .attr('fill', drawRatio ? '#040F1F' : '#787C82')
        .attr('font-weight', drawRatio ? 'bolder' : 'nomal')
        .attr('font-size', drawRatio ? '14px' : '12px');
    };
    drawText(false);
    drawText(true);
    //绘制点
    svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('circle')
      .data(angles)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => {
        let x = scale(getValueRef.current(data[i])) * Math.cos(d);
        return x;
      })
      .attr('cy', (d, i) => {
        let y = scale(getValueRef.current(data[i])) * Math.sin(d);
        return y;
      })
      .attr('r', 4)
      .attr('fill', '#00e067');

    //数据绘制
    let lin = lineRadial<number>()
      .curve(curveLinearClosed)
      .angle((d) => {
        return d;
      })
      .radius((d, i) => {
        return scale(getValueRef.current(data[i]));
      });
    svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2}) rotate(90)`)
      .append('path')
      .attr('d', lin(angles))
      .attr('stroke', '#00e067')
      .attr('stroke-width', 2)
      .attr('fill', 'rgba(0, 224, 103,.2)');
  }, [
    container,
    width,
    height,
    pointNum,
    circleNum,
    circleSetp,
    data,
    getValueRef,
    getKeyRef,
  ]);

  useEffect(() => {
    if (!container) {
      return;
    }
    const handler = () => {
      setRadarSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };
    handler();
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [container]);

  return <div ref={setContainer} className="w-full h-full" />;
};
