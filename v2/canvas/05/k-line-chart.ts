import type { Option } from "./option";
import {
	drawCurve,
	drawLine,
	drawText,
	findClosestId,
	removeOddIndexItems,
} from "./util";

type Serie = {
	name: string;
	data: Option["series"][number]["data"];
	color?: string;
	lineStyle?: {
		opacity: number;
		color: string;
	};
	smooth?: boolean;
	type?: string;
};

type KLineChartProps = Option & {
	target?: HTMLElement;
};

type Position = {
	x: number;
	y: number;
};

export default class KLineChart {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private option: KLineChartProps;
	/** 时间集合 */
	private times: string[] = [];
	/** k线图集合 */
	private kList: Option["series"][number]["data"] = [];
	/** k线图渲染长度 */
	private kLen = 0;
	/** 是否是第一次渲染 */
	private firstInto = true;
	/** 配置项  */
	private series: Serie[] = [];
	private width = 0;
	private height = 0;

	/** 渲染区域数据 */
	private view = {
		/** 系列集合 */
		series: [] as Record<string, unknown>[],
		lineSeries: [],
		/** 时间集合 */
		times: [] as string[],
		/** 过滤挤占时间集合 */
		filterTimes: [] as string[],
		/** k线图集合 */
		kList: [] as Option["series"][number]["data"],
		/** y轴标签集合 */
		yLabels: [] as number[],
		/** x轴刻度x坐标集合 (适配后) */
		xTicks: [] as number[],
		/** x轴刻度x坐标集合（全部刻度）*/
		xTicksSum: [] as number[],
		/** k线渲染个数 */
		kLen: 0,
		/** k线区域坐标 */
		lb: { x: 0, y: 0 },
		rt: { x: 0, y: 0 },
		rb: { x: 0, y: 0 },
		lt: { x: 0, y: 0 },
		/** k线区域尺寸 */
		width: 0,
		height: 0,
		/** 实心宽度 */
		solidWidth: 0,
		/** 绘图区域Y轴的val范围 */
		yMaxVal: 0,
		yMinVal: 0,
		yAreaVal: 0,
		/** 安全区域Y轴的val范围 */
		yMaxSafeVal: 0,
		yMinSafeVal: 0,
		/** 范围id */
		start: 0,
		end: 0,
		/** 实体中心坐标集合 */
		candleCenters: [] as Position[],
		/** y 轴label的差值 */
		yLabelDiff: 0,
	};
	/** 事件相关数据 */
	private event = {
		/** 鼠标位置 */
		pointer: { x: 0, y: 0 },
		downPointer: { x: 0, y: 0 },
		upPointer: { x: 0, y: 0 },
		inner: false,
		activeId: -1,
		activeOriginData: null as { x: string; y: number } | null,
	};

	constructor(el: HTMLCanvasElement, option: KLineChartProps) {
		this.canvas = el;
		this.ctx = el.getContext("2d") as CanvasRenderingContext2D;
		this.option = option;
		this.times = option.xAxis.data;
		this.kList = option.series[0].data;
		this.kLen = this.kList.length;
		this.view.start = option.area.start;
		this.view.end = option.area.end;
		this.series = option.series.slice(1, option.series.length);

		this.init();
		this.render();
	}

	private init() {
		if (this.option.target) {
			const { clientWidth, clientHeight } = this.option.target;
			this.width = clientWidth;
			this.height = clientHeight;
			const dpr = /** window.devicePixelRatio || */ 1;
			this.canvas.width = clientWidth * dpr;
			this.canvas.height = clientHeight * dpr;
			this.canvas.style.transform = "scaleY(-1)";
			this.canvas.style.transform = `translate(${clientWidth})`;
		}
	}

	private draw() {
		this.drawAxisX();
		this.drawAxisY();
		this.drawScaleX();
		this.drawScaleY();
		this.drawGrid();
		this.drawK();
		this.drawHelpLine();
	}
	/** 绘制X轴 */
	private drawAxisX() {
		const { lb, rb } = this.view;
		const { theme } = this.option;
		drawLine(this.ctx, lb.x, lb.y, rb.x, rb.y, theme.bgLineColor);
	}
	/** 绘制Y轴 */
	private drawAxisY() {
		const { lb, lt, rb } = this.view;
		const { theme } = this.option;
		drawLine(this.ctx, lb.x, lb.y, lt.x, lt.y, theme.bgLineColor);
		drawLine(this.ctx, rb.x, lb.y, rb.x, lt.y, theme.bgLineColor);
	}
	/** 绘制X比例尺 */
	private drawScaleX() {
		const { ctx } = this;
		const { xTicks, lb, filterTimes } = this.view;
		const { theme } = this.option;
		xTicks.forEach((x) => {
			ctx.beginPath();
			ctx.moveTo(x, lb.y);
			ctx.lineTo(x, lb.y - 10);
			ctx.stroke();
		});
		ctx.save();
		// 垂直翻转
		ctx.scale(1, -1);
		xTicks.forEach((x, index) => {
			ctx.fillStyle = theme.textColor;
			ctx.fillText(filterTimes[index], x - 25, -(lb.y - 20));
		});
		ctx.restore();
	}
	/** 绘制Y比例尺 */
	private drawScaleY() {
		const { ctx } = this;
		const { lb, height, yLabels } = this.view;
		const { theme } = this.option;

		const divide = height / (yLabels.length - 1);
		ctx.save();
		// 垂直翻转
		ctx.scale(1, -1);
		yLabels.forEach((val, index) => {
			ctx.fillStyle = theme.textColor;
			ctx.fillText(val.toString(), 10, -(lb.y + index * divide - 3));
		});
		ctx.restore();
	}
	/** 绘制网格线 */
	private drawGrid() {
		const { lb, rb, yLabels } = this.view;
		const { theme } = this.option;
		const divide = this.height / yLabels.length;
		yLabels.forEach((_val, index) => {
			if (index) {
				const y = lb.y + index * divide;
				drawLine(this.ctx, lb.x, y, rb.x, y, theme.bgLineColor);
			}
		});
	}
	/** 绘制辅助线 */
	private drawHelpLine() {
		const { ctx } = this;
		const { lb, lt, rt, rb, candleCenters, times } = this.view;
		const { pointer, inner } = this.event;
		const { theme, grid, xAxis } = this.option;
		const xCandles = candleCenters.map((item) => item.x);
		if (inner) {
			ctx.save();
			ctx.setLineDash([5, 5]);
			const X = pointer.x + grid.left;
			const Y = pointer.y - grid.top;

			// 临进计算
			const { id, x } = findClosestId(xCandles, X);
			this.event.activeId = id;
			// 计算实际源数据
			this.event.activeOriginData = {
				y: this.view.kList[id] as number,
				x: times[id] as string,
			};
			// 计算展示 label 数据
			const labelY = this.pos_toY(Y - grid.bottom - xAxis.offset).toFixed(1);
			// 绘制垂线
			drawLine(this.ctx, x, lb.y, x, lt.y, theme.helpColor);
			// 绘制水平线
			drawLine(this.ctx, lb.x, Y, rt.x, Y, theme.helpColor);
			ctx.restore();
			// 绘制数据label
			ctx.fillStyle = theme.textColor;
			// 文本设置的尺寸一半
			const helpLabelfontSizeHalf = theme.helpLabelfontSize * 0.5;
			const ylabelWidth = labelY.length * 5.3;
			const xlabelWidth = times[id].length * 5.3;

			// 绘制Y轴label
			ctx.fillRect(
				rb.x + helpLabelfontSizeHalf,
				Y - theme.helpLabelfontSize,
				ylabelWidth,
				20,
			);
			drawText(
				ctx,
				labelY,
				rb.x + helpLabelfontSizeHalf,
				Y - helpLabelfontSizeHalf + 2,
				{ color: theme.bgLineColor, fontSize: theme.helpLabelfontSize },
			);

			// 绘制X轴label
			ctx.fillRect(x - xlabelWidth * 0.5, lb.y - 26, xlabelWidth, 20);
			drawText(ctx, times[id], x - xlabelWidth * 0.5, lb.y - 20, {
				color: theme.bgLineColor,
				fontSize: theme.helpLabelfontSize,
			});
		}
	}
	/** 绘制k线 */
	private drawK() {
		const candleCenters: Position[] = [];
		this.view.kList.forEach((item, index) => {
			const { center } = this.drawCandle(
				item as number[],
				this.view.times[index],
			);
			candleCenters.push(center);
		});
		this.view.candleCenters = candleCenters;
	}

	private drawAveLine() {
		this.view.series.forEach((item) => {
			drawCurve(
				this.ctx,
				item.lines as number[][],
				(item.lineStyle as { color: string }).color,
				1,
			);
		});
	}

	private onMouseMove(e: MouseEvent) {
		const { grid } = this.option;
		const { clientX, clientY } = e;
		const pos = this.canvas.getBoundingClientRect();
		const leftInner = clientX - pos.left - grid.left;
		const topInner = clientY - pos.top - grid.top;

		if (
			leftInner >= 0 &&
			leftInner <= this.view.width &&
			topInner >= 0 &&
			topInner <= this.view.height
		) {
			this.event.pointer.x = leftInner;
			this.event.pointer.y = this.height - topInner;
			this.event.inner = true;
		} else {
			this.event.inner = false;
			console.log("超出区域");
		}
	}

	private onMouseDown(e: MouseEvent) {
		this.event.downPointer.x = e.clientX;
		this.event.downPointer.y = e.clientY;
	}

	private onMouseup(e: MouseEvent) {
		this.event.upPointer.x = e.clientX;
		this.event.upPointer.y = e.clientY;
		const { upPointer, downPointer } = this.event;
		if (Math.abs(upPointer.x - downPointer.x) > this.view.solidWidth) {
			if (upPointer.x < downPointer.x) {
				console.log("向左滑");
				this.view.start -= 1;
				this.view.end -= 1;
			} else {
				console.log("向右滑");
				this.view.start += 1;
				this.view.end += 1;
			}
		}
	}

	private onWheel(e: WheelEvent) {
		const delta = Math.sign(e.deltaY);
		if (delta > 0) {
			console.log("放大数据");
			this.view.start = Math.max(this.view.start - 1, 0);
			this.view.end = Math.min(this.view.end + 1, 100);
		} else if (delta < 0) {
			console.log("缩小数据");
			if (this.view.start + 2 < this.view.end) {
				this.view.start += 1;
				this.view.end -= 1;
			}
		}
	}

	private watchEvent() {
		this.firstInto = false;
		this.option.target?.addEventListener(
			"mousemove",
			this.onMouseMove.bind(this),
		);
		this.option.target?.addEventListener(
			"mousedown",
			this.onMouseDown.bind(this),
		);
		this.option.target?.addEventListener("mouseup", this.onMouseup.bind(this));
		this.option.target?.addEventListener("wheel", this.onWheel.bind(this));
	}

	public removeEvent() {
		this.option.target?.removeEventListener(
			"mousemove",
			this.onMouseMove.bind(this),
		);
		this.option.target?.removeEventListener(
			"mousedown",
			this.onMouseDown.bind(this),
		);
		this.option.target?.removeEventListener(
			"mouseup",
			this.onMouseup.bind(this),
		);
		this.option.target?.removeEventListener("wheel", this.onWheel.bind(this));
	}

	private limitArea() {
		const { start, end } = this.view;
		const start_id = Math.floor((start * this.kLen) / 100);
		const end_id = Math.floor((end * this.kLen) / 100);
		this.view.times = this.times.slice(start_id, end_id + 1);
		this.view.kList = this.kList.slice(start_id, end_id + 1);
		this.view.kLen = this.view.kList.length;

		this.view.series = this.series.map((item) => {
			return { ...item, data: item.data.slice(start_id, end_id + 1) };
		});
	}

	private calcView() {
		const { grid, xAxis } = this.option;
		const { width, height } = this;
		const distance = 20;
		const step = 5;
		let max_value = 0,
			min_value = Infinity;

		// 计算视口坐标
		this.view.lb = { x: grid.left, y: grid.bottom + xAxis.offset };
		this.view.rt = { x: width - grid.right, y: height - grid.top };
		this.view.rb = { x: width - grid.right, y: grid.bottom + xAxis.offset };
		this.view.lt = { x: grid.left, y: height - grid.top };

		this.view.width = this.view.rb.x - this.view.lb.x;
		this.view.height = this.view.rt.y - this.view.rb.y;

		// 计算 y 轴的范围值
		this.view.kList.forEach((item) => {
			max_value = Math.max(max_value, ...(item as number[]));
			min_value = Math.min(min_value, ...(item as number[]));
		});
		this.view.yMaxSafeVal = max_value;
		this.view.yMinSafeVal = min_value;

		const min_integer = Math.floor(min_value - (min_value % 10));
		const max_integer = Math.floor(max_value + (10 - (max_value % 10)));
		this.view.yMinVal = min_integer - distance;
		this.view.yMaxVal = max_integer + distance;
		this.view.yAreaVal = this.view.yMaxVal - this.view.yMinVal;
		const size = Math.floor(this.view.yAreaVal / step);

		// 计算y的label集合
		const yLabels = [this.view.yMinVal];
		let curY = this.view.yMinVal;
		for (let i = 0; i < step; i++) {
			curY = curY + size;
			yLabels.push(curY);
		}
		this.view.yLabels = yLabels;
		this.view.yLabelDiff = (yLabels.at(-1) as number) - yLabels[0];

		// 计算实体宽度
		this.view.solidWidth = +(this.view.width / (this.view.kLen * 2)).toFixed(2);

		// 计算 x 轴刻度坐标
		let xTicks: number[] = [];
		let filterTimes = this.view.times;

		const xDivide = this.view.width / (this.view.times.length - 1);
		this.view.times.forEach((_item, index) => {
			xTicks.push(+(index * xDivide + this.view.lb.x).toFixed(2));
		});
		this.view.xTicksSum = xTicks;
		// 兼容 x 轴挤占问题
		const calcXTicks = (xTicks: (number | string)[]) => {
			const ticksLen = xTicks.length;
			const textWidth = 50;
			const textDistance =
				(this.view.width - textWidth * ticksLen - textWidth) / (ticksLen - 1);
			if (textDistance < 2) {
				xTicks = removeOddIndexItems(xTicks);
				return calcXTicks(xTicks);
			} else {
				return xTicks;
			}
		};
		xTicks = calcXTicks(xTicks) as number[];
		filterTimes = calcXTicks(filterTimes) as string[];

		this.view.xTicks = xTicks;
		this.view.filterTimes = filterTimes;

		// 转换折线
		// ['-', '-', 11, 22, 33] -> [[x1, y1], [x2, y2], [x3, y3]]
		this.view.series.forEach((item) => {
			const lines: number[][] = [];
			const data = item.data as (number | "-")[];
			data.forEach((_x, j) => {
				const val = data[j];
				if (val !== "-") {
					lines.push([this.view.xTicksSum[j], this.y_toPos(val)]);
				}
			});
			item.lines = lines;
		});
	}

	/** y 数值转为y轴坐标  */
	private y_toPos(val: number) {
		const { height, yAreaVal, yMinSafeVal, yMaxSafeVal, yMinVal, yMaxVal, lb } =
			this.view;
		const safeBottomH = ((yMinSafeVal - yMinVal) / yAreaVal) * height;
		const safeTopH = ((yMaxVal - yMaxSafeVal) / yAreaVal) * height;
		const valH =
			((val - yMinSafeVal) / (yMaxSafeVal - yMinSafeVal)) *
			(height - safeBottomH - safeTopH);
		return +(lb.y + safeBottomH + valH).toFixed(2);
	}

	/** y轴坐标转为 y 数值 */
	private pos_toY(val: number) {
		const { yLabelDiff, yLabels } = this.view;
		return (val / this.view.height) * yLabelDiff + yLabels[0];
	}

	/** x 数值转为x轴坐标 */
	private x_toPos(name: string) {
		const { times, width, kLen, lb } = this.view;
		const idx = times.indexOf(name);
		const x_divide = width / (kLen - 1);
		return +(lb.x + x_divide * idx).toFixed(2);
	}

	private drawCandle(item: number[], name: string) {
		const { ctx } = this;
		const { theme } = this.option;

		// 缩放后的 实心底部， 实心顶部，lowest，highest的y值
		const solidBottom = Math.min(this.y_toPos(item[0]), this.y_toPos(item[1]));
		const solidTop = Math.max(this.y_toPos(item[0]), this.y_toPos(item[1]));
		const lowest = this.y_toPos(item[2]);
		const highest = this.y_toPos(item[3]);
		const h = Math.abs(solidTop - solidBottom);
		const w = this.view.solidWidth;
		const half_w = w * 0.5;
		const half_h = h * 0.5;

		const isUp = item[1] > item[0];
		const color = isUp ? theme.upColor : theme.downColor;

		// 实心区域中心点
		const center = {
			x: this.x_toPos(name),
			y: solidBottom + half_h,
		};
		// 绘制蜡烛图的上下影线
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(center.x, highest);
		ctx.lineTo(center.x, lowest);
		ctx.stroke();
		// 绘制蜡烛图的实体部分
		ctx.fillStyle = color;
		ctx.fillRect(center.x - half_w, center.y - half_h, w, h);

		return { center };
	}

	private requestAnimation() {
		const { canvas, ctx, firstInto } = this;
		const { theme } = this.option;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = theme.bgColor;

		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// 限制option数据
		this.limitArea();

		// 计算视口数据
		this.calcView();

		// 执行一次监听事件
		if (firstInto) this.watchEvent();

		// 绘制
		this.draw();
		requestAnimationFrame(this.requestAnimation.bind(this));
	}

	private render() {
		this.requestAnimation();
	}
}
