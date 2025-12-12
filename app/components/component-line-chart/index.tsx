import clsx from "clsx";
import {
  type Axis,
  area,
  axisBottom,
  axisLeft,
  axisRight,
  bisector,
  curveLinear,
  easeLinear,
  extent,
  group,
  type InternMap,
  line,
  type NumberValue,
  pointer,
  type ScaleLinear,
  scaleLinear,
  scaleOrdinal,
  scaleTime,
  select,
  selectAll,
} from "d3";
import { format, getUnixTime } from "date-fns";
import {
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  catchError,
  delay,
  EMPTY,
  fromEventPattern,
  last,
  switchMap,
  tap,
  windowToggle,
} from "rxjs";
import { useLatest } from "~/hooks";
import 对比 from "./对比.svg";

type Key<T> = T extends { [key: string]: any }
  ? Pick<T, "key">[keyof Pick<T, "key">]
  : T;

type Line<T> = {
  color: string;
  key: Key<T>;
  label?: string;
  getter: (d: T) => number;
};

interface Props<T, R = any> {
  data?: T[];
  getX: (d: T) => Date;
  multiKey?: (d: T) => string;
  yLabel?: string;
  yUnitLeftLabel?: string;
  yUnitRightLabel?: string;
  hasRightAxis?: boolean;
  lines: Line<T>[];
  thresholds?: R[];
  thresholdKey?: (t: R) => number | undefined;
  areaChart?: boolean;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// 以 Material UI 的 break point 作为标准
// sm 为 600px, 一个图标占 6/12 位置即 300px 宽，留 20px 空间的空白，即 300 - 20 = 280px
//  https://mui.com/material-ui/customization/breakpoints/#default-breakpoints
const minWidth = 280;
const minHeight = 200;
const headerHeight = 40;
const defaultMargin = { top: 10, right: 30, bottom: 30, left: 50 };
const padding = {
  x: 8,
  y: 8,
};

export const LineChart = <T, R>({
  data: originData = [],
  getX,
  multiKey,
  yLabel,
  yUnitLeftLabel,
  yUnitRightLabel,
  hasRightAxis = false,
  lines,
  thresholds,
  thresholdKey,
  /**仅multiKey为空有效 */
  areaChart = false,
  margin,
}: Props<T, R>) => {
  const uniqueId = useId();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState(minHeight);

  const tooNarrow = useMemo(() => width < minWidth, [width]);
  const tooShort = useMemo(
    () => height + headerHeight + padding.y * 2 < minHeight,
    [height],
  );

  const { top, right, bottom, left } = useMemo(() => {
    return { ...defaultMargin, ...margin };
  }, [margin]);

  const [container, setContainer] = useState<HTMLDivElement | null>();
  const [svgContainer, setSvgContainer] = useState<HTMLDivElement | null>();
  const [tipContainer, setTipContainer] = useState<HTMLDivElement | null>();

  const maxIdx = useMemo(() => {
    let idx = 0;
    originData.forEach((d) => {
      for (let i = 0; i < lines.length; i++) {
        if (lines[idx].getter(d) < lines[i].getter(d)) {
          idx = i;
        }
      }
    });
    return idx;
  }, [originData, lines]);

  const getMultiKeyRef = useLatest(multiKey);
  const lineConfigsRef = useLatest(lines);
  const getXRef = useLatest(getX);
  const getYRef = useLatest(lineConfigsRef.current[maxIdx].getter);
  const getThresholdKeyRef = useLatest(thresholdKey);

  const data = useMemo(
    () =>
      originData.sort(
        (a, b) =>
          getUnixTime(getXRef.current(a)) - getUnixTime(getXRef.current(b)),
      ),
    [getXRef, originData],
  );

  const getStatKeys = useCallback((d: InternMap<string, T[]>): string[] => {
    return Array.from(d.keys());
  }, []);
  const getStatValues = useCallback((d: InternMap<string, T[]>): T[][] => {
    return Array.from(d.values());
  }, []);
  const sumstat = useMemo(() => {
    if (!getMultiKeyRef.current) {
      return;
    }
    const dGroup = group(data, getMultiKeyRef.current);
    getStatKeys(dGroup).forEach((d) => {
      dGroup.get(d)?.forEach((evt) => {
        if (getYRef.current(evt) == null) {
          dGroup.delete(d);
        }
      });
    });
    return dGroup;
  }, [data, getStatKeys, getYRef, getMultiKeyRef]);

  const sumstatKeys = useMemo(() => {
    if (!sumstat) {
      return lineConfigsRef.current.map((l) => l.key as string);
    }
    return getStatKeys(sumstat);
  }, [sumstat, getStatKeys, lineConfigsRef]);

  const themeConf = useMemo(() => {
    return lines.filter((t) => sumstatKeys.some((k) => k === t.key));
  }, [sumstatKeys, lines]);

  const [{ tooltipDatum }, setTooltip] = useState<{
    tooltipDatum: T[] | null;
  }>({ tooltipDatum: null });

  const matchTooltipDatum = useCallback(
    (datum: T): T[] => {
      if (getMultiKeyRef.current) {
        return getStatValues(sumstat!).map(
          (s) =>
            s.filter((d) => {
              return +getXRef.current(d) === +getXRef.current(datum);
            })[0],
        );
      }
      return data.filter((d) => {
        return +getXRef.current(d) === +getXRef.current(datum);
      });
    },
    [data, getMultiKeyRef, getStatValues, getXRef, sumstat],
  );

  useEffect(() => {
    if (
      !svgContainer ||
      !tipContainer ||
      !sumstatKeys.length ||
      tooNarrow ||
      tooShort
    ) {
      return;
    }
    const [minX, maxX] = extent(data.map(getXRef.current));
    const [minY, maxY] = extent(
      getMultiKeyRef.current
        ? hasRightAxis
          ? getStatValues(sumstat!)[0].map(getYRef.current)
          : data.map(getYRef.current)
        : data.map(getYRef.current),
    );

    if (minX == null || maxX == null || minY == null || maxY == null) {
      return;
    }

    const xRange = [left, width - right];
    const xScale = scaleTime([minX, maxX], xRange).nice(6);

    const yRange = [height - bottom, top];
    const yScale = scaleLinear([minY, maxY], yRange).nice(5);

    const getRYScale = (): ScaleLinear<number, number, never> | undefined => {
      try {
        const [minYR, maxYR] = extent(
          getStatValues(sumstat!)[1].map(getYRef.current),
        );
        if (minYR === undefined || !maxYR === undefined) {
          return undefined;
        }
        return scaleLinear([minYR > 0 ? 0 : minYR, maxYR], yRange).nice(5);
      } catch (error) {
        console.error(error);
        return undefined;
      }
    };

    const xDuration = maxX.valueOf() - minX.valueOf();
    const threeYears = 1000 * 60 * 60 * 24 * 365 * 3;
    const threeMonthes = 1000 * 60 * 60 * 24 * 30 * 3;
    const threeDays = 1000 * 60 * 60 * 24 * 3;
    const threeHours = 1000 * 60 * 60 * 3;
    const xAxis = axisBottom<Date>(xScale)
      .tickFormat((d) =>
        xDuration > threeYears
          ? format(d, "yyyy")
          : xDuration > threeMonthes
            ? format(d, "MM 月")
            : xDuration > threeDays
              ? format(d, "MM-dd")
              : xDuration > threeHours
                ? format(d, "HH:mm")
                : format(d, "mm:ss"),
      )
      .ticks(5)
      .tickPadding(8);
    const yAxis = axisLeft(yScale)
      .tickFormat((d) => d.toString())
      .ticks(4);

    const svg = select(svgContainer)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", `${width}px`)
      .style("height", `${height}px`);

    // 显示背景色
    const tooltipTarget = svg
      .append("rect")
      .attr("width", `${width}px`)
      .attr("height", `${height}px`)
      .attr("fill", "transparent");

    // 显示 Grid
    const yGrid = svg
      .append("g")
      .attr("transform", `translate(${left}, 0)`)
      .call(
        axisLeft(yScale)
          .tickFormat(() => "")
          .tickSize(-(width - left - right))
          .ticks(4),
      );
    yGrid.selectAll("path").attr("stroke", "#DCDEEA");
    yGrid.selectAll("line").attr("stroke", "#DCDEEA");

    // 显示 x 轴
    const x = svg
      .append("g")
      .attr("transform", `translate(0, ${height - bottom})`);
    const xAxisGroup = x.call(xAxis);
    xAxisGroup.selectAll("path").attr("stroke", "#DCDEEA");
    xAxisGroup.selectAll("line").attr("stroke", "transparent");
    xAxisGroup
      .selectAll("text")
      .attr("fill", "#9A9FA5")
      .attr("font-size", "14px");

    // 显示阈值线
    if ((thresholds || [])?.length > 0 && getThresholdKeyRef.current) {
      const threshold = svg.append("g").attr("class", "line-chart-threshold");
      threshold
        .selectAll("line.line-chart-threshold-line")
        .data(thresholds!)
        .join("line")
        .style("pointer-events", "none")
        .attr("class", "line-chart-threshold-line")
        .attr("stroke", (d) => {
          const n = getThresholdKeyRef.current!(d);
          if (n !== undefined) {
            return "#F95B5B";
          }
          return "transparent";
        })
        .attr("stroke-dasharray", "3 2")
        .attr("x1", left)
        .attr("x2", width - right)
        .attr("y1", (d) => {
          return yScale(getThresholdKeyRef.current!(d) ?? 0);
        })
        .attr("y2", (d) => {
          return yScale(getThresholdKeyRef.current!(d) ?? 0);
        });

      threshold
        .selectAll("text.line-chart-threshold-text")
        .data(thresholds!)
        .join("text")
        .text("预警阈值")
        .attr("fill", (d) => {
          const n = getThresholdKeyRef.current!(d);
          if (n !== undefined) {
            return "#F95B5B";
          }
          return "transparent";
        })
        .attr("font-size", "12px")
        .attr("transform", (d) => {
          return `translate(${width - right - left}, ${yScale(
            (getThresholdKeyRef.current!(d) ?? 0) + 5,
          )})`;
        });
    }

    // 显示 数据
    const color = scaleOrdinal(sumstatKeys, [...themeConf.map((d) => d.color)]);
    if (getMultiKeyRef.current) {
      const yRScale = getRYScale();
      const path = svg
        .append("g")
        .selectAll("path.line-chart-path")
        .data(sumstat!)
        .join("path")
        .attr("class", "line-chart-path")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke", (d) => color(d[0]))
        .attr("d", (d, i) => {
          if (hasRightAxis && i === 1) {
            if (yRScale) {
              return line<T>(
                (d) => xScale(getXRef.current(d)),
                (d) => yRScale(getYRef.current(d)),
              ).curve(curveLinear)(d[1]);
            } else {
              return "";
            }
          } else {
            return line<T>(
              (d) => xScale(getXRef.current(d)),
              (d) => yScale(getYRef.current(d)),
            ).curve(curveLinear)(d[1]);
          }
        });
      path
        .attr("stroke-dasharray", () => {
          // 返回路径总长度
          return (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
        })
        .attr("stroke-dashoffset", () => {
          return (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
        })
        .data(sumstat!)
        .style("fill", "none")
        .style("stroke", (d) => color(d[0]))
        .transition()
        .duration(1500)
        .ease(easeLinear)
        .attr("stroke-dashoffset", 0);
    } else {
      const pathLines = svg
        .append("g")
        .selectAll("path.line-chart-path")
        .data(lineConfigsRef.current);
      pathLines
        .join("path")
        .merge(pathLines)
        .classed("line", true)
        .attr("class", "line-chart-path")
        .style("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke", (d) => color(d.color))
        .transition()
        .attr("d", (cfg) => {
          return line<T>(
            (d) => xScale(getXRef.current(d)),
            (d) => yScale(cfg.getter(d)),
          )(data);
        });
      if (areaChart) {
        const pathAreas = svg
          .append("g")
          .selectAll("path.area-chart-path")
          .data(lineConfigsRef.current);
        pathAreas
          .join("path")
          .merge(pathAreas)
          .classed("area", true)
          .attr("class", "area-chart-path")
          .style("pointer-events", "none")
          .style("fill", (d) => color(d.color))
          .style("fill-opacity", ".2")
          .transition()
          .attr("d", (cfg) => {
            return area<T>(
              (d) => xScale(getXRef.current(d)),
              () => height - bottom,
              (d) => yScale(cfg.getter(d)),
            )(data);
          });
      }
    }

    // 显示 y 轴
    const drawYAxis = (l: number, axis: Axis<NumberValue>) => {
      const y = svg.append("g").attr("transform", `translate(${l}, 0)`);
      const yAxisGroup = y.call(axis);
      yAxisGroup.selectAll("path").attr("stroke", "#DCDEEA");
      yAxisGroup.selectAll("line").attr("stroke", "transparent");
      yAxisGroup
        .selectAll("text")
        .attr("fill", "#9A9FA5")
        .attr("font-size", "14px");
    };
    drawYAxis(left, yAxis);
    // 显示右边y轴
    if (getMultiKeyRef.current && hasRightAxis) {
      try {
        const yScale = getRYScale();
        if (yScale) {
          const yAxis = axisRight(yScale)
            .tickFormat((d) => d.toString())
            .ticks(4);
          drawYAxis(width - right, yAxis);
        }
      } catch (error) {
        console.error(error);
      }
    }

    // 因为 tooltip 元素会出现在鼠标当前位置导致触发 mouseleave，务必设置 tooltip 元素的 point-event 样式为 none
    const mouseenter$ = fromEventPattern<MouseEvent>((addHandler) => {
      tooltipTarget.on("mouseenter", addHandler);
    });
    const mousemove$ = fromEventPattern<MouseEvent>(
      (addHandler) => {
        tooltipTarget.on("mousemove", addHandler);
      },
      undefined,
      (evt) => evt,
    );
    const mouseout$ = fromEventPattern<MouseEvent>((addHandler) => {
      tooltipTarget.on("mouseleave", addHandler);
    });

    const bisectDate = bisector<T, ReturnType<typeof getX>>((d, t) => {
      const r = getXRef.current(d);
      return r.valueOf() - t.valueOf();
    }).left;

    const tooltipLine = svg.append("g").attr("class", "tooltip");

    const removeTooltip = () => {
      selectAll(".tooltip>.line-chart-tip").remove();
      selectAll(".tooltip>circle").remove();
      select(tipContainer).style("opacity", 0);
    };

    const tooltipTask = mousemove$
      .pipe(
        windowToggle(mouseenter$, () => mouseout$),
        switchMap((move$) => {
          return move$.pipe(
            tap((evt) => {
              const [offsetX, offsetY] = pointer(evt);
              if (offsetY < top || offsetY > height - bottom) {
                removeTooltip();
                return;
              }
              const index = bisectDate(data, xScale.invert(offsetX));
              const datum = data[index];
              if (!datum) {
                return;
              }
              removeTooltip();
              tooltipLine
                .append("line")
                .style("pointer-events", "none")
                .attr("class", "line-chart-tip")
                .attr("stroke", themeConf[0].color)
                .attr("stroke-dasharray", "3 2")
                .attr("x1", xScale(getXRef.current(datum)))
                .attr("x2", xScale(getXRef.current(datum)))
                .attr("y1", top)
                .attr("y2", height - bottom);
              if (getMultiKeyRef.current) {
                const yRScale = getRYScale();
                tooltipLine
                  .selectAll("circle")
                  .attr("class", "line-chart-tip-circle")
                  .data(sumstat!)
                  .join("circle")
                  .style("pointer-events", "none")
                  .attr("stroke", "white")
                  .attr("stroke-width", 2)
                  .attr("r", 4)
                  .attr("cx", xScale(getXRef.current(datum)))
                  .style("fill", (d) => color(d[0]))
                  .attr("cy", (d, i) => {
                    const result = d[1].find((d) => {
                      return +getXRef.current(d) === +getXRef.current(datum);
                    });
                    if (!result) {
                      return null;
                    }
                    if (hasRightAxis && i === 1) {
                      if (yRScale) {
                        return yRScale(getYRef.current(result));
                      }
                      return null;
                    }
                    return yScale(getYRef.current(result));
                  });
              } else {
                tooltipLine
                  .selectAll("circle")
                  .attr("class", "line-chart-tip-circle")
                  .data(lineConfigsRef.current)
                  .join("circle")
                  .style("pointer-events", "none")
                  .attr("stroke", "white")
                  .attr("stroke-width", 2)
                  .attr("r", 4)
                  .attr("cx", xScale(getXRef.current(datum)))
                  .style("fill", (d) => color(d.color))
                  .attr("cy", (cfg) => {
                    const result = data.find((d) => {
                      return +getXRef.current(d) === +getXRef.current(datum);
                    });
                    if (!result) {
                      return -top;
                    }
                    return yScale(cfg.getter(result));
                  });
              }
              let datumX = xScale(+getXRef.current(datum));
              const { clientWidth, clientHeight } = tipContainer;
              if (datumX + clientWidth + 10 > width - right) {
                datumX = datumX - clientWidth - 20;
              }

              const matchDatum = matchTooltipDatum(datum);

              select(tipContainer).style("opacity", 1);
              setTooltip({
                tooltipDatum: matchDatum,
              });

              select(tipContainer)
                .transition()
                .duration(0)
                .ease(easeLinear)
                .style("opacity", 1)
                .style("top", `${clientHeight / 2 - 20}px`)
                .style("left", `${datumX}px`);
            }),
            last(),
            catchError((err) => {
              console.error(err);
              return EMPTY;
            }),
            delay(300),
            tap(() => {
              removeTooltip();
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
      tooltipTask.unsubscribe();
      svg.remove();
    };
  }, [
    bottom,
    data,
    getStatValues,
    getXRef,
    getYRef,
    height,
    left,
    right,
    sumstat,
    sumstatKeys,
    svgContainer,
    themeConf,
    tipContainer,
    tooNarrow,
    tooShort,
    top,
    width,
    hasRightAxis,
    getMultiKeyRef,
    lineConfigsRef,
    matchTooltipDatum,
    thresholds,
    getThresholdKeyRef,
  ]);
  useEffect(() => {
    if (!container) {
      return;
    }

    const handler = () => {
      setWidth(container.clientWidth);
      setHeight(
        Math.max(minHeight, container.clientHeight) -
        headerHeight -
        padding.y * 2,
      );
    };
    handler();
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [container]);

  return (
    <div
      className="w-full h-full bg-[#F4F6FB] rounded-lg relative"
      ref={setContainer}
      style={{
        minHeight: `${minHeight}px`,
        padding: `${padding.y}px ${padding.x}px `,
      }}
    >
      {tooNarrow && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          窗口过窄
        </span>
      )}
      {!tooNarrow && sumstatKeys.length === 0 && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          暂无数据
        </span>
      )}
      <div
        className={clsx(
          "flex flex-col justify-around relative",
          tooNarrow && "invisible",
        )}
        style={{ height: headerHeight }}
      >
        <div className="flex justify-start items-center px-4">
          <div className="font-bold text-sm text-[#040F1F] whitespace-nowrap">
            {yLabel ?? "-"}
          </div>
          <ul className="flex-1 ml-5 flex justify-between items-center">
            <li className="flex justify-start flex-row-reverse items-center h-full ml-4 flex-1 whitespace-nowrap">
              {themeConf
                .filter((_, i) => i < sumstatKeys.length)
                .map((d, i) => (
                  <p
                    key={`${d?.label ?? d.key}-${i}`}
                    className="text-[12px] text-[#9A9FA5] mr-7 first:mr-0 relative"
                  >
                    <span
                      className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%]"
                      style={{ backgroundColor: d.color }}
                    ></span>
                    <span className="ml-1">{d.label}</span>
                  </p>
                ))}
            </li>
            <div className="flex justify-end items-center">
              <div
                className="border-[#e3e5f0] border-[1px] border-solid text-[#787C82] text-[12px] flex justify-center items-center rounded-[6px] px-[4px] ml-5 cursor-pointer"
              >
                <img src={对比} alt="" />
                <span className="whitespace-nowrap">对比</span>
              </div>
            </div>
          </ul>
        </div>
        <ul className="flex justify-between items-center px-4">
          <li className="text-[12px] text-[#9A9FA5]">
            {yUnitLeftLabel ?? "-"}
          </li>
          {true && (
            <li className="text-[12px] text-[#9A9FA5]">
              {yUnitRightLabel ?? ""}
            </li>
          )}
        </ul>
      </div>
      <div
        ref={setSvgContainer}
        style={{
          height: `calc(100% - ${headerHeight}px)`,
        }}
        className={clsx("flex flex-1 relative", tooNarrow && "invisible")}
      >
        <TooltipContainer
          ref={setTipContainer}
          className="absolute left-0 top-0 opacity-0 transition-all pointer-events-none p-2 rounded-lg"
        >
          {tooltipDatum && (
            <div className="text-xs text-[#040F1F] pointer-events-none">
              {format(getXRef.current(tooltipDatum[0]), "yyyy-MM-dd HH:mm")}
            </div>
          )}
          {getMultiKeyRef.current
            ? tooltipDatum?.map((d, i) => {
              let color: string | undefined;
              let value: number | undefined;
              // TODO: 处理可能会出错的错误
              try {
                color =
                  themeConf.find(
                    (item) => getMultiKeyRef.current!(d) === item.key,
                  )?.color ?? "white";
                value = getYRef.current(d);
              } catch (error) {
                color = "white";
                console.warn(error);
              }
              if (!value) {
                return null;
              }
              return (
                <TooltipContent
                  key={`${uniqueId}-${i}`}
                  color={color}
                  value={value}
                />
              );
            })
            : lineConfigsRef.current.map((d, i) => {
              let color: string | undefined;
              try {
                color = lineConfigsRef.current[i].color;
              } catch (error) {
                color = "white";
                console.error(error);
              }
              const value = tooltipDatum?.[0] && d.getter(tooltipDatum?.[0]);
              return (
                <TooltipContent
                  key={`${d.key as string}-${i}`}
                  color={color}
                  value={value}
                />
              );
            })}
        </TooltipContainer>
      </div>
    </div>
  );
};

const TooltipContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    {...props}
    ref={ref}
    className={`bg-white/70 backdrop-blur-[1px] ${props.className ?? ""}`}
  />
));

const TooltipContent: React.FC<{ color: string; value?: string | number }> = ({
  color,
  value,
}) => {
  return (
    <div className="pointer-events-none text-sm text-[#040F1F] font-semibold ml-5 first:ml-0 relative">
      <span
        className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%]"
        style={{ backgroundColor: color }}
      ></span>
      ：<span className="ml-2">{value ?? "-"}</span>
    </div>
  );
};
