/**
 * 在画布上绘制一条直线
 * @param ctx - CanvasRenderingContext2D对象，用于绘制线条
 * @param startX - 起始点的X坐标
 * @param startY - 起始点的Y坐标
 * @param endX - 终点的X坐标
 * @param endY - 终点的Y坐标
 * @param color - 线条颜色，默认为"#fff"（白色）
 */
export const drawLine = (
	ctx: CanvasRenderingContext2D,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	color = "#fff",
) => {
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.closePath();
};

/**
 * 在Canvas上绘制文本
 * @param ctx Canvas渲染上下文
 * @param val 要绘制的文本内容
 * @param x 文本绘制的x坐标
 * @param y 文本绘制的y坐标
 * @param options 绘制选项
 * @param options.color 文本颜色
 * @param options.fontSize 字体大小
 */
export const drawText = (
	ctx: CanvasRenderingContext2D,
	val: string,
	x: number,
	y: number,
	{ color, fontSize }: { color: string; fontSize: number },
) => {
	ctx.save();
	ctx.scale(1, -1);
	ctx.font = `${fontSize}px Arial`;
	ctx.fillStyle = color;
	ctx.fillText(val, x, -y);
	ctx.restore();
};

/**
 * 查找数组中最接近给定值的元素
 * @param arr - 要搜索的数字数组
 * @param value - 目标值，用于查找最接近的元素
 * @returns 包含最接近元素的索引(id)和值(item)的对象
 */
export function findClosestId(arr: number[], value: number) {
	let minDiff = Math.abs(arr[0] - value);
	let closestId = 0;

	for (let i = 1; i < arr.length; i++) {
		const diff = Math.abs(arr[i] - value);
		if (diff < minDiff) {
			minDiff = diff;
			closestId = i;
		}
	}

	return { id: closestId, x: arr[closestId] };
}

/**
 * 在画布上绘制一条曲线
 * @param ctx Canvas渲染上下文
 * @param points 点坐标数组，每个点为[x, y]格式
 * @param color 曲线颜色
 * @param lineWidth 曲线宽度
 */
export function drawCurve(
	ctx: CanvasRenderingContext2D,
	points: number[][],
	color: string,
	lineWidth: number,
) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	// 绘制起始点
	ctx.moveTo(points[0][0], points[0][1]);

	// 将每个折线点转换为曲线点
	for (let i = 1; i < points.length - 1; i++) {
		const x = (points[i][0] + points[i + 1][0]) / 2;
		const y = (points[i][1] + points[i + 1][1]) / 2;
		ctx.quadraticCurveTo(points[i][0], points[i][1], x, y);
	}

	// 绘制最后一个点
	ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);

	ctx.stroke();
}

export function removeOddIndexItems(arr: (number | string)[]) {
	return arr.filter((_, index) => index % 2 === 0);
}
