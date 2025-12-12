import clsx from "clsx";
import {
  area,
  axisBottom,
  axisLeft,
  bisector,
  curveLinear,
  curveNatural,
  extent,
  line,
  pointer,
  scaleLinear,
  scaleTime,
  select,
} from "d3";
import { format } from "date-fns";
import { clamp } from "ramda";
import React, {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  defer,
  EMPTY,
  EmptyError,
  fromEventPattern,
  iif,
  merge,
  Observable,
} from "rxjs";
import {
  catchError,
  delay,
  finalize,
  last,
  map,
  startWith,
  switchAll,
  switchMap,
  tap,
  windowToggle,
  windowWhen,
} from "rxjs/operators";
import {
  useBehaviorSubject,
  useReplayStream,
  type useSubject,
} from "../../hooks";

export type ArrayItem<T> = T extends Array<infer U> ? U : never;

export type AreaChartConfig<T> = {
  key: string;
  data: T[];
  color: string;
  label?: string;
  getX: (d: T) => Date;
  getY: (d: T) => number;
  /**
   * 线的宽度，默认1
   */
  lineWidth?: number;

  /**
   * 曲线类型，默认为直线
   */
  curve?: "linear" | "natural";
};

interface Props<Charts> {
  yLabel?: ReactNode;
  yUnitLeftLabel?: string;
  charts: Charts;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  timeScale?: [Date, Date];
  thresholds?: any[];
  /**
   * 不显示 x 轴的标签
   */
  noXLabel?: boolean;

  /**
   * 不显示 y 轴的标签
   */
  noYLabel?: boolean;

  /**
   * 不显示 x 轴的刻度
   */
  noXTick?: boolean;

  /**
   * 不显示 y 轴的刻度
   */
  noYTick?: boolean;

  /**
   * 不显示网格线
   */
  noGrid?: boolean;

  /**
   * 不显示图例
   */
  noLegend?: boolean;

  /**
   * 不启用 tooltip 交互
   */
  noTooltip?: boolean;

  /**
   * X 轴显示的标签数量，默认为自动
   *
   * @default auto
   */
  xTicks?: "auto" | number;

  /**
   * SVG 元素的背景色，默认为透明
   *
   * @default transparent
   */
  svgBgColor?: string;

  /**
   * Tooltip 区域的背景色，默认为透明
   *
   * @default transparent
   */
  tooltipAreaBgColor?: string;

  /**
   * tooltip 同步流
   */
  tooltipSync?: ReturnType<
    typeof useSubject<
      Observable<{
        offsetX: number;
        dateUnderneathPointer: Date;
      } | null>
    >
  >;

  /**
   * x轴与y轴的字体大小，默认为14px
   *
   * @default 14
   */
  axisFontSize?: number;

  /**
   * 是否扩展 x 轴以对齐日期
   */
  niceX?: number;
}

const defaultMargin = { top: 10, right: 20, bottom: 30, left: 20 };

export function AreaChart3<T1>(
  props: Props<[AreaChartConfig<T1>]>,
): React.ReactElement;
export function AreaChart3<T1, T2>(
  props: Props<[AreaChartConfig<T1>, AreaChartConfig<T2>]>,
): React.ReactElement;
export function AreaChart3<T1, T2, T3>(
  props: Props<[AreaChartConfig<T1>, AreaChartConfig<T2>, AreaChartConfig<T3>]>,
): React.ReactElement;
export function AreaChart3<T1, T2, T3, T4>(
  props: Props<
    [
      AreaChartConfig<T1>,
      AreaChartConfig<T2>,
      AreaChartConfig<T3>,
      AreaChartConfig<T4>,
    ]
  >,
): React.ReactElement;
export function AreaChart3<T1, T2, T3, T4, T5>(
  props: Props<
    [
      AreaChartConfig<T1>,
      AreaChartConfig<T2>,
      AreaChartConfig<T3>,
      AreaChartConfig<T4>,
      AreaChartConfig<T5>,
    ]
  >,
): React.ReactElement;
export function AreaChart3<T1, T2, T3, T4, T5, T6>(
  props: Props<
    [
      AreaChartConfig<T1>,
      AreaChartConfig<T2>,
      AreaChartConfig<T3>,
      AreaChartConfig<T4>,
      AreaChartConfig<T5>,
      AreaChartConfig<T6>,
    ]
  >,
): React.ReactElement;
export function AreaChart3<T1, T2, T3, T4, T5, T6, T7>(
  props: Props<
    [
      AreaChartConfig<T1>,
      AreaChartConfig<T2>,
      AreaChartConfig<T3>,
      AreaChartConfig<T4>,
      AreaChartConfig<T5>,
      AreaChartConfig<T6>,
      AreaChartConfig<T7>,
    ]
  >,
): React.ReactElement;
export function AreaChart3({
  yLabel,
  yUnitLeftLabel,
  charts,
  margin,
  timeScale,
  thresholds = [],
  noYLabel,
  noXTick,
  noYTick,
  noGrid,
  noLegend,
  noTooltip,
  xTicks = "auto",
  svgBgColor = "transparent",
  tooltipAreaBgColor = "transparent",
  tooltipSync,
  niceX,
  axisFontSize = 14,
}: Props<AreaChartConfig<unknown>[]>) {
  const { top, right, bottom, left } = useMemo(() => {
    return { ...defaultMargin, ...margin };
  }, [margin]);

  const [container$, setContainer] = useBehaviorSubject<HTMLDivElement | null>(
    null,
  );
  const [tooltipDatum, setTooltip] = useState<{
    t: Date;
    left: number;
    data: (number | null)[];
  } | null>();

  const charts$ = useReplayStream(charts);
  const timeScale$ = useReplayStream(timeScale);
  const thresholds$ = useReplayStream(thresholds);

  useEffect(() => {
    const task = container$
      .pipe(
        switchMap(function handleContainerChange(container) {
          if (!container) {
            return EMPTY;
          }

          // 初始化结构
          const svg = select(container)
            .append("svg")
            .style("background-color", svgBgColor);

          const nonInteractiveGroup = svg
            .append("g")
            .style("pointer-events", "none");

          // 创建 Grid group
          const yGridGroup = nonInteractiveGroup.append("g");

          // 创建座标轴组
          const xAxisGroup = nonInteractiveGroup.append("g");
          const yAxisGroup = nonInteractiveGroup.append("g");

          // 左侧数据组
          const leftDataGroup = nonInteractiveGroup.append("g");
          // 右侧数据组

          // 渐变
          const leftDataGradientGroup = nonInteractiveGroup.append("g");

          // 创建 threshold 组
          const thresholdGroup = nonInteractiveGroup
            .append("g")
            .classed("line-chart-threshold", true);

          // 创建响应 tooltip 的元素以及相关的事件流
          const tooltipTarget = svg
            .append("rect")
            .attr("fill", tooltipAreaBgColor);

          const mouseenter$ = fromEventPattern<MouseEvent>(
            (handler) => {
              tooltipTarget.on("mouseenter", handler);
            },
            () => {
              tooltipTarget.on("mouseenter", null);
            },
          );
          const mousemove$ = fromEventPattern<MouseEvent>(
            (handler) => {
              tooltipTarget.on("mousemove", handler);
            },
            () => {
              tooltipTarget.on("mousemove", null);
            },
            (x) => x,
          );
          const mouseleave$ = fromEventPattern<MouseEvent>(
            (handler) => {
              tooltipTarget.on("mouseleave", handler);
            },
            () => {
              tooltipTarget.on("mouseleave", null);
            },
          );

          // 创建显示 tooltip 的组
          const tooltipGroup = nonInteractiveGroup
            .append("g")
            .classed("tooltip", true)
            .style("pointer-events", "none");

          return new Observable<{ width: number; height: number }>((obs) => {
            const observer = new ResizeObserver(() => {
              obs.next({
                width: container.clientWidth,
                height: container.clientHeight,
              });
            });
            // 应该确保 container 的尺寸不会随内容变化，因此 container 应该设置 overflow: hidden
            observer.observe(container);

            return () => {
              observer.disconnect();
            };
          }).pipe(
            finalize(() => {
              // 在 container 变化时移除 svg
              svg.remove();
            }),
            startWith({
              width: container.clientWidth,
              height: container.clientHeight,
            }),
            tap(function handleResize({ width, height }) {
              // 更新 svg 元素的画板范围
              svg
                .attr("viewBox", `0 0 ${width} ${height}`)
                .style("width", width + "px")
                .style("height", height + "px");

              tooltipTarget
                .attr("width", width + "px")
                .attr("height", height + "px");
            }),
            switchMap(function handleResize({ width, height }) {
              return timeScale$.pipe(
                switchMap(function handleTimeScaleChange(specifiedTimeScale) {
                  return charts$.pipe(
                    switchMap(function handleDataChange(charts) {
                      const [minX, maxX] =
                        specifiedTimeScale ??
                        extent(
                          charts.flatMap((chart) => chart.data.map(chart.getX)),
                        );
                      const [minY, maxY] = extent(
                        charts.flatMap((chart) => chart.data.map(chart.getY)),
                      );

                      if (
                        minX == null ||
                        maxX == null ||
                        minY == null ||
                        maxY == null
                      ) {
                        return EMPTY;
                      }

                      let yAxisWidth = 0;

                      const yRange = [height - bottom, top];
                      // TODO: 如果 y 轴的 domain 只支持有限的范围，范围应该通过参数提供
                      const yScale = scaleLinear(
                        [minY > 0 ? 0 : minY, maxY],
                        yRange,
                      ).nice(5);

                      const xDuration = maxX.valueOf() - minX.valueOf();
                      const threeYears = 1000 * 60 * 60 * 24 * 365 * 3;
                      const threeMonthes = 1000 * 60 * 60 * 24 * 30 * 3;
                      const threeDays = 1000 * 60 * 60 * 24 * 3;
                      const threeHours = 1000 * 60 * 60 * 3;

                      // 更新 y 轴
                      if (!noYTick) {
                        yAxisGroup
                          .call(
                            axisLeft(yScale)
                              .tickFormat((d) => {
                                if (Number.isInteger(d as number)) {
                                  return d.toString();
                                }
                                return (d as number).toFixed(2);
                              })
                              .ticks(4),
                          )
                          .attr("transform", () => {
                            // 动态获取y轴的宽度
                            yAxisWidth = (
                              yAxisGroup.node() as SVGGElement
                            ).getBBox().width;
                            return `translate(${yAxisWidth + left}, 0)`;
                          })
                          .call((g) => {
                            g.selectAll("path").attr("stroke", "#DCDEEA");
                            g.selectAll("line").attr("stroke", "transparent");
                            g.selectAll("text")
                              .attr("fill", "#9A9FA5")
                              .attr("font-size", `${axisFontSize}px`);
                          });
                      }

                      const xRange = [left + yAxisWidth, width - right];
                      const xScale = scaleTime([minX, maxX], xRange);

                      if (niceX != null) {
                        xScale.nice(niceX);
                      }

                      // 更新 x 轴
                      if (!noXTick) {
                        xAxisGroup
                          .attr("transform", `translate(0, ${height - bottom})`)
                          .call(
                            axisBottom<Date>(xScale)
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
                              .ticks(typeof xTicks === "number" ? xTicks : 5)
                              .tickPadding(8),
                          )
                          .call((g) => {
                            g.selectAll("path").attr("stroke", "#DCDEEA");
                            g.selectAll("line").attr("stroke", "transparent");
                            g.selectAll("text")
                              .attr("fill", "#9A9FA5")
                              .attr("font-size", `${axisFontSize}px`);
                          });
                      }

                      // 更新 Grid
                      if (!noGrid) {
                        yGridGroup
                          .attr(
                            "transform",
                            `translate(${left + yAxisWidth}, 0)`,
                          )
                          .call(
                            axisLeft(yScale)
                              .tickFormat(() => "")
                              .tickSize(-(width - left - right - yAxisWidth))
                              .ticks(4),
                          )
                          .call((g) => {
                            g.selectAll("path").attr("stroke", "#DCDEEA");
                            g.selectAll("line").attr("stroke", "#DCDEEA");
                          });
                      }

                      const dataInrangeList = charts.map((chart) =>
                        chart.data.filter((datum) => {
                          const t = chart.getX(datum);
                          return t >= minX && t < maxX;
                        }),
                      );
                      const bisectDateList = charts.map(
                        (chart) =>
                          bisector<
                            (typeof chart)["data"][0],
                            ReturnType<(typeof chart)["getX"]>
                          >((d, t) => {
                            const r = chart.getX(d);
                            return r.valueOf() - t.valueOf();
                          }).right,
                      );

                      // 更新渐变定义
                      leftDataGradientGroup
                        .selectAll("linearGradient")
                        .data(charts)
                        .join(
                          (enter) => {
                            return enter
                              .append("linearGradient")
                              .call((lg) => {
                                lg.append("stop")
                                  .classed(
                                    "area-chart-linear-gradient-start",
                                    true,
                                  )
                                  .attr("offset", "0%")
                                  .style("stop-color", (d) => d.color)
                                  .style("stop-opacity", "1");
                                lg.append("stop")
                                  .classed(
                                    "area-chart-linear-gradient-stop",
                                    true,
                                  )
                                  .attr("offset", "100%")
                                  .style("stop-color", (d) => d.color)
                                  .style("stop-opacity", ".1");
                              })
                              .attr(
                                "id",
                                (chart, i) =>
                                  `${chart.key}-defs-child-linear-gradient-${i}`,
                              )
                              .attr("x1", "0%")
                              .attr("y1", "0%")
                              .attr("x2", "0%")
                              .attr("y2", "100%");
                          },
                          (update) => {
                            return update
                              .attr(
                                "id",
                                (chart, i) =>
                                  `${chart.key}-defs-child-linear-gradient-${i}`,
                              )
                              .call((def) => {
                                def
                                  .select(
                                    "stop.area-chart-linear-gradient-stop",
                                  )
                                  .style("stop-color", (d) => d.color);
                                def
                                  .select(
                                    "stop.area-chart-linear-gradient-stop",
                                  )
                                  .style("stop-color", (d) => d.color);
                              });
                          },
                        );

                      // 更新面积数据
                      leftDataGroup
                        .selectAll("path.area-chart-path")
                        .data(charts)
                        .join("path")
                        .classed("area-chart-path", true)
                        .style("pointer-events", "none")
                        .attr("pointer-events", "none")
                        .style(
                          "fill",
                          (chart, i) =>
                            `url(#${chart.key}-defs-child-linear-gradient-${i})`,
                        )
                        .style("fill-opacity", ".2")
                        .transition()
                        .attr("d", (chart, idx) => {
                          const curveFactory =
                            chart.curve === "natural"
                              ? curveNatural
                              : curveLinear;

                          return area<ArrayItem<(typeof chart)["data"]>>(
                            (d) => xScale(chart.getX(d)),
                            () => height - bottom,
                            (d) => yScale(chart.getY(d)),
                          ).curve(curveFactory)(dataInrangeList[idx]);
                        });

                      // 更新线数据
                      leftDataGroup
                        .selectAll("path.line-chart-path")
                        .data(charts)
                        .join("path")
                        .classed("line-chart-path", true)
                        .style("pointer-events", "none")
                        .attr("pointer-events", "none")
                        .attr("fill", "none")
                        .attr("stroke-width", (d) => d.lineWidth ?? 1)
                        .attr("stroke", (d) => d.color)
                        .attr("d", (chart, idx) => {
                          const curveFactory =
                            chart.curve === "natural"
                              ? curveNatural
                              : curveLinear;

                          return line<ArrayItem<(typeof chart)["data"]>>(
                            (d) => xScale(chart.getX(d)),
                            (d) => yScale(chart.getY(d)),
                          ).curve(curveFactory)(dataInrangeList[idx]);
                        });

                      return merge(
                        thresholds$.pipe(
                          tap((thresholds) => {
                            // 更新阈值线和标签
                            thresholdGroup
                              .call((g) => {
                                g.selectAll("line.line-chart-threshold-line")
                                  .data(thresholds)
                                  .join("line")
                                  .classed("line-chart-threshold-line", true)
                                  .style("pointer-events", "none")
                                  .attr("stroke", "#F95B5B")
                                  .attr("stroke-dasharray", "3 2")
                                  .attr("x1", left)
                                  .attr("x2", width - right)
                                  .attr("y1", (d) => {
                                    return yScale(d.value);
                                  })
                                  .attr("y2", (d) => {
                                    return yScale(d.value);
                                  });
                              })
                              .call((g) => {
                                g.selectAll("text.line-chart-threshold-text")
                                  .data(thresholds)
                                  .join("text")
                                  .classed("line-chart-threshold-text", true)
                                  .text("预警阈值")
                                  .attr("fill", "#F95B5B")
                                  .attr("font-size", "12px")
                                  .attr("transform", (d) => {
                                    const tx = width - right - left;
                                    const ty = yScale(d.value + 5);
                                    return `translate(${tx}, ${ty})`;
                                  })
                                  .style("pointer-events", "none");
                              });
                          }),
                        ),
                        iif(
                          () => !!noTooltip,
                          EMPTY,
                          defer(() => {
                            const syncStream$ = tooltipSync?.[0];
                            const pushDateToSync = tooltipSync?.[1];

                            const b = syncStream$?.pipe(
                              windowWhen(() => mouseleave$),
                              switchAll(),
                            );
                            const a: typeof b = mousemove$.pipe(
                              windowToggle(mouseenter$, () => mouseleave$),
                              map((move$) => {
                                return move$.pipe(
                                  map((evt) => {
                                    // 检查当前鼠标的位置，如果超出了显示范围，移除 tooltip
                                    const [offsetX, offsetY] = pointer(evt);
                                    if (
                                      offsetY < top ||
                                      offsetY > height - bottom
                                    ) {
                                      return null;
                                    }

                                    // 查找数据，如果没有找到，保持当前状态
                                    const dateUnderneathPointer =
                                      xScale.invert(offsetX);
                                    return {
                                      dateUnderneathPointer,
                                      offsetX: clamp(
                                        xRange[0],
                                        xRange[1],
                                        offsetX,
                                      ),
                                    };
                                  }),
                                );
                              }),
                              tap((stream) => {
                                pushDateToSync?.(stream);
                              }),
                            );

                            return merge(a, b ?? EMPTY);
                          }),
                        ).pipe(
                          switchMap((move$) => {
                            return move$.pipe(
                              tap((result) => {
                                if (!result) {
                                  // removeTooltip();
                                  return;
                                }

                                const { dateUnderneathPointer, offsetX } =
                                  result;

                                // 查找数据，如果没有找到，保持当前状态
                                const tooltipDataList = dataInrangeList.map(
                                  (data, idx) => {
                                    const dataBisector = bisectDateList[idx];
                                    const datumIndex = dataBisector(
                                      data,
                                      dateUnderneathPointer,
                                    );
                                    const datum = data[datumIndex];
                                    return datum != null
                                      ? charts[idx].getY(datum)
                                      : null;
                                  },
                                );

                                // 显示指示线
                                tooltipGroup.attr("opacity", 1).call((g) => {
                                  g.selectAll("line.line-chart-tip")
                                    .data([offsetX])
                                    .join(
                                      (enter) => {
                                        return enter
                                          .append("line")
                                          .classed("line-chart-tip", true)
                                          .style("pointer-events", "none")
                                          .attr("stroke", "#4C4DE2")
                                          .attr("stroke-dasharray", "3 2")
                                          .attr("x1", offsetX)
                                          .attr("x2", offsetX)
                                          .attr("y1", top)
                                          .attr("y2", height - bottom);
                                      },
                                      (update) => {
                                        return update
                                          .attr("x1", offsetX)
                                          .attr("x2", offsetX);
                                      },
                                    );
                                });

                                setTooltip({
                                  t: dateUnderneathPointer,
                                  left: offsetX,
                                  data: tooltipDataList,
                                });
                              }),
                              last(),
                              catchError((err) => {
                                if (!(err instanceof EmptyError)) {
                                  console.error(err);
                                }
                                return EMPTY;
                              }),
                              delay(300),
                              finalize(() => {
                                setTooltip(null);
                                tooltipGroup.attr("opacity", 0);
                              }),
                            );
                          }),
                        ),
                      );
                    }),
                  );
                }),
              );
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
    axisFontSize,
    bottom,
    charts$,
    container$,
    left,
    niceX,
    noGrid,
    noTooltip,
    noXTick,
    noYTick,
    right,
    svgBgColor,
    thresholds$,
    timeScale$,
    tooltipAreaBgColor,
    tooltipSync,
    top,
    xTicks,
  ]);

  const [tooltipContainer, setTooltipContainer] =
    useState<HTMLDivElement | null>();
  // 调整 tooltip 的位置
  useLayoutEffect(() => {
    if (!tooltipContainer || !tooltipDatum) {
      return;
    }

    const task = container$
      .pipe(
        switchMap((chartContainer) => {
          if (!chartContainer) {
            return EMPTY;
          }

          return new Observable(() => {
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  const tx =
                    entry.intersectionRatio > 0 &&
                      tooltipDatum.left + entry.target.clientWidth + 10 >
                      chartContainer.clientWidth - right
                      ? -entry.target.clientWidth - 20
                      : 0;
                  (entry.target as any).style.transform =
                    `translate(${tx}px, -50%)`;
                });
              },
              {
                root: chartContainer,
                rootMargin: "0px",
                threshold: 0,
              },
            );
            observer.observe(tooltipContainer);

            return () => {
              observer.disconnect();
            };
          });
        }),
      )
      .subscribe();

    return () => {
      task.unsubscribe();
    };
  }, [container$, right, tooltipContainer, tooltipDatum]);

  if (charts.length === 0) {
    return (
      <div className="h-full bg-white rounded-2xl p-2 relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          <div className="bg-[#f4f6fb] text-[#b7b6bb] w-[5.625rem] h-[2.125rem] rounded-[2.125rem] text-xs top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center">
            无数据
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full relative flex flex-col">
      <div className={clsx("flex flex-col justify-around relative")}>
        <div className="flex justify-start items-center">
          <div
            className={clsx(
              "font-bold text-xl text-[#040F1F] whitespace-nowrap",
              noYLabel && "hidden",
            )}
          >
            {yLabel ?? "-"}
          </div>
          <div
            className={clsx(
              "flex-1 ml-5 flex justify-between items-center",
              noLegend && "hidden",
            )}
          >
            <div className="flex justify-start flex-row-reverse items-center h-full ml-4 flex-1 overflow-x-scroll whitespace-nowrap">
              {charts.map((d, i) => (
                <div
                  key={`${d?.label ?? d.key}-${i}`}
                  className="text-base leading-[25px] text-[#9A9FA5] mr-7 first:mr-0 relative flex justify-start items-center"
                >
                  <div
                    className="w-3 h-3 rounded-[50%] mr-1"
                    style={{ backgroundColor: d.color }}
                  ></div>
                  <div className="ml-1">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ul className="flex justify-between items-center px-4">
          <li className="text-[12px] text-[#9A9FA5]">{yUnitLeftLabel ?? ""}</li>
        </ul>
      </div>
      <div
        ref={setContainer}
        className="flex-1 w-full flex relative mt-[3px] overflow-hidden"
      >
        {tooltipDatum && (
          <TooltipContainer
            ref={(el) => {
              setTooltipContainer(el);
            }}
            left={tooltipDatum.left}
          >
            <div>
              <div className="text-xs text-[#040F1F] pointer-events-none whitespace-nowrap">
                {format(tooltipDatum.t, "yyyy-MM-dd HH:mm:ss")}
              </div>
              {tooltipDatum.data.map((d, i) => {
                const chart = charts[i];
                const color = chart.color;
                return (
                  <TooltipContent
                    key={chart.key}
                    color={color}
                    value={d ?? "-"}
                  />
                );
              })}
            </div>
          </TooltipContainer>
        )}
      </div>
    </div>
  );
}

interface TooltipContainerProps extends HTMLAttributes<HTMLDivElement> {
  left: number;
}
const TooltipContainer = forwardRef<HTMLDivElement, TooltipContainerProps>(
  ({ left, style, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      style={{ ...style, left }} // 把动态 left 内联进去
      className={[
        'absolute top-1/2 -translate-y-1/2', // 垂直居中
        'bg-white/70 backdrop-blur-[1px]',    // 毛玻璃
        'p-2 rounded-md',                     // 内边距 8px + 圆角 0.5rem
        'pointer-events-none transition-all', // 禁用交互 + 全属性过渡
        rest.className
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
);

const TooltipContent: React.FC<{ color: string; value?: string | number }> = ({
  color,
  value,
}) => {
  return (
    <div className="pointer-events-none text-sm text-[#040F1F] font-semibold ml-5 first:ml-0 relative whitespace-nowrap">
      <span
        className="absolute top-1/2 left-[-12px] w-[10px] h-[10px] rounded-[50%] translate-y-[-50%] whitespace-nowrap"
        style={{ backgroundColor: color }}
      ></span>
      ：<span className="ml-2 whitespace-nowrap">{value ?? "-"}</span>
    </div>
  );
};
