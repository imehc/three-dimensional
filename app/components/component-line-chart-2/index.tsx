import clsx from "clsx";
import {
	axisBottom,
	axisLeft,
	axisRight,
	bisector,
	curveLinear,
	extent,
	line,
	pointer,
	type ScaleLinear,
	scaleLinear,
	scaleTime,
	select,
} from "d3";
import { format } from "date-fns";
import {
	type CSSProperties,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	catchError,
	combineLatest,
	delay,
	EMPTY,
	EmptyError,
	finalize,
	fromEvent,
	fromEventPattern,
	last,
	map,
	merge,
	startWith,
	switchMap,
	tap,
	windowToggle,
} from "rxjs";
import { useBehaviorSubject, useLatest } from "../../hooks";
import { CustomSwitch } from "..";
import 对比 from "./对比.svg";

type Key<T> = T extends { [key: string]: any }
	? Pick<T, "key">[keyof Pick<T, "key">]
	: T;

type Line<T> = {
	color: string;
	key: Key<T> | string;
	label?: string;
	getter: (d: T) => number | undefined;
	/**
	 * 是否显示切换开关，默认不显示
	 */
	visible?: boolean;
	/**
	 * 将 null 或 undefined 视为 0
	 */
	treatNoneAsZero?: boolean;
};

interface Props<L = unknown, R = unknown, T = unknown> {
	/**
	 * 默认（左侧）座标轴的数据
	 */
	data?: L[];
	yLabel?: ReactNode;
	yUnitLeftLabel?: string;
	lines: Line<L>[];
	margin?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	thresholds?: T[];
	getThreshold?: (t: T) => number;
	getX: (d: L | R) => Date;
	onClick?: () => void;
	onClickCompare?: () => void;
	timeScale?: [Date, Date];

	/**
	 * 右侧座标轴的数据
	 */
	dataRightSide?: R[];
	/**
	 * 右侧数据的折线配置
	 */
	linesRightSide?: Line<R>[];
	yUnitRightLabel?: string;
	style?: CSSProperties;
}

const headerHeight = 40;
const defaultMargin = { top: 10, right: 20, bottom: 30, left: 20 };

export function LineChart2<L = any, R = any, T = any>({
	data = [],
	getX,
	yLabel,
	yUnitLeftLabel,
	yUnitRightLabel,
	lines = [],
	thresholds = [],
	getThreshold,
	margin,
	onClick,
	onClickCompare,
	timeScale,
	dataRightSide = [],
	linesRightSide = [],
	style,
}: Props<L, R, T>) {
	const { top, right, bottom, left } = useMemo(() => {
		return { ...defaultMargin, ...margin };
	}, [margin]);

	const getXRef = useLatest(getX);
	const getThresholdRef = useLatest(getThreshold);

	const [disabledLines, setDisabledLines] = useState<{
		[key: string]: boolean;
	}>({});

	const [container$, setContainer] = useBehaviorSubject<HTMLDivElement | null>(
		null,
	);

	// 左侧数据流
	const [dataL$, setDataL] = useBehaviorSubject(data);
	useEffect(() => {
		setDataL(data);
	}, [data, setDataL]);

	// 右侧数据流
	const [dataR$, setDataR] = useBehaviorSubject(dataRightSide);
	useEffect(() => {
		setDataR(dataRightSide);
	}, [dataRightSide, setDataR]);

	useEffect(() => {
		const enabledLinesL = lines.filter(
			(line) => !disabledLines[line.key as string],
		);
		const enabledLinesR = linesRightSide.filter(
			(line) => !disabledLines[line.key as string],
		);

		const task = container$
			.pipe(
				switchMap(function handleContainerChange(container) {
					if (!container) {
						return EMPTY;
					}

					// 初始化结构
					const svg = select(container)
						.append("svg")
						.classed("whistle-line-chart", true)
						// TODO: 没用，可以删除
						.call((svg) => {
							svg
								.append("defs")
								.append("filter")
								.attr("id", "tooltip-bg-blurry")
								.attr("primitiveUnits", "userSpaceOnUse")
								.call((defs) => {
									defs
										.append("feGaussianBlur")
										.attr("stdDeviation", 10)
										.attr("in", "SourceGraphic")
										.attr("result", "blurSquares");
									defs
										.append("feComponentTransfer")
										.attr("in", "blurSquares")
										.attr("result", "opaqueBlur")
										.append("feFuncA")
										.attr("type", "linear")
										.attr("intercept", 1);
									defs
										.append("feBlend")
										.attr("mode", "normal")
										.attr("in", "opaqueBlur")
										.attr("in2", "SourceGraphic");
								});
						});

					// 创建 Grid group
					const yGridGroup = svg
						.append("g")
						.classed("whistle-line-chart-grid", true);

					// 创建座标轴组
					const xAxisGroup = svg
						.append("g")
						.classed("whistle-line-chart-x-axix", true);
					const yAxisLGroup = svg
						.append("g")
						.classed("whistle-line-chart-yl-axis", true);
					const yAxisRGroup = svg
						.append("g")
						.classed("whistle-line-chart-yr-axis", true);

					// 左侧数据组
					const leftDataGroup = svg
						.append("g")
						.classed("whistle-line-chart-data-l", true);
					// 右侧数据组
					const rightDataGroup = svg
						.append("g")
						.classed("whistle-line-chart-data-r", true);

					// 创建 threshold 组
					const thresholdGroup = svg
						.append("g")
						.classed("line-chart-threshold", true);

					// 创建响应 tooltip 的元素以及相关的事件流
					const tooltipTarget = svg
						.append("rect")
						.classed("whistle-line-chart-tooltip", true)
						.attr("fill", "transparent");

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

					const bisectDate = bisector<L | R, ReturnType<typeof getX>>(
						(d, t) => {
							const r = getXRef.current(d);
							return r.valueOf() - t.valueOf();
						},
					).center;

					// 创建显示 tooltip 的组
					const tooltipGroup = svg
						.append("g")
						.classed("whistle-line-chart-tooltip", true)
						.style("pointer-events", "none")
						.attr("pointer-events", "none");
					// .attr('filter', 'url(#tooltip-bg-blurry)');

					const tooltipBg = tooltipGroup.append("rect");

					const tooltipLine = tooltipGroup
						.append("line")
						.classed("line-chart-tip", true)
						.style("pointer-events", "none")
						.attr("pointer-events", "none")
						.attr("stroke", lines[0].color ?? "#4C4DE2")
						.attr("stroke-dasharray", "3 2");

					const tooltipTimestamp = tooltipGroup
						.append("text")
						.classed("whistle-line-chart-tooltip-timestamp", true)
						.attr("font-size", 14)
						.attr("fill", "#040F1F");

					let yAxisLWidth: number = 0;
					let yAxisRWidth: number = 0;

					return fromEvent(window, "resize").pipe(
						finalize(() => {
							// 在 container 变化时移除 svg
							svg.remove();
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
								.style("width", `${width}px`)
								.style("height", `${height}px`);

							tooltipTarget
								.attr("width", `${width}px`)
								.attr("height", `${height}px`);
						}),
						switchMap(({ width, height }) => {
							const handleDataLChange = dataL$.pipe(
								tap(function handleDataChange(dataL) {
									const [minX, maxX] =
										timeScale ?? extent(dataL.map(getXRef.current));
									const [minY, maxY] = extent(
										lines.flatMap((line) =>
											dataL
												.map(line.getter)
												.map((x) => (line.treatNoneAsZero ? (x ?? 0) : x))
												.filter((x): x is NonNullable<typeof x> => x != null),
										),
									);

									if (
										minX == null ||
										maxX == null ||
										minY == null ||
										maxY == null
									) {
										return;
									}

									const yRange = [height - bottom, top];
									const leftYScale = scaleLinear(
										[minY > 0 ? 0 : minY, maxY],
										yRange,
									).nice(5);

									// 确定右侧 y 轴
									if (dataRightSide.length) {
										yAxisRGroup
											.call(
												axisRight(
													scaleLinear([minY > 0 ? 0 : minY, maxY], yRange).nice(
														5,
													),
												)
													.tickFormat((d) => d.toString())
													.ticks(4),
											)
											.attr("transform", () => {
												// 动态获取右侧y轴的宽度
												yAxisRWidth = yAxisRGroup.node()!.getBBox().width;
												return `translate(${width - right - yAxisRWidth}, 0)`;
											})
											.call((g) => {
												g.selectAll("path").attr("stroke", "#DCDEEA");
												g.selectAll("line").attr("stroke", "transparent");
												g.selectAll("text")
													.attr("fill", "#9A9FA5")
													.attr("font-size", "14px");
											});
									}
									// 更新左侧 y 轴
									yAxisLGroup
										.call(
											axisLeft(leftYScale)
												.tickFormat((d) => {
													if (Number.isInteger(d as number)) {
														return d.toString();
													}
													return (d as number).toFixed(2);
												})
												.ticks(4),
										)
										.attr("transform", () => {
											// 动态获取左侧y轴的宽度
											yAxisLWidth = yAxisLGroup.node()!.getBBox().width;
											return `translate(${yAxisLWidth + left}, 0)`;
										})
										.call((g) => {
											g.selectAll("path").attr("stroke", "#DCDEEA");
											g.selectAll("line").attr("stroke", "transparent");
											g.selectAll("text")
												.attr("fill", "#9A9FA5")
												.attr("font-size", "14px");
										});

									const xRange = [
										left + yAxisLWidth,
										width - right - yAxisRWidth,
									];
									const xScale = scaleTime([minX, maxX], xRange).nice(6);

									// 更新左侧数据
									leftDataGroup
										.selectAll("path.line-chart-path")
										.data(lines, (d: any) => d.key)
										.join("path")
										.classed("line-chart-path", true)
										.style("visibility", (d) =>
											disabledLines[d.key as string] ? "hidden" : "visible",
										)
										.attr("fill", "none")
										.attr("stroke-width", 1)
										.attr("stroke", (d) => d.color)
										.attr("d", (l) => {
											return line<L>(
												(d) => xScale(getXRef.current(d)),
												(d) => leftYScale(l.getter(d) as number),
											).curve(curveLinear)(
												dataL.filter((x) => l.getter(x) != null),
											);
										});
								}),
							);
							const handleDataRChange = dataR$.pipe(
								tap(function handleDataChange(dataR) {
									const [minX, maxX] =
										timeScale ?? extent(dataR.map(getXRef.current));
									const [minY, maxY] = extent(
										linesRightSide.flatMap((line) =>
											dataR
												.map(line.getter)
												.map((x) => (line.treatNoneAsZero ? (x ?? 0) : x))
												.filter((x): x is NonNullable<typeof x> => x != null),
										),
									);

									if (
										minX == null ||
										maxX == null ||
										minY == null ||
										maxY == null
									) {
										return;
									}

									const yRange = [height - bottom, top];
									const yScale = scaleLinear(
										[minY > 0 ? 0 : minY, maxY],
										yRange,
									).nice(5);

									const xRange = [
										left + yAxisLWidth,
										width - right - yAxisRWidth,
									];
									const xScale = scaleTime([minX, maxX], xRange).nice(6);

									// 更新右侧数据
									rightDataGroup
										.selectAll("path.line-chart-path")
										.data(linesRightSide, (d: any) => d.key)
										.join("path")
										.classed("line-chart-path", true)
										.style("visibility", (d) =>
											disabledLines[d.key as string] ? "hidden" : "visible",
										)
										.attr("fill", "none")
										.attr("stroke-width", 1)
										.attr("stroke", (d) => d.color)
										.attr("d", (l) => {
											return line<R>(
												(d) => xScale(getXRef.current(d)),
												(d) => yScale(l.getter(d) as number),
											).curve(curveLinear)(
												dataR.filter((x) => l.getter(x) != null),
											);
										});
								}),
							);
							const handleDataAnyChange = combineLatest([dataL$, dataR$]).pipe(
								switchMap(function handleDataChange([dataL, dataR]) {
									const [minX, maxX] =
										timeScale ?? extent(dataL.map(getXRef.current));
									const [minY, maxY] = extent(
										lines.flatMap((line) =>
											dataL
												.map(line.getter)
												.map((x) => (line.treatNoneAsZero ? (x ?? 0) : x))
												.filter((x): x is NonNullable<typeof x> => x != null),
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

									const xRange = [
										left + yAxisLWidth,
										width - right - yAxisRWidth,
									];
									const xScale = scaleTime([minX, maxX], xRange).nice(6);

									const yRange = [height - bottom, top];
									const leftYScale = scaleLinear(
										[minY > 0 ? 0 : minY, maxY],
										yRange,
									).nice(5);

									let rightYScale: ScaleLinear<number, number> | undefined;

									if (dataR.length !== 0) {
										const [minX, maxX] =
											timeScale ?? extent(dataR.map(getXRef.current));
										const [minY, maxY] = extent(
											linesRightSide.flatMap((line) =>
												dataR
													.map(line.getter)
													.map((x) => (line.treatNoneAsZero ? (x ?? 0) : x))
													.filter((x): x is NonNullable<typeof x> => x != null),
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

										if (dataRightSide.length) {
											const yRangeR = [height - bottom, top];
											rightYScale = scaleLinear(
												[minY > 0 ? 0 : minY, maxY],
												yRangeR,
											).nice(5);
										}
									}

									const xDuration = maxX.valueOf() - minX.valueOf();
									const threeYears = 1000 * 60 * 60 * 24 * 365 * 3;
									const threeMonthes = 1000 * 60 * 60 * 24 * 30 * 3;
									const threeDays = 1000 * 60 * 60 * 24 * 3;
									const threeHours = 1000 * 60 * 60 * 3;

									// 更新 Grid
									yGridGroup
										.attr("transform", `translate(${left + yAxisLWidth}, 0)`)
										.call(
											axisLeft(leftYScale)
												.tickFormat(() => "")
												.tickSize(
													-(width - left - right - yAxisLWidth - yAxisRWidth),
												)
												.ticks(4),
										)
										.call((g) => {
											g.selectAll("path").attr("stroke", "#DCDEEA");
											g.selectAll("line").attr("stroke", "#DCDEEA");
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
												.attr("font-size", "14px");
										});

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
												.attr("x1", left + yAxisLWidth)
												.attr("x2", width - right - yAxisRWidth)
												.attr("y1", (d) =>
													leftYScale(getThresholdRef.current?.(d) ?? 0),
												)
												.attr("y2", (d) =>
													leftYScale(getThresholdRef.current?.(d) ?? 0),
												);
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
													const tx =
														width - right - left - yAxisLWidth - yAxisRWidth;
													const ty = leftYScale(
														(getThresholdRef.current?.(d) ?? 0) + 5,
													);
													return `translate(${tx}, ${ty})`;
												})
												.style("pointer-events", "none");
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
														return;
													}

													// 查找数据，如果没有找到，保持当前状态
													const _tooltipDataL = enabledLinesL.map((line) => {
														const data = dataL.filter(
															(x) => line.getter(x) != null,
														);
														return data[
															bisectDate(data, xScale.invert(offsetX))
														];
													});
													const _tooltipDataR = enabledLinesR.map((line) => {
														const data = dataR.filter(
															(x) => line.getter(x) != null,
														);
														return data[
															bisectDate(data, xScale.invert(offsetX))
														];
													});

													const firstTooltipDataL = _tooltipDataL.filter(
														(x): x is NonNullable<typeof x> => x != null,
													)[0];
													const firstTooltipDataR = _tooltipDataR.filter(
														(x): x is NonNullable<typeof x> => x != null,
													)[0];
													if (!firstTooltipDataL && !firstTooltipDataR) {
														return;
													}

													const x = xScale(getXRef.current(firstTooltipDataL));
													const mt = 10;
													const tipWidth = 175;

													let fitX = x;
													if (fitX + 10 + tipWidth > width - right) {
														fitX = fitX - tipWidth - 20;
													}

													// 显示指示线
													tooltipGroup
														.call((g) => {
															tooltipLine
																.attr("x1", x)
																.attr("x2", x)
																.attr("y1", top)
																.attr("y2", height - bottom);
														})
														.call((g) => {
															// 显示左侧数据的圆圈
															g.selectAll("circle.line-chart-tip-circle-left")
																.data(enabledLinesL, (d: any) => d.key)
																.join("circle")
																.classed("line-chart-tip-circle-left", true)
																.style("pointer-events", "none")
																.attr("pointer-events", "none")
																.style("visibility", (d) =>
																	disabledLines[d.key as string]
																		? "hidden"
																		: "visible",
																)
																.attr("stroke", "white")
																.attr("stroke-width", 2)
																.attr("r", 4)
																.attr("cx", x)
																.style("fill", (d) => d.color)
																.attr("cy", (cfg, idx) => {
																	const datum = _tooltipDataL[idx];
																	if (datum == null) {
																		return null;
																	}

																	return leftYScale(
																		cfg.getter(datum) as number,
																	);
																});
														})
														.call((g) => {
															// 如果有，显示右侧侧数据的圆圈
															g.selectAll("circle.line-chart-tip-circle-right")
																.data(enabledLinesR, (d: any) => d.key)
																.join("circle")
																.classed("line-chart-tip-circle-right", true)
																.style("pointer-events", "none")
																.attr("pointer-events", "none")
																.style("visibility", (d) =>
																	disabledLines[d.key as string]
																		? "hidden"
																		: "visible",
																)
																.attr("stroke", "white")
																.attr("stroke-width", 2)
																.attr("r", 4)
																.attr("cx", x)
																.style("fill", (d) => d.color)
																.attr("cy", (cfg, idx) => {
																	if (!rightYScale) {
																		return null;
																	}

																	const datum = _tooltipDataR[idx];
																	if (datum == null) {
																		return null;
																	}

																	return rightYScale(
																		cfg.getter(datum) as number,
																	);
																});
														})
														.call((g) => {
															tooltipBg
																.attr("fill", "rgba(255, 255, 255,.9)")
																.attr(
																	"filter",
																	"drop-shadow(0 4px 3px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1))",
																)
																.attr("rx", 8)
																.attr("x", fitX + 10)
																.attr("y", mt)
																.attr("width", tipWidth)
																.attr(
																	"height",
																	(_tooltipDataL.length +
																		_tooltipDataR.length) *
																		30 +
																		50,
																);
														})
														.call(() => {
															tooltipTimestamp
																.text(
																	format(
																		getXRef.current(firstTooltipDataL),
																		"yyyy-MM-dd HH:mm:ss",
																	),
																)
																.attr("x", fitX + 20)
																.attr("y", mt + 30);
														})
														.call((g) => {
															const radius = 8;

															g.selectAll("g.tooltip-text-left")
																.data(enabledLinesL, (d: any, i) => d.key)
																.join(
																	(enter) =>
																		enter
																			.append("g")
																			.classed("tooltip-text-left", true)
																			.call((g) => {
																				g.append("circle")
																					.attr("stroke", "white")
																					.attr("stroke-width", 2)
																					.style("r", radius)
																					.attr("fill", (line) => line.color)
																					.attr("cx", fitX + 20 + radius)
																					.attr(
																						"cy",
																						(d, i) => 30 * i + mt + 60,
																					);
																			})
																			.call((g) => {
																				g.append("text")
																					.text((line, idx) => {
																						const datum = _tooltipDataL[idx];
																						if (datum == null) {
																							return "-";
																						}

																						return line.getter(datum) ?? null;
																					})
																					.attr("x", fitX + 30 + radius * 2)
																					.attr(
																						"y",
																						(d, i) =>
																							30 * i +
																							mt +
																							60 +
																							_tooltipDataL.length * 20,
																					)
																					.attr("dy", 5);
																			}),
																	(update) => {
																		update
																			.select("circle")
																			.attr("fill", (line) => line.color)
																			.attr("cx", fitX + 20 + radius)
																			.attr("cy", (d, i) => 30 * i + mt + 60);
																		update
																			.select("text")
																			.text((line, idx) => {
																				const datum = _tooltipDataL[idx];
																				if (datum == null) {
																					return "-";
																				}

																				return line.getter(datum) ?? null;
																			})
																			.attr("x", fitX + 30 + radius * 2)
																			.attr("y", (d, i) => 30 * i + mt + 60)
																			.attr("dy", 5);
																		return update;
																	},
																);

															g.selectAll("g.tooltip-text-right")
																.data(enabledLinesR, (d: any) => d.key)
																.join(
																	(enter) =>
																		enter
																			.append("g")
																			.classed("tooltip-text-right", true)
																			.call((g) => {
																				g.append("circle")
																					.attr("stroke", "white")
																					.attr("stroke-width", 2)
																					.attr("r", radius)
																					.attr("fill", (line) => line.color)
																					.attr("cx", fitX + 20 + radius)
																					.attr(
																						"cy",
																						(d, i) =>
																							30 * i +
																							mt +
																							60 +
																							_tooltipDataL.length * 20,
																					);
																			})
																			.call((g) => {
																				g.append("text")
																					.text((line, idx) => {
																						const datum = _tooltipDataR[idx];
																						if (datum == null) {
																							return "-";
																						}

																						return line.getter(datum) ?? null;
																					})
																					.attr("x", fitX + 30 + radius * 2)
																					.attr(
																						"y",
																						(d, i) =>
																							30 * i +
																							mt +
																							60 +
																							_tooltipDataL.length * 20,
																					)
																					.attr("dy", 5);
																			}),
																	(update) => {
																		update
																			.select("circle")
																			.attr("fill", (line) => line.color)
																			.attr("cx", fitX + 20 + radius)
																			.attr(
																				"cy",
																				(d, i) =>
																					30 * i +
																					mt +
																					60 +
																					_tooltipDataL.length * 20,
																			);
																		update
																			.select("text")
																			.text((line, idx) => {
																				const datum = _tooltipDataR[idx];
																				if (datum == null) {
																					return "-";
																				}

																				return line.getter(datum) ?? null;
																			})
																			.attr("x", fitX + 30 + radius * 2)
																			.attr(
																				"y",
																				(d, i) =>
																					30 * i +
																					mt +
																					60 +
																					_tooltipDataL.length * 20,
																			)
																			.attr("dy", 5);
																		return update;
																	},
																);
														})
														.call((g) => {
															g.attr("opacity", 1);
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
												}),
											);
										}),
									);
								}),
							);

							return merge(
								handleDataLChange,
								handleDataRChange,
								handleDataAnyChange,
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
		dataL$,
		dataR$,
		disabledLines,
		getXRef,
		left,
		lines,
		linesRightSide,
		right,
		thresholds,
		timeScale,
		top,
	]);

	if (data.length === 0) {
		return (
			<CardFrame style={style}>
				<div className="font-bold text-sm text-[#040F1F] whitespace-nowrap">
					{yLabel ?? "-"}
				</div>
				<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
					<div className="bg-[#f4f6fb] text-[#b7b6bb] w-[5.625rem] h-[2.125rem] rounded-[2.125rem] text-xs top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center">
						无数据
					</div>
				</div>
			</CardFrame>
		);
	}
	return (
		<CardFrame style={style}>
			<div className="w-full h-full relative" onClick={onClick}>
				<div
					className={clsx("flex flex-col justify-around relative")}
					style={{ height: headerHeight }}
				>
					<div className="flex justify-start items-center">
						<div className="font-bold text-sm text-[#040F1F] whitespace-nowrap">
							{yLabel ?? "-"}
						</div>
						<div className="flex-1 ml-5 flex justify-between items-center overflow-hidden">
							<ScrollBarHidden className="flex justify-start flex-row-reverse items-center h-full ml-4 flex-1 overflow-x-scroll whitespace-nowrap">
								{[...lines, ...linesRightSide].map((d, i) => (
									<div
										key={`${d?.label ?? d.key}-${i}`}
										className="text-sm text-[#9A9FA5] mr-7 first:mr-0 relative flex justify-start items-center"
									>
										{d.visible && (
											<CustomSwitch
												className="mr-1"
												checked={!disabledLines[d.key as string]}
												activeBackGround={d.color}
												onChange={(checked) => {
													setDisabledLines({
														...disabledLines,
														[d.key as string]: !checked,
													});
												}}
											/>
										)}
										<div
											className="w-3 h-3 rounded-[50%] ml-1"
											style={{ backgroundColor: d.color }}
										></div>
										<div className="ml-1">{d.label}</div>
									</div>
								))}
							</ScrollBarHidden>
							{onClickCompare && (
								<div className="flex justify-end items-center">
									<div
										className="border-[#e3e5f0] border-[1px] border-solid text-[#787C82] text-[12px] flex justify-center items-center rounded-[6px] px-[4px] ml-5 cursor-pointer"
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											onClickCompare();
										}}
									>
										<img src={对比} alt="" />
										<span className="whitespace-nowrap">对比</span>
									</div>
								</div>
							)}
						</div>
					</div>
					<ul className="flex justify-between items-center px-4">
						<li className="text-[12px] text-[#9A9FA5]">
							{yUnitLeftLabel ?? ""}
						</li>
						<li className="text-[12px] text-[#9A9FA5]">
							{yUnitRightLabel ?? ""}
						</li>
					</ul>
				</div>
				<div
					ref={setContainer}
					style={{
						height: `calc(100% - ${headerHeight}px)`,
					}}
					className={clsx("flex flex-1 relative")}
				></div>
			</div>
		</CardFrame>
	);
}

const ScrollBarHidden = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => (
    <div
      {...props}
      ref={ref}
      className={[
        // 隐藏 WebKit 滚动条
        '[&::-webkit-scrollbar]:hidden',
        // Firefox
        'scrollbar-none',
        // 合并外部 className
        props.className
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
);

const CardFrame = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`h-full border border-[#f6cbcb] rounded-[14px] p-2.5 relative ${className}`}
    />
  )
);
