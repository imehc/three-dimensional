import { drawBar, drawLine } from "./util";

type BarChartProps = {
  /** 指定绘制柱状图的 Canvas 元素 */
  canvas: HTMLCanvasElement;
  /** label 元素 */
  labelContainer: HTMLDivElement;
  /** 图例 元素 */
  legend: HTMLLegendElement;
  /** 指定柱状图的系列名称 */
  seriesName: string;
  /** 指定柱状图的边距 */
  padding: number;
  /** 指定网格线的步长 */
  gridStep: number;
  /** 指定网格线的颜色 */
  gridColor: string;
  /** 指定柱状图的数据，以键值对的形式表示 */
  data: Record<string, number>;
  /** 指定柱状图的悬停颜色 */
  hoverColor: string;
  /** 指定柱状图的颜色数组 */
  colors: string[];
  /** 指定标题的配置选项，包括对齐方式、填充颜色和字体样式 */
  titleOptions: Record<string, string | unknown>;
};

type BarInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class BarChart {
  private options: BarChartProps;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private labelContainer: HTMLDivElement;
  private legend: HTMLLegendElement;
  private colors: string[];
  private titleOptions: Record<string, string | unknown>;
  private maxValue: number;
  private canvasActualHeight: number;
  private canvasActualWidth: number;
  private barInfo: BarInfo[];
  private hoverId: number;
  private firstRender: boolean;
  private currentHeights: number[];
  private t: number;
  private v: number;

  constructor(options: BarChartProps) {
    // 配置对象
    this.options = options;
    // 通用访问的属性
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.labelContainer = options.labelContainer;
    this.legend = options.legend;
    this.colors = options.colors;
    this.titleOptions = options.titleOptions;
    this.maxValue = Math.max(...Object.values(this.options.data));
    this.canvasActualHeight = 0;
    this.canvasActualWidth = 0;
    // 存储柱子的位置信息等
    this.barInfo = [];
    this.hoverId = -1;
    this.firstRender = true;
    this.currentHeights = Array(Object.keys(this.options.data).length).fill(0);
    this.t = 1;
    this.v = 5;
    this.init();
  }

  private init() {
    // 初始化监听hover
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
  /** 监听鼠标移动事件 */
  private onMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const prevHoverId = this.hoverId;
    this.hoverId = -1;

    for (let i = 0; i < this.barInfo.length; i++) {
      const pos = this.barInfo[i];
      const { x, y, width, height } = pos;
      const right = x + width;
      const bottom = y + height;

      if (cx <= right && cx >= x && cy >= y && cy <= bottom) {
        this.hoverId = i;
        break;
      }
    }

    // 传递相对于 canvas 的坐标
    this.updateLabels(cx, cy);

    // 如果 hover 状态改变，只重绘柱状图，不重绘网格线
    if (prevHoverId !== this.hoverId) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawGridLines();
      this.drawBars();
    }
  }
  /** 更新 labels */
  private updateLabels(cx: number, cy: number) {
    const dataList = Object.entries(this.options.data)
    if (this.hoverId >= 0) {
      this.labelContainer.style.visibility = 'visible'
      const item = dataList[this.hoverId]
      this.labelContainer.innerHTML = `<div style='background: ${this.colors[this.hoverId < 0 ? 0 : this.hoverId]}; ' class='w-3 h-3 mr-3 rounded-full'></div><div class='mr-4 text-sm'>${item[0]}</div><div class='label-common label-val'>${item[1]}</div>`

      // 等待 DOM 更新后计算尺寸
      requestAnimationFrame(() => {
        const labelWidth = this.labelContainer.offsetWidth;
        const labelHeight = this.labelContainer.offsetHeight;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // 默认偏移量
        const offset = 10;

        // 计算 x 坐标，避免右侧溢出
        let left = cx + offset;
        if (left + labelWidth > canvasWidth) {
          left = cx - labelWidth - offset; // 显示在左侧
        }

        // 计算 y 坐标，避免底部溢出
        let top = cy + offset;
        if (top + labelHeight > canvasHeight) {
          top = cy - labelHeight - offset; // 显示在上方
        }

        // 确保不会超出左边界和上边界
        left = Math.max(0, left);
        top = Math.max(0, top);

        this.labelContainer.style.left = `${left}px`;
        this.labelContainer.style.top = `${top}px`;
      });
    } else {
      this.labelContainer.style.visibility = 'hidden'
    }
  }
  /** 绘制网格线 */
  private drawGridLines() {
    let gridValue = 0;
    while (gridValue <= this.maxValue) {
      // 限制范围计算实际的 Y 坐标
      const gridY =
        this.canvasActualHeight * (1 - gridValue / this.maxValue) +
        this.options.padding;
      drawLine(
        this.ctx,
        0,
        gridY,
        this.canvas.width,
        gridY,
        this.options.gridColor
      );

      // 绘制Y轴文本
      this.ctx.save();
      this.ctx.fillStyle = this.options.gridColor;
      this.ctx.textBaseline = "bottom";
      this.ctx.font = "bold 10px Arial";
      this.ctx.fillText(gridValue.toString(), 0, gridY - 2);
      this.ctx.restore();
      gridValue += this.options.gridStep;
    }
  }
  /** 绘制柱子 */
  private drawBars() {
    // 用于计算 x 坐标
    let barIndex = 0;
    // 总数
    const numberOfBars = Object.keys(this.options.data).length;
    // bar 尺寸
    const barSize = this.canvasActualWidth / numberOfBars;
    const values = Object.values(this.options.data);

    // 清空并重新计算 barInfo
    this.barInfo = [];

    for (const val of values) {
      // 计算高度百分比
      const barHeight = Math.round((this.canvasActualHeight * val) / this.maxValue);
      const x = this.options.padding + barIndex * barSize
      const y = this.canvas.height - this.options.padding
      const actualHeight = this.currentHeights[barIndex];

      // 保存柱子的实际位置信息（考虑动画高度）
      this.barInfo.push({
        x,
        y: y - actualHeight,  // 修正为柱子顶部位置
        width: barSize,
        height: actualHeight   // 使用当前动画高度
      });

      const color = this.hoverId === barIndex ? this.options.hoverColor : this.colors[barIndex]
      this.t = Math.max(this.t - 0.01, 0);

      // 避免除零错误
      if (this.t > 0) {
        this.v = barHeight / this.t * 0.02
      }

      this.currentHeights[barIndex] = Math.min(this.currentHeights[barIndex] + this.v, barHeight)

      // 绘制
      drawBar(
        this.ctx,
        x,
        y - this.currentHeights[barIndex],
        barSize,
        this.currentHeights[barIndex],
        color
      );

      barIndex++;
    }
  }
  /** 绘制 title  */
  private drawTitle() {
    this.ctx.save();
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = this.titleOptions.align as typeof this.ctx.textAlign;
    this.ctx.fillStyle = this.titleOptions.fill as typeof this.ctx.fillStyle;
    this.ctx.font = `${(this.titleOptions.font as { weight: number }).weight} ${(this.titleOptions.font as { size: number }).size} ${(this.titleOptions.font as { family: string }).family}`;
    let xPos = this.canvas.width / 2;
    if (this.titleOptions.align === "left") {
      xPos = 10;
    }
    if (this.titleOptions.align === "right") {
      xPos = this.canvas.width - 10;
    }
    this.ctx.fillText(this.options.seriesName, xPos, this.canvas.height);
    this.ctx.restore();
  }
  /** 绘制 图例 */
  private drawLegend() {
    // 清空 legend，避免重复添加
    this.legend.innerHTML = '';

    let pIndex = 0;
    const ul = document.createElement("ul");
    ul.style.display = "flex";
    ul.style.justifyContent = "center";
    ul.style.alignItems = "center";
    ul.style.gap = "1rem";
    ul.style.marginBottom = "20px"
    this.legend.append(ul);
    for (const ctg of Object.keys(this.options.data)) {
      const li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.margin = "0.5rem 0";
      li.style.borderLeft =
        `20px solid ${this.colors[pIndex % this.colors.length]}`;
      li.style.padding = "5px";
      li.textContent = ctg;
      ul.append(li);
      pIndex++;
    }
  }
  /** 绘制 */
  public draw() {
    // 更新 canvas 实际尺寸
    this.canvasActualHeight = this.canvas.height - this.options.padding * 2;
    this.canvasActualWidth = this.canvas.width - this.options.padding * 2;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // dom 渲染是否是第一次
    if (this.firstRender) {
      this.drawTitle();
      this.drawLegend();
      this.firstRender = false
    }
    this.drawGridLines();
    this.drawBars();

    // 动画完成后停止 requestAnimationFrame
    if (this.t > 0 || this.currentHeights.some((h, i) => {
      const values = Object.values(this.options.data);
      const targetHeight = Math.round((this.canvasActualHeight * values[i]) / this.maxValue);
      return h < targetHeight;
    })) {
      requestAnimationFrame(this.draw.bind(this));
    }
  }

  /** 重新绘制（不重置动画状态） */
  public redraw() {
    // 更新 canvas 实际尺寸
    this.canvasActualHeight = this.canvas.height - this.options.padding * 2;
    this.canvasActualWidth = this.canvas.width - this.options.padding * 2;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGridLines();
    this.drawBars();
  }
}
