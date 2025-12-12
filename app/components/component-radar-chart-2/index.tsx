import { max, select } from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import { type Size, useLatest, useSize } from '~/hooks';

interface Props<T> {
  data?: T[];
  getKey: (d: T) => string;
  getValue: (d: T) => number;
}

// 默认margin
const [x, y] = [25, 25];
const circleNum = 5;
// 默认绘制的雷达图

export const RadarChart2 = <T,>({
  data,
  getKey,
  getValue,
}: Props<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);
  const { width: sWidth, height: sHeight } = useMemo<Size>(() => {
    return (
      size ?? {
        height: 0,
        width: 0,
      }
    );
  }, [size]);

  const angleSegment = useMemo<number>(
    () => (2 * Math.PI) / (data?.length ?? 3),
    [data?.length]
  );
  const arrayAxes = useMemo(
    () =>
      data
        ? data.map((_, i) => i)
        : Array(circleNum)
            .fill(circleNum)
            .map((_, i) => i),
    [data]
  );
  const arrayCircle = useMemo(
    () =>
      Array(circleNum)
        .fill(circleNum)
        .map((_, i) => (i + 1) / circleNum),
    []
  );

  const getKeyRef = useLatest(getKey);
  const getValueRef = useLatest(getValue);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sWidth || !sHeight) {
      return;
    }

    const svg = select(container)
      .append('svg')
      .attr('width', sWidth)
      .attr('height', sHeight)
      .attr(
        'transform',
        `translate(0,${data ? 0 : y}) rotate(${data ? 0 : 30})`
      );

    const w = Math.min(sWidth - x * 2, sHeight - y * 2);
    const [width, height, radius, xCentre, yCentre] = [
      w,
      w,
      w / 2,
      w / 2 + x,
      w / 2 + y,
    ];
    // 绘制轴线
    const spokes = svg
      .append('svg:g')
      .attr('transform', `translate(${sWidth / 2 - xCentre},0)`);
    spokes
      .selectAll('.spoke')
      .data(arrayAxes)
      .enter()
      .append('svg:line')
      .attr('x1', yCentre)
      .attr('y1', yCentre)
      .attr('x2', (_, i) => {
        return xCentre + (width / 2) * Math.cos(i * angleSegment);
      })
      .attr('y2', (_, i) => {
        return yCentre + (height / 2) * Math.sin(i * angleSegment);
      })
      .attr('stroke', '#e9e9e9')
      .attr('stroke-width', 2);
    // 绘制label
    if (data) {
      const labels = svg
        .append('svg:g')
        .attr('transform', `translate(${sWidth / 2 - xCentre},0)`)
        .selectAll('.label')
        .data(data.map(getKeyRef.current))
        .enter();
      const draeLabel = (drawRatio: boolean) => {
        labels
          .append('svg:text')
          .text((text, i) => {
            if (drawRatio) {
              const rate = getValueRef.current(data[i]);
              if (max([...data.map(getValueRef.current)]) ?? 0 <= 1) {
                return (rate * 100).toFixed(0) + '%';
              }
              return rate.toFixed(0) + '%';
            }
            return text;
          })
          .attr('x', (_, i) => {
            const x = xCentre + radius * 1.1 * Math.cos(i * angleSegment);
            if (Math.cos(i * angleSegment) > 0.01) {
              return x;
            } else {
              return x - 5;
            }
          })
          .attr('y', (_, i) => {
            const y = yCentre + radius * 1.1 * Math.sin(i * angleSegment);
            if (Math.cos(i * angleSegment) > 0.01) {
              if (drawRatio) {
                return y + 5;
              }
              return y - 10;
            } else if (Math.abs(Math.cos(i * angleSegment)) <= 0.01) {
              if (drawRatio) {
                return y + 10;
              }
              return y + 15;
            } else {
              if (drawRatio) {
                return y + 5;
              }
              return y - 10;
            }
          })
          .attr('text-anchor', (_, i) => {
            if (Math.cos(i * angleSegment) > 0.01) {
              return 'start';
            } else if (Math.abs(Math.cos(i * angleSegment)) <= 0.01) {
              return 'middle';
            } else {
              return 'end';
            }
          })
          .attr('alignment-baseline', (_, i) => {
            if (Math.sin(i * angleSegment) > 0.1) {
              return 'hanging';
            } else {
              return 'middle';
            }
          })
          .attr('fill', drawRatio ? '#040F1F' : '#787C82')
          .attr('font-weight', drawRatio ? 'bolder' : 'nomal')
          .attr('font-size', drawRatio ? '14px' : '12px');
      };
      draeLabel(false);
      draeLabel(true);
    }
    // 绘制轮廓
    const webbing = svg
      .append('svg:g')
      .attr('transform', `translate(${sWidth / 2},${yCentre})`);
    webbing
      .selectAll('.webbing')
      .data(arrayCircle)
      .enter()
      .append('svg:polygon')
      .attr('points', (d) => {
        let strPoints = '';
        for (let i = 0; i < (data?.length ?? 3); i++) {
          const x = d * radius * Math.cos(i * angleSegment);
          const y = d * radius * Math.sin(i * angleSegment);
          strPoints += x + ',' + y + ' ';
        }
        return strPoints;
      })
      .attr('stroke', '#e9e9e9')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 1)
      .attr('fill-opacity', 0);
    // 绘制点
    if (data) {
      const points = svg
        .append('svg:g')
        .attr('transform', `translate(${sWidth / 2},${yCentre})`);
      points
        .selectAll('.point')
        .data(data)
        .enter()
        .append('svg:circle')
        .attr('cx', (d, i) => {
          return getValueRef.current(d) * radius * Math.cos(i * angleSegment);
        })
        .attr('cy', (d, i) => {
          return getValueRef.current(d) * radius * Math.sin(i * angleSegment);
        })
        .attr('r', 4)
        .attr('fill', '#00e067');
      // 绘制数据
      const overlays = svg
        .append('svg:g')
        .attr('transform', `translate(${sWidth / 2},${yCentre})`);
      const overlay = overlays
        .selectAll('.overlay')
        .data([data])
        .enter()
        .append('svg:polygon')
        .attr('points', (d) => {
          let strPoints = '';
          for (let i = 0; i < d.length; i++) {
            const x =
              getValueRef.current(d[i]) * radius * Math.cos(i * angleSegment);
            const y =
              getValueRef.current(d[i]) * radius * Math.sin(i * angleSegment);
            strPoints += x + ',' + y + ' ';
          }
          return strPoints;
        })
        .attr('stroke', '#00e067')
        .attr('stroke-width', '2px')
        .attr('stroke-opacity', 1)
        .attr('fill', '#00e067')
        .attr('fill-opacity', 0.3)
        .attr('id', (_, i) => `overlay-index-${i.toString()}`);
      overlay
        .on('mouseover', () => {
          select(overlay.node()).style('fill-opacity', 0.6);
        })
        .on('mouseout', () => {
          select(overlay.node()).style('fill-opacity', 0.3);
        });
    }
    if (!data) {
      const g = svg
        .append('g')
        .attr('transform', 'rotate(-30)')
        .attr('width', width)
        .attr('height', height);
      const drawEmptyLabel = (width: number, height: number) => {
        g.append('svg:text')
          .text('无')
          .attr('x', width / 2 -4)
          .attr('y', height / 2 - 8)
          .attr('fill', '#787C82')
          .attr('font-weight', 'nomal')
          .attr('font-size', '12px')
          .attr('text-anchor', 'middle');
        g.append('svg:text')
          .text('0%')
          .attr('x', width / 2 + 4)
          .attr('y', height / 2 + 4)
          .attr('fill', '#B7B6BB')
          .attr('font-weight', 'bold')
          .attr('font-size', '12px')
          .attr('text-anchor', 'middle');
      };
      drawEmptyLabel(width, height);
      drawEmptyLabel(width / 3 - x * 3, height * 3 - y);
      drawEmptyLabel(width * 3 - x * 5, height * 3 - y);
    }
    return () => {
      svg.remove();
    };
  }, [
    containerRef,
    data,
    getValueRef,
    getKeyRef,
    sWidth,
    sHeight,
    arrayAxes,
    angleSegment,
    arrayCircle,
  ]);

  return <div ref={containerRef} className="w-full h-full relative" />;
};
