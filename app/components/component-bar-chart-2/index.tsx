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
  forwardRef,
  type HTMLAttributes,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EMPTY, fromEvent, map, startWith, switchMap, tap } from "rxjs";
import { useBehaviorSubject, useLatest, useSafeId, useSubject } from "~/hooks";

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

const headerHeight = 40;
const defaultMargin = { top: 10, right: 30, bottom: 30, left: 50 };

const colors = [
  { level: 1, s_color: "#FF9E9E", e_color: "#DF1B1B", label: "红色" },
  { level: 2, s_color: "#FFA268", e_color: "#DF6100", label: "橙色" },
  { level: 3, s_color: "#FFF062", e_color: "#E6BF08", label: "黄色" },
  { level: 4, s_color: "#6F88FF", e_color: "#4C4DE2", label: "蓝色" },
];

export const BarChart2 = <T,>({
  data,
  getX,
  getValue,
  getCategary,
  margin,
}: Props<T>): JSX.Element => {
  const tipContainerRef = useRef<HTMLDivElement>(null);

  const uniqueId = useSafeId();

  const { top, right, bottom, left } = useMemo(() => {
    return { ...defaultMargin, ...margin };
  }, [margin]);

  const [chartContainerSize, setChartContainerSize] = useState({
    width: 0,
    height: 0,
  });

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

  const getTextWidth = useCallback((text: string): number => {
    return Array.from(text).reduce((prev, cur) => {
      let newPrev = prev;
      if (cur.charCodeAt(0) > 255) {
        newPrev += 4;
      } else {
        newPrev += 4;
      }
      return newPrev;
    }, 0);
  }, []);

  const handnleTipLeftDistance = useCallback((): number | undefined => {
    const tipContainer = tipContainerRef.current;
    if (!tipContainer) {
      return tooltip?.offsetX;
    }
    const { clientWidth } = tipContainer;
    const osx = tooltip?.offsetX;
    if (osx && clientWidth + osx > chartContainerSize.width - right) {
      return osx - clientWidth;
    }
    return tooltip?.offsetX;
  }, [chartContainerSize.width, right, tooltip?.offsetX]);

  const [container$, setContainer] = useSubject<HTMLDivElement | null>();
  const [data$, setData] = useBehaviorSubject(data);
  useEffect(() => {
    setData(data);
  }, [data, setData]);
  useEffect(() => {
    const task = container$
      .pipe(
        switchMap((container) => {
          // TODO: 此处获取不到container 为空，不知道什么原因，待解决之前不废弃。提供编写此类组件思想
          if (!container) {
            return EMPTY;
          }

          // 初始化结构
          const svg = select(container)
            .append("svg")
            .call((svg) => {
              svg
                .append("defs")
                .selectAll(".whistle-barchart-linear-gradient-color")
                .data(colors)
                .join("linearGradient")
                .classed("whistle-barchart-linear-gradient-color", true)
                .attr("id", (d) => uniqueId + d.level)
                .call((lg) => {
                  lg.append("stop")
                    .attr("offset", "5%")
                    .attr("stop-color", (d) => d.s_color)
                    .attr("stop-opacity", 0.8);
                  lg.append("stop")
                    .attr("offset", "95%")
                    .attr("stop-color", (d) => d.e_color)
                    .attr("stop-opacity", 1);
                });
            });

          // 创建 tooltip 元素
          const bgRect = svg
            .append("rect")
            .classed("whistleb-barchart-tooltip-group", true)
            .attr("fill", "transparent");

          // 创建 Grid group
          const xGridGroup = svg
            .append("g")
            .classed("whistle-barchart-x-grid-group", true);
          const yGridGroup = svg
            .append("g")
            .classed("whistle-barchart-y-grid-group", true);

          // 显示 x 轴
          const x = svg.append("g").classed("whistle-barchart-x-axis", true);
          const y = svg.append("g").classed("whistle-barchart-y-axis", true);

          // 创建图形 group
          const chartGroup = svg
            .append("g")
            .classed("whistle-barchart-chart", true);

          // 创建背景 group
          const bgGroup = svg
            .append("rect")
            .classed("whistle-barchart-bg", true)
            .attr("fill", "#ffffff");

          return fromEvent(window, "resize").pipe(
            map(() => {
              return {
                width: container.clientWidth,
                height: container.clientHeight,
              };
            }),
            startWith({
              width: container.clientWidth,
              height: container.clientHeight,
            }),
            tap(({ width, height }) => {
              setChartContainerSize({
                width,
                height,
              });

              // 更新 svg 元素的画板范围
              svg.attr("viewBox", `0 0 ${width} ${height}`);

              // 更新背景宽度和高度
              bgRect.attr("width", `${width}px`).attr("height", `${height}px`);
            }),
            switchMap(({ width, height }) => {
              return data$.pipe(
                tap((data) => {
                  const stat = group(data, getCategaryRef.current);

                  const statValues = Array.from(stat.values()).map((d) => {
                    d.sort(
                      (a, b) =>
                        getUnixTime(getXRef.current(a)) -
                        getUnixTime(getXRef.current(b)),
                    );
                    if (d.length > 8) {
                      return d.reverse().slice(0, 8).reverse();
                    }
                    return d;
                  });

                  const xDomain = !statValues.length
                    ? []
                    : statValues
                      .sort((a, b) => b.length - a.length)[0]
                      .map((d) => getXRef.current(d));

                  if (data.length === 0) {
                    // TODO: 清理图形
                    return;
                  }

                  const [minX, maxX] = extent(data.map(getXRef.current));
                  const maxY = max(data.map(getValueRef.current));
                  if (minX == null || maxX == null || maxY == null) {
                    // TODO: 清理图形
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
                  const categoryLen = Array.from(stat.keys()).length;
                  const w = sBandW / categoryLen;
                  const colW = w > 16 ? 16 : w;

                  // 显示 Grid
                  yGridGroup
                    .attr("transform", `translate(${nLeft}, 0)`)
                    .call(
                      axisLeft(yScale)
                        .tickFormat(() => "")
                        .tickSize(-(width - nLeft - right))
                        .ticks(4),
                    )
                    .call((g) => {
                      g.selectAll("path").attr("stroke", "#f4f6fc");
                      g.selectAll("line").attr("stroke", "#f4f6fc");
                    });
                  xGridGroup
                    .attr("transform", `translate(0,${top})`)
                    .call(
                      axisTop(xScale)
                        .tickFormat(() => "")
                        .tickSize(-(height - top - bottom))
                        .ticks(4),
                    )
                    .call((g) => {
                      g.selectAll("path").attr("stroke", "##f4f6fc");
                      g.selectAll("line").attr("stroke", "##f4f6fc");
                    });

                  // 更新图形
                  chartGroup
                    .selectAll("g.bar-chart")
                    .data(statValues)
                    .join("g")
                    .classed("bar-chart", true)
                    .attr("transform", (_, i) => {
                      const seriesX = i * colW + (w > 16 ? (w - colW) / 2 : 0);
                      return `translate(${seriesX} 0)`;
                    })
                    .attr("fill", (d) => {
                      const conf = colors.find((item) =>
                        d.some((d) => getCategaryRef.current(d) === item.level),
                      );
                      if (!conf) {
                        return "none";
                      }
                      return `url(#${uniqueId + conf.level})`;
                    })
                    .selectAll("rect")
                    .data((d) => d)
                    .join("rect")
                    .classed("bar-chart-rect", true)
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
                    .attr("rx", colW / 2)
                    .on("mousemove", ({ offsetX, offsetY }, d) => {
                      setTooltip({ tooltipDatum: d, offsetX, offsetY });
                    })
                    .on("mouseout", () => {
                      setTooltip(undefined);
                    });

                  bgGroup
                    .attr("width", width - left - right - colW)
                    .attr("height", colW / 2)
                    .attr("x", left + colW)
                    .attr("y", yScale(0));

                  // 显示 x 轴
                  x.attr("transform", `translate(0, ${height - bottom})`)
                    .call(xAxis)
                    .call((g) => {
                      g.selectAll("path").attr("stroke", "#f4f6fc");
                      g.selectAll("line").attr("stroke", "transparent");
                      g.selectAll("text")
                        .attr("fill", "#9A9FA5")
                        .attr("font-size", "14px");
                    });

                  // 显示 y 轴
                  y.attr("transform", `translate(${nLeft}, 0)`)
                    .call(yAxis)
                    .call((g) => {
                      g.selectAll("path").attr("stroke", "#f4f6fc");
                      g.selectAll("line").attr("stroke", "transparent");
                      g.selectAll("text")
                        .attr("fill", "#9A9FA5")
                        .attr("font-size", "14px");
                    });
                }),
              );
            }),
            tap({
              complete: () => {
                console.log("clean cahrt");
                // 在 container 变化时移除 svg
                svg.remove();
              },
            }),
          );
        }),
      )
      .subscribe({
        error: (err) => {
          console.error(err);
        },
      });

    return () => {
      task.unsubscribe();
    };
  }, [
    bottom,
    container$,
    data$,
    getCategaryRef,
    getTextWidth,
    getValueRef,
    getXRef,
    left,
    right,
    top,
    uniqueId,
  ]);

  if (data.length === 0) {
    return (
      <div className="h-full bg-white rounded-lg p-2">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          <div className="bg-[#f4f6fb] text-[#b7b6bb] w-[5.625rem] h-[2.125rem] rounded-[2.125rem] text-xs top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center">
            无数据
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg p-2">
      <div className="w-full h-full relative flex flex-col">
        <div
          className="w-full flex justify-start items-center box-border"
          style={{ height: `${headerHeight}px` }}
        >
          <div className="text-[#040f1f] font-medium text-[18px] whitespace-nowrap">
            bar-chart
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
        <div ref={setContainer} className="flex-1 w-full"></div>
        <TooltipContainer
          ref={tipContainerRef}
          className="absolute transition-all pointer-events-none p-2 rounded-lg z-10"
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
                  color={`linear-gradient(to bottom right , ${curColor.s_color}, ${curColor.e_color})`}
                  value={getValueRef.current(tooltip?.tooltipDatum)}
                />
              )}
            </React.Fragment>
          )}
        </TooltipContainer>
      </div>
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

export const FillGradientColor: React.FC<FillGradientProps> = ({
  id,
  sColor,
  eColor,
}) => {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={sColor} stopOpacity={0.8} />
        <stop offset="95%" stopColor={eColor} stopOpacity={1} />
      </linearGradient>
    </defs>
  );
};

const TooltipContent: React.FC<{
  color: string;
  value?: string | number;
}> = ({ color, value }) => {
  return (
    <div className="pointer-events-none text-sm text-[#040F1F] font-semibold ml-5 first:ml-0 relative whitespace-nowrap">
      <span
        className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%]"
        style={{ background: color }}
      ></span>
      ：<span className="ml-2 whitespace-nowrap">{value ?? "-"}</span>
    </div>
  );
};
