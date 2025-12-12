/**
 * 在画布上绘制一条直线
 * @param ctx Canvas渲染上下文
 * @param startX 起始点X坐标
 * @param startY 起始点Y坐标
 * @param endX 终点X坐标
 * @param endY 终点Y坐标
 * @param color 线条颜色
 */
export function drawLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.2
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  // 回退到刚绘制的状态，防止样式等影响其他绘图
  ctx.restore();
}

/**
 * 绘制矩形条
 * @param ctx Canvas绘图上下文
 * @param upperLeftCornerX 矩形左上角x坐标
 * @param upperLeftCornerY 矩形左上角y坐标
 * @param width 矩形宽度
 * @param height 矩形高度
 * @param color 填充颜色
 */
export function drawBar(ctx: CanvasRenderingContext2D, upperLeftCornerX: number, upperLeftCornerY: number, width: number, height: number, color: string) {
  ctx.save()
  ctx.fillStyle = color;
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
  ctx.restore();
}