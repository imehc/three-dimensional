import clsx from "clsx";
import {
	area,
	axisBottom,
	axisLeft,
	bisector,
	curveLinear,
	extent,
	line,
	pointer,
	scaleLinear,
	scaleTime,
	select,
} from "d3";
import { format, getUnixTime } from "date-fns";
import React, {
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
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
import { useBehaviorSubject, useLatest } from "../../hooks";

type Key<T> = T extends { [key: string]: any }
	? Pick<T, "key">[keyof Pick<T, "key">]
	: T;

type Area<T> = {
	color: string;
	key: Key<T>;
	label?: string;
	getter: (d: T) => number;
};

interface Props<D = unknown> {
	data?: D[];
	yLabel?: ReactNode;
	yUnitLeftLabel?: string;
	areas: Area<D>[];
	margin?: {
		top?: number;
		right?: number;
		bottom?: number;
		left?: number;
	};
	// TODO: 阈值
	thresholds?: any[];
	getX: (d: D) => Date;
	timeScale?: [Date, Date];
}

const headerHeight = 40;
const defaultMargin = { top: 10, right: 20, bottom: 30, left: 20 };

export const AreaChart2 = <L,>({
	data: originData = [],
	getX,
	yLabel,
	yUnitLeftLabel,
	areas: lines,
	thresholds = [],
	margin,
	timeScale,
}: Props<L>) => {
	const { top, right, bottom, left } = useMemo(() => {
		return { ...defaultMargin, ...margin };
	}, [margin]);

	const [tipContainer, setTipContainer] = useState<HTMLDivElement | null>();

	const lineConfigsRef = useLatest(lines);
	const getXRef = useLatest(getX);

	const data = useMemo(
		() =>
			originData.sort(
				(a, b) =>
					getUnixTime(getXRef.current(a)) - getUnixTime(getXRef.current(b)),
			),
		[getXRef, originData],
	);

	const [tooltipDatum, setTooltip] = useState<L>();

	const [container$, setContainer] = useBehaviorSubject<HTMLDivElement | null>(
		null,
	);
	const [data$, setData] = useBehaviorSubject(data);
	useEffect(() => {
		setData(data);
	}, [data, setData]);
	useEffect(() => {
		if (!tipContainer) {
			return;
		}

		const task = container$
			.pipe(
				switchMap(function handleContainerChange(container) {
					if (!container) {
						return EMPTY;
					}

					// 初始化结构
					const svg = select(container).append("svg");

					// 创建 Grid group
					const yGridGroup = svg.append("g");

					// 创建座标轴组
					const xAxisGroup = svg.append("g");
					const yAxisGroup = svg.append("g");

					// 左侧数据组
					const leftDataGroup = svg.append("g");
					// 右侧数据组

					// 创建 threshold 组
					const thresholdGroup = svg
						.append("g")
						.classed("line-chart-threshold", true);

					// 创建响应 tooltip 的元素以及相关的事件流
					const tooltipTarget = svg.append("rect").attr("fill", "transparent");

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

					const bisectDate = bisector<L, ReturnType<typeof getX>>((d, t) => {
						const r = getXRef.current(d);
						return r.valueOf() - t.valueOf();
					}).left;

					// 创建显示 tooltip 的组
					const tooltipGroup = svg
						.append("g")
						.classed("tooltip", true)
						.call((g) => {
							// 创建标识线
							g.append("line")
								.classed("line-chart-tip", true)
								.style("pointer-events", "none")
								.attr("stroke", "#4C4DE2")
								.attr("stroke-dasharray", "3 2");
						});

					const removeTooltip = () => {
						tooltipGroup.remove();
						select(tipContainer).style("opacity", 0);
					};

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
							return data$.pipe(
								switchMap(function handleDataChange(data) {
									const [minX, maxX] =
										timeScale ?? extent(data.map(getXRef.current));
									const [minY, maxY] = extent(
										lines.flatMap((line) => data.map(line.getter)),
									);

									if (
										minX == null ||
										maxX == null ||
										minY == null ||
										maxY == null
									) {
										return EMPTY;
									}

									let yAxisWidth: number = 0;

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
											yAxisWidth = yAxisGroup.node()!.getBBox().width;
											return `translate(${yAxisWidth + left}, 0)`;
										})
										.call((g) => {
											g.selectAll("path").attr("stroke", "#DCDEEA");
											g.selectAll("line").attr("stroke", "transparent");
											g.selectAll("text")
												.attr("fill", "#9A9FA5")
												.attr("font-size", "14px");
										});

									const xRange = [left + yAxisWidth, width - right];
									const xScale = scaleTime([minX, maxX], xRange).nice(6);

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

									// 更新 Grid
									yGridGroup
										.attr("transform", `translate(${left + yAxisWidth}, 0)`)
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

									// 更新面积数据
									leftDataGroup
										.selectAll("path.area-chart-path")
										.data(lineConfigsRef.current)
										.join("path")
										.classed("area", true)
										.attr("class", "area-chart-path")
										.style("pointer-events", "none")
										.style("fill", (d) => d.color)
										.style("fill-opacity", ".2")
										.transition()
										.attr("d", (cfg) => {
											return area<L>(
												(d) => xScale(getXRef.current(d)),
												() => height - bottom,
												(d) => yScale(cfg.getter(d)),
											)(data);
										});
									// 更新线数据
									leftDataGroup
										.selectAll("path.line-chart-path")
										.data(lineConfigsRef.current)
										.join("path")
										.classed("line-chart-path", true)
										.style("pointer-events", "none")
										.attr("fill", "none")
										.attr("stroke-width", 1)
										.attr("stroke", (d) => d.color)
										.attr("d", (cfg) => {
											return line<L>(
												(d) => xScale(getXRef.current(d)),
												(d) => yScale(cfg.getter(d)),
											).curve(curveLinear)(data);
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

									return mousemove$.pipe(
										windowToggle(mouseenter$, () => mouseleave$),
										switchMap((move$) => {
											return move$.pipe(
												tap((evt) => {
													// 检查当前鼠标的位置，如果超出了显示范围，移除 tooltip
													const [offsetX, offsetY] = pointer(evt);
													if (offsetY < top || offsetY > height - bottom) {
														removeTooltip();
														return;
													}

													// 查找数据，如果没有找到，保持当前状态
													const index = bisectDate(
														data,
														xScale.invert(offsetX),
													);
													const datum = data[index];
													if (!datum) {
														return;
													}

													tooltipGroup
														.call((g) => {
															g.select("line.line-chart-tip")
																.attr("x1", xScale(getXRef.current(datum)))
																.attr("x2", xScale(getXRef.current(datum)))
																.attr("y1", top)
																.attr("y2", height - bottom);
														})
														.call((g) => {
															g.selectAll("circle.line-chart-tip-circle")
																.data(lines)
																.join("circle")
																.classed("line-chart-tip-circle", true)
																.style("pointer-events", "none")
																.attr("stroke", "white")
																.attr("stroke-width", 2)
																.attr("r", 4)
																.attr("cx", xScale(getXRef.current(datum)))
																.style("fill", (d) => d.color)
																.attr("cy", (cfg) => yScale(cfg.getter(datum)));
														});

													let datumX = xScale(+getXRef.current(datum));
													const { clientWidth, clientHeight } = tipContainer;
													if (datumX + clientWidth + 10 > width - right) {
														datumX = datumX - clientWidth - 20;
													}

													setTooltip(datum);
													select(tipContainer)
														.style("opacity", 1)
														.style("top", `${clientHeight / 2 - 20}px`)
														.style("left", `${datumX}px`);
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
													removeTooltip();
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
		data$,
		getXRef,
		left,
		lineConfigsRef,
		lines,
		right,
		thresholds,
		timeScale,
		tipContainer,
		top,
	]);

	if (data.length === 0) {
		return (
			<CardFrame>
				<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
					<div className="bg-[#f4f6fb] text-[#b7b6bb] w-[5.625rem] h-[2.125rem] rounded-[2.125rem] text-xs top-0 right-0 bottom-0 left-0 m-auto flex justify-center items-center">
						无数据
					</div>
				</div>
			</CardFrame>
		);
	}
	return (
		<CardFrame>
			<div className="w-full h-full relative">
				<div
					className={clsx("flex flex-col justify-around relative")}
					style={{ height: headerHeight }}
				>
					<div className="flex justify-start items-center">
						<div className="font-bold text-sm text-[#040F1F] whitespace-nowrap">
							{yLabel ?? "-"}
						</div>
						<div className="flex-1 ml-5 flex justify-between items-center">
							<ScrollBarHidden className="flex justify-start flex-row-reverse items-center h-full ml-4 flex-1 overflow-x-scroll whitespace-nowrap">
								{lines.map((d, i) => (
									<div
										key={`${d?.label ?? d.key}-${i}`}
										className="text-[12px] text-[#9A9FA5] mr-7 first:mr-0 relative flex justify-start items-center"
									>
										<div
											className="w-[10px] h-[10px] rounded-[50%] mr-1"
											style={{ backgroundColor: d.color }}
										></div>
										<div className="ml-1">{d.label}</div>
									</div>
								))}
							</ScrollBarHidden>
						</div>
					</div>
					<ul className="flex justify-between items-center px-4">
						<li className="text-[12px] text-[#9A9FA5]">
							{yUnitLeftLabel ?? ""}
						</li>
					</ul>
				</div>
				<div
					ref={setContainer}
					style={{
						height: `calc(100% - ${headerHeight}px)`,
					}}
					className={clsx("flex flex-1 relative")}
				>
					<TooltipContainer
						ref={setTipContainer}
						className="absolute left-0 top-0 opacity-0 transition-all pointer-events-none p-2 rounded-lg"
					>
						{tooltipDatum && (
							<div>
								{tooltipDatum && (
									<div className="text-xs text-[#040F1F] pointer-events-none">
										{format(
											getXRef.current(tooltipDatum),
											"yyyy-MM-dd HH:mm:ss",
										)}
									</div>
								)}
								{lineConfigsRef.current.map((d, i) => {
									const color = lineConfigsRef.current[i].color;
									const value = d.getter(tooltipDatum);
									return (
										<TooltipContent
											key={`${d.key as string}-${i}`}
											color={color}
											value={value}
										/>
									);
								})}
							</div>
						)}
					</TooltipContainer>
				</div>
			</div>
		</CardFrame>
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

const ScrollBarHidden = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>((props, ref) => (
	<div
		{...props}
		ref={ref}
		className={
			// Tailwind 默认不带 ::-webkit-scrollbar 工具类，用任意值写法一次过写死
			[
				props.className,
				"[&::-webkit-scrollbar]:hidden",
				"scrollbar-none", // 官方插件，等价于 scrollbar-width: none;
			]
				.filter(Boolean)
				.join(" ")
		}
	/>
));

const CardFrame = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	(props, ref) => (
		<div
			{...props}
			ref={ref}
			className={[
				"h-full bg-white rounded-[14px] border border-[#f6cbcb] p-2.5 relative",
				props.className,
			]
				.filter(Boolean)
				.join(" ")}
		/>
	),
);
