import {
  axisBottom,
  axisLeft,
  axisTop,
  extent,
  group,
  max,
  scaleBand,
  scaleLinear,
  select,
} from "d3";
import { format, getUnixTime } from "date-fns";
import React, {
  type FC,
  forwardRef,
  type HTMLAttributes,
  type JSX,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Size, useLatest, useSize } from "~/hooks";

interface Props<T> {
  data: T[];
  getX: (d: T) => Date;
  getValue: (d: T) => number;
  getCategary: (d: T) => number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const minWidth = 280;
const minHeight = 200;
const headerHeight = 40;
const defaultMargin = { top: 10, right: 30, bottom: 30, left: 50 };
const padding = {
  x: 8,
  y: 8,
};

const colors = [
  { level: 1, s_color: "#FF9E9E", e_color: "#DF1B1B", label: "红色预警" },
  { level: 2, s_color: "#FFA268", e_color: "#DF6100", label: "橙色预警" },
  { level: 3, s_color: "#FFF062", e_color: "#E6BF08", label: "黄色预警" },
  { level: 4, s_color: "#6F88FF", e_color: "#4C4DE2", label: "蓝色预警" },
];

export const BarChart = <T,>({
  data,
  getX,
  getValue,
  getCategary,
  margin,
}: Props<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<SVGSVGElement>(null);
  const tipContainerRef = useRef<HTMLDivElement>(null);

  const barTipId = useId()

  const size = useSize(containerRef);
  const { width, height } = useMemo<Size>(() => {
    if (size) {
      return {
        width: size.width,
        height: Math.max(minHeight, size.height) - headerHeight - padding.y * 2,
      };
    }
    return {
      width: 0,
      height: 0,
    };
  }, [size]);

  const tooNarrow = useMemo(() => width < minWidth, [width]);
  const tooShort = useMemo(
    () => height + headerHeight + padding.y * 2 < minHeight,
    [height],
  );

  const getXRef = useLatest(getX);
  const getValueRef = useLatest(getValue);
  const getCategaryRef = useLatest(getCategary);

  const [tooltip, setTooltip] = useState<{
    tooltipDatum: T | null;
    offsetX: number;
    offsetY: number;
  }>();
  const curColor = useMemo(() => {
    const tooltipDatum = tooltip?.tooltipDatum;
    if (tooltipDatum) {
      return colors.find(
        (item) => item.level === getCategaryRef.current(tooltipDatum),
      );
    }
  }, [getCategaryRef, tooltip?.tooltipDatum]);

  const stat = useMemo(() => {
    return group(data, getCategaryRef.current);
  }, [data, getCategaryRef]);

  const { top, right, bottom, left } = useMemo(() => {
    return { ...defaultMargin, ...margin };
  }, [margin]);

  const getTextWidth = useCallback((text: string): number => {
    return Array.from(text).reduce((prev, cur) => {
      let newPrev = prev;
      if (cur.charCodeAt(0) > 255) {
        newPrev += 4;
      } else {
        newPrev += 2;
      }
      return newPrev;
    }, 0);
  }, []);

  const categoryLen = useMemo<number>(() => {
    return Array.from(stat.keys()).length;
  }, [stat]);

  const statValues = useMemo<T[][]>(() => {
    return Array.from(stat.values()).map((cfg) => {
      return cfg.sort(
        (a, b) =>
          getUnixTime(getXRef.current(a)) - getUnixTime(getXRef.current(b)),
      );
    });
  }, [getXRef, stat]);

  const xDomain = useMemo<Date[]>(() => {
    if (!statValues.length) {
      return [];
    }
    return statValues
      .sort((a, b) => b.length - a.length)[0]
      .map((d) => getXRef.current(d));
  }, [getXRef, statValues]);

  const handnleTipLeftDistance = useCallback((): number | undefined => {
    const tipContainer = tipContainerRef.current;
    if (!tipContainer) {
      return tooltip?.offsetX;
    }
    const { clientWidth } = tipContainer;
    const osx = tooltip?.offsetX;
    if (osx && clientWidth + osx > width - right) {
      return osx - clientWidth;
    }
    return tooltip?.offsetX;
  }, [right, tooltip?.offsetX, width]);

  useEffect(() => {
    const container = containerRef.current;
    const svgContainer = svgContainerRef.current;
    if (!container || !svgContainer || tooNarrow || tooShort || !data.length) {
      return;
    }
    const [minX, maxX] = extent(data.map(getXRef.current));
    const maxY = max(data.map(getValueRef.current));

    if (minX == null || maxX == null || maxY == null) {
      return;
    }

    const nLeft = left + getTextWidth(maxY.toString());

    const xRange = [nLeft, width - right];
    const xScale = scaleBand(xDomain, xRange).padding(0.5);
    const yRange = [height - bottom, top];
    const yScale = scaleLinear([0, maxY], yRange).nice(5);

    const xDuration = maxX.valueOf() - minX.valueOf();
    const threeYears = 1000 * 60 * 60 * 24 * 365 * 3;
    const threeMonthes = 1000 * 60 * 60 * 24 * 30 * 3;
    const threeDays = 1000 * 60 * 60 * 24 * 3;
    const threeHours = 1000 * 60 * 60 * 3;
    const xAxis = axisBottom<Date>(xScale)
      .tickFormat((d, i) => {
        if (xDomain.length > 8 && i % 2 !== 0) {
          return "";
        }
        return xDuration > threeYears
          ? format(d, "yyyy")
          : xDuration > threeMonthes
            ? format(d, "MM 月")
            : xDuration > threeDays
              ? format(d, "MM-dd")
              : xDuration > threeHours
                ? format(d, "HH:mm")
                : format(d, "mm:ss");
      })
      .ticks(5)
      .tickPadding(8);
    const yAxis = axisLeft(yScale)
      .tickFormat((d) => d.toString())
      .ticks(4);

    const sBandW = xScale.bandwidth();
    const colW = sBandW / categoryLen;
    const svg = select(svgContainer)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", `${width}px`)
      .style("height", `${height}px`)
      .attr("transform", `translate(0, ${headerHeight + top})`);

    const g = svg.append("g");

    // 显示背景色
    g.append("rect")
      .attr("width", `${width}px`)
      .attr("height", `${height}px`)
      .attr("fill", "transparent");

    // 显示 Grid
    const yGrid = g
      .append("g")
      .attr("transform", `translate(${nLeft}, 0)`)
      .call(
        axisLeft(yScale)
          .tickFormat(() => "")
          .tickSize(-(width - nLeft - right))
          .ticks(4),
      );
    yGrid.selectAll("path").attr("stroke", "#f4f6fc");
    yGrid.selectAll("line").attr("stroke", "#f4f6fc");
    const xGrid = g
      .append("g")
      .attr("transform", `translate(0,${top})`)
      .call(
        axisTop(xScale)
          .tickFormat(() => "")
          .tickSize(-(height - top - bottom))
          .ticks(4),
      );
    xGrid.selectAll("path").attr("stroke", "##f4f6fc");
    xGrid.selectAll("line").attr("stroke", "##f4f6fc");

    // 绘制
    const series = g
      .append("g")
      .selectAll("g.bar-chart")
      .data(statValues)
      .join("g")
      .attr("class", "bar-chart")
      .attr("transform", (_, i) => {
        const seriesX = i * colW;
        return `translate(${seriesX} 0)`;
      })
      .attr("fill", (d) => {
        const conf = colors.find((item) =>
          d.some((d) => getCategaryRef.current(d) === item.level),
        );
        // const cur = d.find((d) =>
        //   colors.some((item) => item.level === getCategaryRef.current(d))
        // );
        if (conf) {
          // if (conf && cur) {
          // const defs = create('defs')
          //   .append('linearGradient')
          //   .attr('id', 'linearGrad')
          //   .attr('x1', '0')
          //   .attr('y1', '0')
          //   .attr('x2', '0')
          //   .attr('y2', '100%');
          // defs
          //   .append('stop')
          //   .attr('offset', '0%')
          //   .style('stop-color', conf.s_color);
          //   defs
          //   .append('stop')
          //   .attr('offset', '100%')
          //   .style('stop-color', conf.e_color);
          // const normalize = scaleLinear().domain([0, maxY]).range([0, 1]);
          // return interpolateRgb(
          //   conf.s_color,
          //   conf.e_color
          // )(normalize(getValueRef.current(cur)));
          return `url(#${conf.level})`;
          // return `url(#linearGrad)`
        }
        // return colors[i % colors.length].s_color;
        return "none";
      });
    const rects = series
      .selectAll("g.bar-chart")
      .data((d) => d)
      .join("rect")
      .classed("bar-chart-rect", true);
    rects
      .attr("width", colW - 2)
      .attr("height", (d) => {
        const height = yScale(0) - yScale(getValueRef.current(d));
        return height < 2 ? 2 + colW / 2 : height + colW / 2;
      })
      .attr("x", (d) => {
        const x = xScale(getXRef.current(d));
        if (x) {
          return x;
        }
        return "";
      })
      .attr("y", (d) => {
        const height = yScale(0) - yScale(getValueRef.current(d));
        const y = yScale(getValueRef.current(d));
        return height < 2 ? y - 2 : y;
      })
      .attr("rx", colW / 2)
      .attr("rx", colW / 2);

    // tooltip
    // rects.on('mouseover', ({ offsetX, offsetY }, d) => {
    //   setTooltip({ tooltipDatum: d, offsetX, offsetY });
    //   // tip.style('display', 'block')
    //   //   .style('left', clientX + 'px')
    //   //   .style('top', clientY + 'px')
    //   //   .html(`
    //   //         <div>${getValueRef.current(d)}</div>
    //   //     `)
    // });
    rects.on("mousemove", ({ offsetX, offsetY }, d) => {
      setTooltip({ tooltipDatum: d, offsetX, offsetY });
      // tip.style('left', clientX + 'px')
      //   .style('top', clientY + 'px')
    });
    /*隐藏提示*/
    rects.on("mouseout", () => {
      setTooltip(undefined);
      // tip.style('display', 'none')
    });

    g.append("rect")
      .attr("width", width - left - right - colW)
      .attr("height", colW / 2)
      .attr("x", left + colW)
      .attr("y", yScale(0))
      .attr("fill", "#ffffff");

    // 显示 x 轴
    const x = g
      .append("g")
      .attr("transform", `translate(0, ${height - bottom})`);
    const xAxisGroup = x.call(xAxis);
    xAxisGroup.selectAll("path").attr("stroke", "#f4f6fc");
    xAxisGroup.selectAll("line").attr("stroke", "transparent");
    xAxisGroup
      .selectAll("text")
      .attr("fill", "#9A9FA5")
      .attr("font-size", "14px");
    // 显示 y 轴
    const y = g.append("g").attr("transform", `translate(${nLeft}, 0)`);
    const yAxisGroup = y.call(yAxis);
    yAxisGroup.selectAll("path").attr("stroke", "#f4f6fc");
    yAxisGroup.selectAll("line").attr("stroke", "transparent");
    yAxisGroup
      .selectAll("text")
      .attr("fill", "#9A9FA5")
      .attr("font-size", "14px");

    return () => {
      g.remove();
    };
  }, [
    bottom,
    categoryLen,
    data,
    getCategaryRef,
    getTextWidth,
    getValueRef,
    getXRef,
    height,
    left,
    right,
    statValues,
    tooNarrow,
    tooShort,
    top,
    width,
    xDomain,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded relative">
      {tooNarrow && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          窗口过窄
        </span>
      )}
      {!tooNarrow && data.length === 0 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          <div className="bg-[#f4f6fb] text-[#b7b6bb] w-[5.625rem] h-[2.125rem] rounded-[2.125rem] text-xs top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center">
            无数据
          </div>
        </div>
      )}
      <div
        className="w-full absolute left-0 top-0 z-20 flex justify-start items-center pr-2 box-border"
        style={{ height: headerHeight }}
      >
        <div className="text-[#040f1f] font-medium text-[18px] whitespace-nowrap">
          告警统计
        </div>
        <ul className="flex-1 ml-5 flex justify-between items-center">
          <li className="flex justify-start flex-row-reverse items-center h-full ml-4 flex-1 whitespace-nowrap">
            {colors.map((d) => (
              <p
                key={d.level}
                className="text-[12px] text-[#9A9FA5] mr-7 first:mr-0 relative"
              >
                <span
                  className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%]"
                  style={{
                    background: `linear-gradient(to bottom right , ${d.s_color}, ${d.e_color})`,
                  }}
                ></span>
                <span className="ml-1">{d.label}</span>
              </p>
            ))}
          </li>
        </ul>
      </div>
      <svg ref={svgContainerRef} >
        <title>柱状图</title>
        {colors.map((d) => (
          <FillGradientColor
            key={d.level}
            id={d.level.toString()}
            sColor={d.s_color}
            eColor={d.e_color}
          />
        ))}
      </svg>
      <TooltipContainer
        ref={tipContainerRef}
        className="absolute transition-all pointer-events-none p-2 rounded-lg z-10"
        id={barTipId}
        style={{
          left: `${handnleTipLeftDistance()}px`,
          top: `${tooltip?.offsetY}px`,
          display: tooltip ? "block" : "none",
        }}
      >
        {tooltip?.tooltipDatum && (
          <React.Fragment>
            <div className="text-xs text-[#040F1F] pointer-events-none">
              {format(
                getXRef.current(tooltip?.tooltipDatum),
                "yyyy-MM-dd HH:mm",
              )}
            </div>
            {curColor && (
              <TooltipContent
                color={curColor.s_color}
                value={getValueRef.current(tooltip?.tooltipDatum)}
              />
            )}
          </React.Fragment>
        )}
      </TooltipContainer>
    </div>
  );
};

const TooltipContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => (
    <div
      {...props}
      ref={ref}
      className={`bg-white/70 backdrop-blur-[1px] ${props.className ?? ''}`}
    />
  )
);

type FillGradientProps = {
  id: string;
  sColor: string;
  eColor: string;
};

const FillGradientColor: FC<FillGradientProps> = ({ id, sColor, eColor }) => {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={sColor} stopOpacity={0.8} />
        <stop offset="95%" stopColor={eColor} stopOpacity={1} />
      </linearGradient>
    </defs>
  );
};

const TooltipContent: React.FC<{ color: string; value?: string | number }> = ({
  color,
  value,
}) => {
  return (
    <div className="pointer-events-none text-sm text-[#040F1F] font-semibold ml-5 first:ml-0 relative whitespace-nowrap">
      <span
        className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%]"
        style={{ backgroundColor: color }}
      ></span>
      ：<span className="ml-2 whitespace-nowrap">{value ?? "-"}</span>
    </div>
  );
};
