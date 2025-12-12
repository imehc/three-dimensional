import {
	area,
	axisBottom,
	axisLeft,
	bisector,
	curveCatmullRom,
	extent,
	line,
	pointer,
	scaleLinear,
	scaleTime,
	select,
} from "d3";
import { format, getUnixTime, isAfter, isBefore, max, min } from "date-fns";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	catchError,
	delay,
	EMPTY,
	EmptyError,
	finalize,
	fromEvent,
	fromEventPattern,
	last,
	map,
	startWith,
	switchMap,
	tap,
	windowToggle,
} from "rxjs";
import { useBehaviorSubject, useSafeId } from "../../hooks";
import { CheckBox } from "..";

export type LineConfig<T> = {
	data?: T[];
	isArea?: boolean;
	color: string;
	/**
	 * 唯一id
	 */
	uniqueId: string;
	getX: (d: T) => Date | number;
	getY: (d: T) => number | undefined;
	unit?: string;
	/**
	 * 别名
	 */
	label?: string;
	/**
	 * 将 null 或 undefined 视为 0
	 */
	treatNoneAsZero?: boolean;
};
export type RequiredLineConfig<T> = Omit<LineConfig<T>, "data"> &
	Required<Pick<LineConfig<T>, "data">>;

interface Props<T = unknown> {
	lines: LineConfig<T>[];
	margin?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	thresholds?: any[];
	timeScale: [Date, Date];
	style?: CSSProperties;
	/**
	 * 显示指定时期的数据
	 */
	rangeTimeScale?: [Date, Date];
}

const defaultMargin = { top: 0, right: 0, bottom: 30, left: 0 };

export function LineChart3<T>({
	lines: originLines = [],
	thresholds = [],
	margin,
	timeScale,
	rangeTimeScale,
}: Props<T>) {
	const uniqueId = useSafeId();

	const { top, right, bottom, left } = useMemo(() => {
		return { ...defaultMargin, ...margin };
	}, [margin]);

	const lineConfigs = useMemo(() => {
		const lines = originLines
			.filter((line) => line.data?.some(line.getY))
			.map((line) => {
				if (!rangeTimeScale) {
					return line;
				}
				const filterLine = {
					...line,
					data: line.data?.filter((d) => {
						const curDate =
							typeof line.getX(d) === "number" &&
							(line.getX(d) as number).toString().length === 10
								? new Date((line.getX(d) as number) * 1000)
								: (line.getX(d) as Date);
						return (
							isAfter(getUnixTime(curDate), getUnixTime(min(rangeTimeScale))) &&
							isBefore(getUnixTime(curDate), getUnixTime(max(rangeTimeScale)))
						);
					}),
				};
				return filterLine;
			})
			.filter((line) => !!line.data?.length) as RequiredLineConfig<T>[];
		return lines;
	}, [originLines, rangeTimeScale]);

	/**
	 * 默认显示前三个
	 */
	const getDisabledState = useCallback(
		(check: boolean, noAll?: boolean) => {
			const obj = {} as Record<string, boolean>;
			lineConfigs.forEach((item, i) => {
				if (noAll) {
					if (i > 2) {
						obj[item.uniqueId as string] = !check;
					} else {
						obj[item.uniqueId as string] = check;
					}
					return;
				}
				obj[item.uniqueId as string] = check;
			});
			return obj;
		},
		[lineConfigs],
	);
	const [disabledState, setDisabledLines] = useState(
		getDisabledState(false, true),
	);
	const defaultAllChecked = useMemo(() => {
		return Object.values(disabledState).some((item) => item !== false);
	}, [disabledState]);

	const [container$, setContainer] = useBehaviorSubject<HTMLDivElement | null>(
		null,
	);

	const linesState = useMemo(
		() => lineConfigs.filter((line) => !disabledState[line.uniqueId as string]),
		[disabledState, lineConfigs],
	);

	// 数据流
	const [lines$, setLines] = useBehaviorSubject(lineConfigs);
	useEffect(() => {
		setLines(linesState);
	}, [linesState, setLines]);

	useEffect(() => {
		const task = container$
			.pipe(
				switchMap(function handleContainerChange(container) {
					if (!container) {
						return EMPTY;
					}

					select(container).call((div) => {
						div.selectChild("span.chart-text").remove();
						div
							.append("span")
							.classed("chart-text", true)
							.style("position", "absolute")
							.style("left", "12px")
							.style("top", "16px")
							.style("font-size", "14px")
							.style("line-height", "20px")
							.style("color", "#787C82")
							.text("状态曲线");
					});

					// 初始化结构
					const svg = select(container)
						.append("svg")
						.classed("whistle-line-chart", true);

					// 创建 Grid group
					const xGridGroup = svg
						.append("g")
						.classed("whistle-line-chart-x-grid", true);
					const yGridGroup = svg
						.append("g")
						.classed("whistle-line-chart-y-grid", true);

					// 创建座标轴组
					const xAxisGroup = svg
						.append("g")
						.classed("whistle-line-chart-x-axix", true);

					const dataAreaGroup = svg
						.append("g")
						.classed("whistle-area-chart-data", true)
						.call((g) => {
							g.append("g").classed("chart-data-draw-area", true);
							g.append("g").classed("chart-data-draw-defs", true);
							g.append("g").classed("chart-data-draw-path", true);
							g.append("g").classed("chart-data-draw-area-line", true);
						});
					const dataLineGroup = svg
						.append("g")
						.classed("whistle-line-chart-data", true)
						.call((g) => {
							g.append("g").classed("chart-data-draw-line-circle", true);
							g.append("g").classed("chart-data-draw-line", true);
						});

					// 创建 threshold 组
					const thresholdGroup = svg
						.append("g")
						.classed("line-chart-threshold", true);

					// 创建响应 tooltip 的元素以及相关的事件流
					const tooltipTarget = svg
						.append("rect")
						.classed("whistle-line-chart-tooltip", true)
						.attr("fill", "transparent");

					// tooltip组-html
					const tooltip = select(container)
						.append("div")
						.classed("whistle-line-char-tooltip-box", true)
						.style("position", "absolute")
						.style("left", 0)
						.style("top", 0)
						.style("opacity", 0)
						.style("pointer-events", "none")
						.style("border-radius", "8px")
						.style("border-radius", "8px")
						.style("background-color", "#ffffff41")
						.style("backdrop-filter", "blur(8px)")
						.style("padding", "15px 20px")
						.style(
							"box-shadow",
							"0 0 #0000,0 0 #0000,0 0 #0000,0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
						)
						.style("transition-property", "transform")
						.style("transition-timing-function", "cubic-bezier(0.4, 0, 0.2, 1)")
						.style("transition-duration", "150ms");

					const tooltipBoxGroup = tooltip
						.append("div")
						.classed("tooltip-box-container", true)
						.style("width", "100%")
						.style("height", "100%")
						.style("pointer-events", "none");

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
					const tooltipGroup = svg
						.append("g")
						.classed("whistle-line-chart-tooltip", true)
						.style("pointer-events", "none")
						.attr("pointer-events", "none");

					const tooltipLine = tooltipGroup
						.append("line")
						.classed("line-chart-tip", true)
						.style("pointer-events", "none")
						.attr("pointer-events", "none")
						.attr("stroke-width", 2)
						.attr("stroke", "#5B8EF9")
						.attr("stroke-dasharray", "3 2");

					const tooltipBoxTimeSample = tooltipBoxGroup
						.append("div")
						.classed("tooltip-box-container-time-sample", true)
						.style("font-size", "14px")
						.style("line-height", "20px")
						.style("color", "#040F1F")
						.style("pointer-events", "none");

					const tooltipBoxDatumInfo = tooltipBoxGroup
						.append("div")
						.classed("tooltip-box-container-datum-info", true)
						.style("display", "grid")
						.style("grid-auto-flow", "column")
						.style("gap", "12px")
						.style("margin-top", "8px")
						.style("pointer-events", "none");

					return fromEvent(window, "resize").pipe(
						finalize(() => {
							// 在 container 变化时移除 svg
							svg.remove();
							tooltip.remove();
						}),
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
						switchMap(({ width, height }) => {
							return lines$.pipe(
								switchMap(function handleLinesChange(lines) {
									const [minX, maxX] = rangeTimeScale ?? timeScale;
									const [minY = 0, maxY = 100] = extent(
										lines
											.filter((line) => line.data)
											.flatMap(
												(line) =>
													line.data
														?.map(line.getY)
														.map((x) => (line.treatNoneAsZero ? (x ?? 0) : x))
														.filter(
															(x): x is NonNullable<typeof x> => x != null,
														) ?? 0,
											),
									);
									if (
										minX == null ||
										maxX == null ||
										minY == null ||
										maxY == null
									) {
										return EMPTY;
									}

									const yRange = [height - bottom, top];
									// TODO: 如果 y 轴的 domain 只支持有限的范围，范围应该通过参数提供
									const yScale = scaleLinear(
										[minY > 0 ? 0 : minY, maxY],
										yRange,
									).nice(5);

									const xRange = [left, width - right];
									const xScale = scaleTime([minX, maxX], xRange); //.nice(6);

									const xDuration = maxX.valueOf() - minX.valueOf();
									const threeYears = 1000 * 60 * 60 * 24 * 365 * 3;
									const threeMonthes = 1000 * 60 * 60 * 24 * 30 * 3;
									const threeDays = 1000 * 60 * 60 * 24 * 3;
									const threeHours = 1000 * 60 * 60 * 3;

									const formatDate = (
										line: RequiredLineConfig<T>,
										d: T,
									): Date => {
										const date =
											typeof line.getX(d) === "number" &&
											(line.getX(d) as number).toString().length === 10
												? new Date((line.getX(d) as number) * 1000)
												: (line.getX(d) as Date);
										return date;
									};

									// 更新 Grid
									xGridGroup
										.attr("transform", `translate(0,${height - bottom})`)
										.call(
											axisBottom(xScale)
												.tickFormat(() => "")
												.tickSize(-(height - top - bottom)),
											// .ticks(4)
										)
										.call((g) => {
											g.selectAll("path")
												.attr("stroke-width", 1)
												.attr("stroke", "#DCDEEA");
											g.selectAll("line")
												.attr("stroke-width", 0.5)
												.attr("stroke", "#979797")
												.attr("stroke-dasharray", "3 2");
										});
									yGridGroup
										.attr("transform", `translate(${left}, 0)`)
										.call(
											axisLeft(yScale)
												.tickFormat(() => "")
												.tickSize(-(width - left - right)),
											// .ticks(4)
										)
										.call((g) => {
											g.selectAll("path")
												.attr("stroke-width", 1)
												.attr("stroke", "#DCDEEA");
											g.selectAll("line")
												.attr("stroke-width", 1)
												.attr("stroke", "#dfe1ed");
										});

									// 更新 x 轴
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
												.ticks(5)
												.tickPadding(8),
										)
										.call((g) => {
											g.selectAll("path").attr("stroke", "#DCDEEA");
											g.selectAll("line").attr("stroke", "transparent");
											g.selectAll("text")
												.attr("fill", "#9A9FA5")
												.attr("font-size", "12px");
										});

									// 先绘制面积图
									dataAreaGroup
										.call((g) => {
											g.selectAll("g.chart-data-draw-area").call((g) => {
												const circleG = g
													.selectAll("g.area-child-g")
													.data(
														lines.filter((l) => !!l.isArea),
														(d: any) => d.uniqueId,
													)
													.join("g")
													.classed("area-child-g", true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none");
												circleG.each((line, i) => {
													circleG
														.selectAll(`circle.area-child-g-child-${i}`)
														.data(line.data)
														.join("circle")
														.classed(`area-child-g-child-${i}`, true)
														.style("pointer-events", "none")
														.attr("pointer-events", "none")
														.attr("cx", (d) => xScale(formatDate(line, d)))
														.attr("cy", (d) => {
															return yScale(line.getY(d) as number);
														})
														.attr("r", 4)
														.attr("fill", line.color);
												});
											});
										})
										.call((g) => {
											g.selectAll("g.chart-data-draw-defs").call((g) => {
												g.selectAll(`defs.area-child-defs`)
													.data(lines.filter((l) => !!l.isArea))
													.join("defs")
													.classed(`area-child-defs`, true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none")
													.append("linearGradient")
													.call((lg) => {
														lg.append("stop")
															.attr("offset", "0%")
															.style("stop-color", (d) => d.color)
															.style("stop-opacity", "1");
														lg.append("stop")
															.attr("offset", "100%")
															.style("stop-color", (d) => d.color)
															.style("stop-opacity", ".1");
													})
													.attr(
														"id",
														(_, i) => `defs-child-linear-gradient-${i}`,
													)
													.attr("x1", "0%")
													.attr("y1", "0%")
													.attr("x2", "0%")
													.attr("y2", "100%");
											});
											g.selectAll("g.chart-data-draw-path").call((g) => {
												g.selectAll("path.area-child-path")
													.data(lines.filter((l) => !!l.isArea))
													.join("path")
													.classed("area-child-path", true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none")
													.style(
														"fill",
														(_, i) => `url(#defs-child-linear-gradient-${i})`,
													)
													.style("fill-opacity", ".2")
													.transition()
													.attr("d", (cfg) => {
														return area<T>(
															(d) => xScale(formatDate(cfg, d)),
															() => height - bottom,
															(d) => yScale(cfg.getY(d) as number),
														).curve(curveCatmullRom)(cfg.data);
													});
											});
										})
										.call((g) => {
											g.selectAll("g.chart-data-draw-area-line").call((g) => {
												g.selectAll("path.area-child-path-line")
													.data(lines.filter((l) => !!l.isArea))
													.join("path")
													.classed("area-child-path-line", true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none")
													.attr("fill", "none")
													.attr("stroke-width", 2)
													.attr("stroke", (d) => d.color)
													.attr("d", (cfg) => {
														return line<T>(
															(d) => xScale(formatDate(cfg, d)),
															(d) => yScale(cfg.getY(d) as number),
														).curve(curveCatmullRom)(cfg.data);
													});
											});
										});

									// 绘制折线图
									dataLineGroup
										.call((g) => {
											g.select("g.chart-data-draw-line-circle").call((g) => {
												const circleG = g
													.selectAll("g.line-child-circle")
													.data(lines.filter((l) => !(l.isArea ?? false)))
													.join("g")
													.classed("line-child-circle", true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none");
												circleG.each((line, i) => {
													circleG
														.selectAll(
															`circle.child-circle-child-${line.uniqueId ?? i}`,
														)
														.data(line.data)
														.join("circle")
														.classed(
															`child-circle-child-${line.uniqueId ?? i}`,
															true,
														)
														.style("pointer-events", "none")
														.attr("pointer-events", "none")
														.attr("cx", (d) => xScale(formatDate(line, d)))
														.attr("cy", (d) => {
															return yScale(line.getY(d) as number);
														})
														.attr("r", 4)
														.attr("fill", line.color);
												});
											});
										})
										.call((g) => {
											g.select("g.chart-data-draw-line").call((g) => {
												g.selectAll("path.line-child-path")
													.data(lines.filter((l) => !l.isArea))
													.join("path")
													.classed("line-child-path", true)
													.style("pointer-events", "none")
													.attr("pointer-events", "none")
													.attr("fill", "none")
													.attr("stroke-width", 2)
													.attr("stroke", (d) => d.color)
													.attr("d", (cfg) => {
														return line<T>(
															(d) => xScale(formatDate(cfg, d)),
															(d) => yScale(cfg.getY(d) as number),
														).curve(curveCatmullRom)(cfg.data);
													});
											});
										});

									// 更新阈值线和标签
									thresholdGroup
										.call((g) => {
											g.selectAll("line.line-chart-threshold-line")
												.data(thresholds)
												.join("line")
												.classed("line-chart-threshold-line", true)
												.style("pointer-events", "none")
												.attr("pointer-events", "none")
												.attr("stroke-width", 2)
												.attr("stroke", "#F95B5B")
												.attr("stroke-dasharray", "3 2")
												.attr("x1", left)
												.attr("x2", width - right)
												.attr("y1", (d) => yScale(d.value))
												.attr("y2", (d) => yScale(d.value));
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
												.style("pointer-events", "none")
												.attr("pointer-events", "none");
										});

									return mousemove$.pipe(
										windowToggle(mouseenter$, () => mouseleave$),
										switchMap((move$) => {
											return move$.pipe(
												tap((evt) => {
													// 检查当前鼠标的位置，如果超出了显示范围，移除 tooltip
													const [offsetX, offsetY] = pointer(evt);
													if (offsetY < top || offsetY > height - bottom) {
														tooltipGroup.attr("opacity", 0);
														tooltip.style("opacity", 0);
														return;
													}

													const _tooltipData = lines.map((line) => {
														const bisectDate = bisector<T, Date>((a, b) => {
															return (
																formatDate(line, a).valueOf() - b.valueOf()
															);
														}).center;
														return {
															...line,
															data: line.data[
																bisectDate(line.data, xScale.invert(offsetX))
															] as T,
														};
													});
													const filterTooltip = _tooltipData.filter(
														(x): x is NonNullable<typeof x> => !!x.data,
													);
													if (!filterTooltip?.length) {
														return;
													}

													tooltipGroup
														.call(() => {
															tooltipLine
																.attr("x1", offsetX)
																.attr("x2", offsetX)
																.attr("y1", top)
																.attr("y2", height - bottom);
														})
														.call((g) => {
															// 显示左侧数据的圆圈
															g.selectAll(`circle.line-chart-tip-circle-left`)
																.data(lines)
																.join("circle")
																.classed(`line-chart-tip-circle-left`, true)
																.style("pointer-events", "none")
																.attr("pointer-events", "none")
																.style("visibility", (d) =>
																	disabledState[d.uniqueId as string]
																		? "hidden"
																		: "visible",
																)
																.attr("stroke", (d) => d.color)
																.attr("stroke-width", 1.5)
																.attr("r", 6)
																.attr("cx", offsetX)
																.style("fill", "#ffffff")
																.attr("cy", (cfg) => {
																	const curVal = filterTooltip.find(
																		(f) => f.uniqueId === cfg.uniqueId,
																	);
																	if (!curVal?.data) {
																		return Infinity;
																	}
																	return yScale(
																		curVal.getY(curVal.data) as number,
																	);
																});
														})
														.call((g) => {
															g.attr("opacity", 1);
														});

													tooltip
														.call(() => {
															let cDate: string | undefined;
															try {
																cDate = format(
																	xScale.invert(offsetX),
																	"yyyy-MM-dd HH:mm:ss",
																);
															} catch (error) {
																console.error(error);
															}
															if (cDate) {
																tooltipBoxTimeSample.text(cDate);
															}
														})
														.call(() => {
															tooltipBoxDatumInfo
																.style(
																	"grid-template-rows",
																	`repeat(${
																		filterTooltip.length > 5
																			? 5
																			: filterTooltip.length
																	}, minmax(0, 1fr))`,
																)
																.call((div) => {
																	div
																		.selectAll(`div.datum-info-item`)
																		.data(filterTooltip)
																		.join("div")
																		.classed(`datum-info-item`, true)
																		.style("pointer-events", "none")
																		.style("display", "flex")
																		.style("justify-content", "flex-start")
																		.style("align-items", "center")
																		.call((div) => {
																			div.selectChildren().remove();
																			div
																				.append("span")
																				.classed(`info-item-circle`, true)
																				.style("width", "10px")
																				.style("height", "10px")
																				.style("border-radius", "9999px")
																				.style("border", "1px solid #fff")
																				.style("pointer-events", "none")
																				.style(
																					"background-color",
																					(d) => d.color,
																				);
																			div
																				.append("div")
																				.style("display", "flex")
																				.style("justify-content", "flex-start")
																				.style("align-items", "center")
																				.style("margin-left", "10px")
																				.style("align-items", "center")
																				.style("pointer-events", "none")
																				.call((div) => {
																					div.selectChildren().remove();
																					div
																						.append("span")
																						.style("pointer-events", "none")
																						.style("font-size", "14px")
																						.style("line-height", "20px")
																						.style("color", "#040F1F")
																						.text((d) =>
																							d.label ? d.label + "：" : "-:",
																						);
																					div
																						.append("span")
																						.style("pointer-events", "none")
																						.style("font-size", "14px")
																						.style("line-height", "20px")
																						.style("font-weight", "700")
																						.style("margin-left", "4px")
																						.style("color", "#040F1F")
																						.text((d) => {
																							let temp: string;
																							try {
																								temp =
																									(d.getY(d.data) as number) +
																									(d?.unit ?? "");
																							} catch (error) {
																								console.error(error);
																								temp = "-";
																							}
																							return temp;
																						});
																				});
																		});
																});
														})
														.call((div) => {
															const { clientWidth, clientHeight } =
																div.node() as HTMLDivElement;
															let datumX = offsetX + 16;
															let datumY = offsetY - 32;
															if (datumX + clientWidth > width - right) {
																datumX = datumX - clientWidth - 32;
															}
															if (offsetY + clientHeight > height) {
																datumY = height - clientHeight;
															}
															if (clientHeight > height) {
																datumY = 0;
															}

															div
																.style("top", datumY + "px")
																.style("left", datumX + "px")
																.style("max-height", height + "px")
																.style("opacity", 1);
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
													tooltipGroup.attr("opacity", 0);
													tooltip.style("opacity", 0);
												}),
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
		bottom,
		container$,
		disabledState,
		left,
		lineConfigs,
		lines$,
		right,
		thresholds,
		timeScale,
		top,
	]);

	return (
		<div className="mt-[1.875rem]">
			<div className="flex justify-start items-center flex-wrap">
				<CheckBox
					key="all-check"
					label="全部"
					disabled={originLines.length === 0}
					checked={originLines.length === 0 ? false : !defaultAllChecked}
					onChange={(e) => {
						setDisabledLines({ ...getDisabledState(!e.target.checked) });
					}}
					wrap
					wrapClassName="mr-5 last:mr-0 mb-2"
				/>
				{lineConfigs.map((d, i) => (
					<CheckBox
						key={uniqueId + i}
						label={d.label ?? "-"}
						labelColor={d.color}
						checked={!disabledState[d.uniqueId as string]}
						onChange={(e) => {
							setDisabledLines({
								...disabledState,
								[d.uniqueId as string]: !e.target.checked,
							});
						}}
						wrap
						wrapClassName="mr-5 last:mr-0 mb-2"
					/>
				))}
			</div>
			<div className="mt-[0.625rem] w-full h-12 min-h-[18.75rem] relative">
				<div ref={setContainer} className="w-full h-full" />
			</div>
		</div>
	);
}
