import { area, extent, line, scaleLinear, scaleTime, select } from 'd3';
import { getUnixTime } from 'date-fns';
import { useEffect, useRef, useMemo } from 'react';
import { type Size, useSize, useLatest } from '~/hooks';

interface Props<T> {
  data?: T[];
  getX: (d: T) => Date;
  getY: (d: T) => number;
  color?: string;
}

export const AreaChart = <T,>({
  data,
  getX,
  getY,
  color = '#3ADD74',
}: Props<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);
  const { width, height } = useMemo<Size>(() => {
    return (
      size ?? {
        width: 0,
        height: 0,
      }
    );
  }, [size]);

  const getXRef = useLatest(getX);
  const getYRef = useLatest(getY);

  const sortData = useMemo<T[] | undefined>(() => {
    return data?.sort(
      (a, b) =>
        getUnixTime(getXRef.current(a)) - getUnixTime(getXRef.current(b))
    );
  }, [data, getXRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sortData || !width || !height) {
      return;
    }

    const [minX, maxX] = extent(sortData.map(getXRef.current));
    const [minY, maxY] = extent(sortData.map(getYRef.current));
    if (minX == null || maxX == null || minY == null || maxY == null) {
      return;
    }

    const xRange = [0, width];
    const xScale = scaleTime([minX, maxX], xRange);
    const yRange = [height, 0];
    const yScale = scaleLinear([minY, maxY], yRange);

    const svg = select(container.children[0])
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', width + 'px')
      .style('height', height + 'px')
      .style('background-color', 'transparent');

    const pathLines = svg
      .append('g')
      .selectAll('path.line-path')
      .data(sortData);
    pathLines
      .join('path')
      .merge(pathLines)
      .classed('line', true)
      .attr('class', 'line-path')
      .style('pointer-events', 'none')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', color)
      .transition()
      .attr('d', () => {
        return line<T>(
          (d) => xScale(getXRef.current(d)),
          (d) => yScale(getYRef.current(d))
        )(sortData);
      });

    const pathAreas = svg
      .append('g')
      .selectAll('path.area-path')
      .data(sortData);
    pathAreas
      .join('path')
      .merge(pathAreas)
      .classed('area', true)
      .attr('class', 'area-path')
      .style('pointer-events', 'none')
      .style('fill', 'url(#area_chart_fill)')
      .style('fill-opacity', '.1')
      .transition()
      .attr('d', () => {
        return area<T>(
          (d) => xScale(getXRef.current(d)),
          () => height,
          (d) => yScale(getYRef.current(d))
        )(sortData);
      });
  }, [color, data, getXRef, getYRef, height, width]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg id="area_chart" width={width} height={height}>
        <defs>
          <linearGradient id="area_chart_fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.6} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
