import {
  arc,
  pie,
  type PieArcDatum,
  range,
  scaleOrdinal,
  select,
  interpolate,
  selectAll,
} from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from '~/hooks';

interface Props<T> {
  data: T[];
  innerRadius?: number;
  outerRadius?: number;
  getKey: (d: T) => string;
  getValue: (d: T) => number;
  onChange: (d: T) => void;
}

const minWidth = 280;
const minHeight = 200;
// 渐变颜色 6E87FE 4E50E4
const colors = ['#6E87FE', '#5ECA75', '#EB6767', '#89ECEB', '#BADF40'];

export const PieChart = <T,>({
  data,
  innerRadius = 70,
  outerRadius = 80,
  getKey,
  getValue,
  onChange,
}: Props<T>) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState(minHeight);
  const pieWidth = useMemo(() => {
    return height;
  }, [height]);

  const tooNarrow = useMemo(() => width < minWidth, [width]);
  const tooShort = useMemo(() => height < minHeight, [height]);

  const [container, setContainer] = useState<HTMLDivElement | null>();

  const getKeyRef = useLatest(getKey);
  const getValueRef = useLatest(getValue);
  const onChangeRef = useLatest(onChange);

  const formatData = useMemo(() => {
    if (data.length > 5) {
      return data
        .slice(0, 5)
        .sort((a, b) => getValueRef.current(b) - getValueRef.current(a));
    }
    return data.sort((a, b) => getValueRef.current(b) - getValueRef.current(a));
  }, [data, getValueRef]);

  const handlePercentage = useCallback(
    (v: number): string => {
      const total = formatData.reduce(
        (prev, curr) => prev + getValueRef.current(curr),
        0
      );
      return ((v / total) * 100).toFixed(2);
    },
    [formatData, getValueRef]
  );

  const defaultCurData = useMemo(() => {
    const curN = Math.max(...formatData.map((d) => getValueRef.current(d)));
    const cur = formatData.find((d) => getValueRef.current(d) === curN);
    if (!cur) {
      return formatData[0];
    }
    return cur;
  }, [formatData, getValueRef]);
  const [curData, setCurData] = useState<T>(defaultCurData);

  useEffect(() => {
    if (!container || tooNarrow || tooShort) {
      return;
    }

    const svg = select(container)
      .append('svg')
      .attr('width', pieWidth)
      .attr('height', height)
      .style('background-color', '#ffffff');

    // 序数比例尺 - 颜色
    const colorScale = scaleOrdinal(range(0, formatData.length), colors);
    const drawData = pie<T>()
      .value((d) => getValueRef.current(d))
      .padAngle(0.1)
      .startAngle(60)
      .endAngle(Math.PI * 2)(formatData);

    const pieArc = arc<PieArcDatum<T>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(10); // 拐角圆滑
    const arcs = svg.append('g').attr(
      'transform',
      `translate( 
          ${outerRadius + pieWidth / 2 - outerRadius} ,
          ${outerRadius + height / 2 - outerRadius})`
    );

    const drawText = (d: T) => {
      // 绘制文字
      arcs
        .selectAll('text.pie-text-name')
        .data([d])
        .join('text')
        .attr('class', 'pie-text-name')
        // .style('pointer-events', 'none')
        .text((d) => {
          return getValueRef.current(d);
        })
        .attr('fill', '#413D52')
        .attr('font-size', '28px')
        .attr('font-weight', 'bolder')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'text-after-edge');

      arcs
        .selectAll('text.pie-text-value')
        .data([d])
        .join('text')
        .attr('class', 'pie-text-value')
        // .style('pointer-events', 'none')
        .text((d) => {
          return getKeyRef.current(d);
        })
        .attr('fill', '#413D52')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'text-before-edge');
    };

    // 添加底
    arcs
      .append('circle')
      .attr('class', 'pie-back')
      .style('pointer-events', 'none')
      .attr('stroke', 'none')
      .attr('r', 85)
      .attr('cx', 0)
      .style('fill', '#f8fafc')
      .attr('cy', 0);
    arcs
      .append('circle')
      .attr('class', 'pie-back2')
      .style('pointer-events', 'none')
      .attr('stroke', 'none')
      .attr('r', 65)
      .attr('cx', 0)
      .style('fill', '#ffffff')
      .attr('cy', 0);

    arcs
      .selectAll('path.pie-arc')
      .data(drawData)
      .join('path')
      .attr('class', 'pie-arc')
      // .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('fill', (d) => colorScale(d.index))
      .attr('transform', (d) => {
        if (d.data === defaultCurData) {
          return 'scale(1.05)';
        }
        return 'scale(1)';
      })
      .attr('d', (d) => {
        // 根据 pie 数据 计算路径
        return pieArc(d);
      })
      .on('mouseover', (evt, v) => {
        selectAll('path.pie-arc')
          .transition()
          .duration(300)
          .attr('transform', 'scale(1)');
        select(evt.currentTarget)
          .transition()
          .duration(300)
          .attr('transform', 'scale(1.05)');
        drawText(v.data);
        setCurData(v.data);
        onChangeRef.current(v.data)
      })
      .on('mouseout', (evt) => {
        // select(evt.currentTarget)
        //   .transition()
        //   .duration(500)
        //   .attr('transform', 'scale(1)');
      })
      .transition()
      .duration(1000)
      .attrTween('d', (d) => {
        // 初始加载时的过渡效果
        const fn = interpolate({ endAngle: d.startAngle }, d);
        return (t) => {
          return pieArc(fn(t)) ?? '';
        };
      });

    // 默认选中项
    drawText(defaultCurData);

    return () => {
      svg.remove();
    };
  }, [
    container,
    pieWidth,
    height,
    tooNarrow,
    tooShort,
    formatData,
    innerRadius,
    outerRadius,
    getValueRef,
    getKeyRef,
    defaultCurData,
  ]);

  useEffect(() => {
    if (!container) {
      return;
    }
    const handler = () => {
      setHeight(Math.max(minHeight, container.clientHeight));
      setWidth(container.clientWidth);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [container]);

  const visible = useMemo<boolean>(() => {
    return !!(tooNarrow || data.length === 0);
  }, [tooNarrow, data]);

  return (
    <div
      ref={setContainer}
      className="h-full w-full bg-white flex justify-start items-center flex-row-reverse relative"
    >
      {visible && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          {tooNarrow ? '窗口过窄' : '暂无数据'}
        </span>
      )}
      {!visible && (
        <div className="flex-1 h-full flex flex-col py-5 pr-5 box-border">
          {formatData.map((d, i) => (
            <div
              key={`${getValueRef.current(d)}-${i}`}
              className="w-full h-full flex justify-between items-center rounded-3xl box-border px-3"
              style={{
                backgroundColor: d === curData ? '#F4F6FB' : 'transparent',
              }}
            >
              <ul className="flex justify-start items-center">
                <li
                  className="w-3 h-3 rounded-[50%] mr-2 shrink-0"
                  style={{ backgroundColor: colors[i] }}
                />
                <li className="text-sm text-[#787C82]">
                  {getKeyRef.current(d)}
                </li>
              </ul>
              <div>{handlePercentage(getValueRef.current(d)) + '%'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
