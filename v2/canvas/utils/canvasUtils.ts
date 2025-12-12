/**
 * Canvas图像处理工具函数
 */

export interface CanvasSize {
	width: number;
	height: number;
}

/**
 * 根据容器和图像的宽高比计算Canvas显示尺寸
 * Canvas将在保持图像宽高比的同时适应容器大小
 */
export function calculateCanvasSize(
	containerWidth: number,
	containerHeight: number,
	imageWidth: number,
	imageHeight: number
): CanvasSize {
	const imageAspect = imageWidth / imageHeight;

	let canvasWidth: number;
	let canvasHeight: number;

	if (imageAspect > 1) {
		// 图像更宽（横向）
		canvasWidth = containerWidth;
		canvasHeight = containerWidth / imageAspect;
		// 如果高度超出容器，则以高度为约束条件
		if (canvasHeight > containerHeight) {
			canvasHeight = containerHeight;
			canvasWidth = containerHeight * imageAspect;
		}
	} else {
		// 图像更高（纵向）或正方形
		canvasHeight = containerHeight;
		canvasWidth = containerHeight * imageAspect;
		// 如果宽度超出容器，则以宽度为约束条件
		if (canvasWidth > containerWidth) {
			canvasWidth = containerWidth;
			canvasHeight = containerWidth / imageAspect;
		}
	}

	return {
		width: Math.floor(canvasWidth),
		height: Math.floor(canvasHeight),
	};
}

/**
 * 使用图像初始化Canvas
 */
export function initializeCanvas(
	canvas: HTMLCanvasElement,
	image: HTMLImageElement
): CanvasRenderingContext2D | null {
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	// 将Canvas内部尺寸设置为图像原始尺寸
	canvas.width = image.width;
	canvas.height = image.height;

	// 清除并绘制图像
	ctx.clearRect(0, 0, image.width, image.height);
	ctx.drawImage(image, 0, 0, image.width, image.height);

	return ctx;
}

/**
 * 将Canvas导出为可下载的图像
 */
export function exportCanvas(
	canvas: HTMLCanvasElement,
	filename: string,
	format: "image/png" | "image/jpeg" = "image/png"
): void {
	const link = document.createElement("a");
	link.download = filename;
	link.href = canvas.toDataURL(format);
	link.click();
}

/**
 * 对Canvas应用马赛克效果
 */
export function applyMosaicEffect(
	canvas: HTMLCanvasElement,
	blockSize: number
): boolean {
	const ctx = canvas.getContext("2d");
	if (!ctx) return false;

	const { width, height } = canvas;

	// 获取像素数据
	const imageData = ctx.getImageData(0, 0, width, height);
	const pixels = imageData.data;

	// 应用马赛克效果
	for (let y = 0; y < height; y += blockSize) {
		for (let x = 0; x < width; x += blockSize) {
			const index = (Math.floor(y) * width + Math.floor(x)) * 4;

			// 获取当前块的颜色
			const red = pixels[index];
			const green = pixels[index + 1];
			const blue = pixels[index + 2];

			// 将颜色应用到整个块
			for (let i = y; i < y + blockSize && i < height; i++) {
				for (let j = x; j < x + blockSize && j < width; j++) {
					const idx = (Math.floor(i) * width + Math.floor(j)) * 4;
					pixels[idx] = red;
					pixels[idx + 1] = green;
					pixels[idx + 2] = blue;
				}
			}
		}
	}

	// 将处理后的像素数据放回Canvas
	ctx.putImageData(imageData, 0, 0);

	return true;
}