import { useEffect, useRef } from "react";

export default function Canvas04() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!ref.current || !containerRef.current) return;

		const myCanvas = ref.current;
		const ctx = myCanvas.getContext("2d");
		if (!ctx) return;

		// Function to resize canvas to fit its container
		const resizeCanvas = () => {
			if (!containerRef.current || !myCanvas) return;

			const container = containerRef.current;
			const rect = container.getBoundingClientRect();

			// Set canvas dimensions to match container
			myCanvas.width = rect.width;
			myCanvas.height = rect.height;
		};

		// Initial resize
		resizeCanvas();

		// 缓动函数
		function easeOutCubic(t: number): number {
			return 1 - (1 - t) ** 3;
		}

		function drawPieSlice(
			ctx: CanvasRenderingContext2D,
			centerX: number,
			centerY: number,
			radius: number,
			startAngle: number,
			endAngle: number,
			fillColor: string,
			shadow: boolean,
			offsetX: number = 0,
			offsetY: number = 0,
		) {
			ctx.save();
			ctx.fillStyle = fillColor;
			ctx.beginPath();
			ctx.moveTo(centerX + offsetX, centerY + offsetY);
			ctx.arc(centerX + offsetX, centerY + offsetY, radius, startAngle, endAngle);
			ctx.closePath();
			if (shadow) {
				ctx.shadowBlur = 15;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
			}
			ctx.fill();
			ctx.restore();
		}

		function drawText(
			ctx: CanvasRenderingContext2D,
			text: string,
			x: number,
			y: number,
			font: string,
			color: string,
			align: CanvasTextAlign = "left",
		) {
			ctx.save();
			ctx.font = font;
			ctx.fillStyle = color;
			ctx.textAlign = align;
			ctx.textBaseline = "middle";
			ctx.fillText(text, x, y);
			ctx.restore();
		}

		function drawPolyline(
			ctx: CanvasRenderingContext2D,
			points: { x: number; y: number }[],
			color: string,
			lineWidth: number,
		) {
			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);

			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x, points[i].y);
			}
			ctx.stroke();
		}

		function checkCollision(
			x: number,
			y: number,
			circleX: number,
			circleY: number,
			radius: number,
		) {
			const distance = Math.sqrt((circleX - x) ** 2 + (circleY - y) ** 2);
			return distance <= radius;
		}

		type PieData = Record<string, number>;

		interface PieChartOptions {
			canvas: HTMLCanvasElement;
			seriesName: string;
			padding: number;
			data: PieData;
			colors: string[];
			titleOptions: {
				align: string;
				fill: string;
				font: {
					weight: string;
					size: string;
					family: string;
				};
			};
		}

		class PieChart {
			private options: PieChartOptions;
			private canvas: HTMLCanvasElement;
			private ctx: CanvasRenderingContext2D;
			private colors: string[];
			private totalValue: number;
			private radius: number = 0;
			private targetRadius: number;
			private currentRadius: number;
			private hoverId: number;
			private prevHoverId: number;
			private isHover: boolean;
			private animationFrameId: number;
			private animationProgress: number;

			constructor(options: PieChartOptions) {
				this.options = options;
				this.canvas = options.canvas;
				this.ctx = this.canvas.getContext("2d")!;
				this.colors = options.colors;
				this.totalValue = Object.values(this.options.data).reduce(
					(a, b) => a + b,
					0,
				);

				// Calculate radius based on current canvas size
				this.updateRadius();

				this.targetRadius = this.radius;
				this.currentRadius = this.radius;
				this.hoverId = -1;
				this.prevHoverId = -1;
				this.isHover = false;
				this.animationFrameId = 0;
				this.animationProgress = 0;
				this.init();
			}

			// Update radius when canvas is resized
			updateRadius() {
				this.radius =
					Math.min(this.canvas.width / 2, this.canvas.height / 2) -
					this.options.padding;
			}

			init() {
				// 初始化监听hover
				this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
			}

			onMouseMove(e: MouseEvent) {
				const { clientX, clientY } = e;
				const rect = this.canvas.getBoundingClientRect();
				const cx = clientX - rect.left;
				const cy = clientY - rect.top;

				const centerX = this.canvas.width / 2;
				const centerY = this.canvas.height / 2;
				// 计算鼠标样式
				this.isHover = checkCollision(cx, cy, centerX, centerY, this.radius);
				document.body.style.cursor = this.isHover ? "pointer" : "default";

				// 计算弧度
				const angle = Math.atan2(cy - centerY, cx - centerX);

				// 计算角度
				let deg = (angle * 180) / Math.PI + 90;
				if (deg < 0) {
					deg += 360;
				}

				// 计算角度得到 hoverId
				this.prevHoverId = this.hoverId;
				let index = 0;
				let oldAngle = 0;
				let foundHover = false;

				for (const k in this.options.data) {
					const val = this.options.data[k];
					const newAngle = oldAngle + (val / this.totalValue) * 360;
					if (oldAngle < deg && deg < newAngle && this.isHover) {
						this.hoverId = index;
						foundHover = true;

						// 重置动画进度
						if (this.prevHoverId !== this.hoverId) {
							this.animationProgress = 0;
						}
						break;
					}
					oldAngle = newAngle;
					index++;
				}

				if (!foundHover) {
					this.hoverId = -1;
					if (this.prevHoverId !== -1) {
						this.animationProgress = 0;
					}
				}
			}

			updateAnimation() {
				// 平滑过渡动画
				if (this.hoverId !== -1) {
					this.animationProgress = Math.min(this.animationProgress + 0.08, 1);
					const easedProgress = easeOutCubic(this.animationProgress);
					this.targetRadius = this.radius * (1 + 0.08 * easedProgress);
				} else {
					this.animationProgress = Math.min(this.animationProgress + 0.12, 1);
					const easedProgress = easeOutCubic(this.animationProgress);
					this.targetRadius = this.radius * (1 + 0.08 * (1 - easedProgress));
				}

				// 平滑插值
				this.currentRadius += (this.targetRadius - this.currentRadius) * 0.15;
			}

			drawSlices() {
				let colorIndex = 0;
				let startAngle = -Math.PI / 2;

				for (const k in this.options.data) {
					const val = this.options.data[k];
					const sliceAngle = (2 * Math.PI * val) / this.totalValue;
					const midAngle = startAngle + sliceAngle / 2;

					// 计算位移方向（沿着扇形中心方向）
					let offsetX = 0;
					let offsetY = 0;
					if (this.hoverId === colorIndex) {
						const offsetDistance = this.currentRadius - this.radius;
						offsetX = Math.cos(midAngle) * offsetDistance;
						offsetY = Math.sin(midAngle) * offsetDistance;
					}

					drawPieSlice(
						this.ctx,
						this.canvas.width / 2,
						this.canvas.height / 2,
						this.hoverId === colorIndex ? this.radius : this.radius,
						startAngle,
						startAngle + sliceAngle,
						this.colors[colorIndex % this.colors.length],
						this.hoverId === colorIndex,
						offsetX,
						offsetY,
					);

					startAngle += sliceAngle;
					colorIndex++;
				}
			}

			drawGuideLine() {
				let index = 0;
				let startAngle = -Math.PI / 2;
				const outerRadius = 15 + this.radius;
				const guideLineWidth = Math.min(50, this.canvas.width * 0.1);

				// 分别收集左右两侧的标注
				const leftLabels: Array<{y: number; text: string; color: string; percentage: number}> = [];
				const rightLabels: Array<{y: number; text: string; color: string; percentage: number}> = [];

				for (const k in this.options.data) {
					const val = this.options.data[k];
					const percentage = (val / this.totalValue) * 100;
					const sliceAngle = (2 * Math.PI * val) / this.totalValue;
					const midAngle = startAngle + sliceAngle / 2;

					const isRight = Math.cos(midAngle) > 0;

					// 计算外圈的坐标
					const x2 = this.canvas.width / 2 + Math.cos(midAngle) * outerRadius;
					const y2 = this.canvas.height / 2 + Math.sin(midAngle) * outerRadius;

					if (isRight) {
						rightLabels.push({ y: y2, text: k, color: this.options.colors[index], percentage });
					} else {
						leftLabels.push({ y: y2, text: k, color: this.options.colors[index], percentage });
					}

					startAngle += sliceAngle;
					index++;
				}

				// 调整标注位置避免重叠
				const adjustLabels = (labels: typeof leftLabels, ascending: boolean) => {
					labels.sort((a, b) => ascending ? a.y - b.y : b.y - a.y);
					const minSpacing = 25;

					for (let i = 1; i < labels.length; i++) {
						if (Math.abs(labels[i].y - labels[i - 1].y) < minSpacing) {
							labels[i].y = labels[i - 1].y + (ascending ? minSpacing : -minSpacing);
						}
					}
				};

				adjustLabels(leftLabels, true);
				adjustLabels(rightLabels, true);

				// 绘制左侧标注
				index = 0;
				startAngle = -Math.PI / 2;
				for (const k in this.options.data) {
					const val = this.options.data[k];
					const sliceAngle = (2 * Math.PI * val) / this.totalValue;
					const midAngle = startAngle + sliceAngle / 2;
					const isRight = Math.cos(midAngle) > 0;

					const x = this.canvas.width / 2 + Math.cos(midAngle) * this.radius;
					const y = this.canvas.height / 2 + Math.sin(midAngle) * this.radius;
					const x2 = this.canvas.width / 2 + Math.cos(midAngle) * outerRadius;

					const label = isRight
						? rightLabels.find(l => l.text === k)
						: leftLabels.find(l => l.text === k);

					if (!label) {
						startAngle += sliceAngle;
						index++;
						continue;
					}

					const y2 = label.y;
					const x3 = isRight ? x2 + guideLineWidth : x2 - guideLineWidth;

					// 绘制折线
					drawPolyline(
						this.ctx,
						[
							{ x, y },
							{ x: x2, y: y2 },
							{ x: x3, y: y2 },
						],
						label.color,
						2,
					);

					// 绘制文本
					const fontSize = Math.max(12, this.canvas.width * 0.02);
					const labelText = `${k} (${label.percentage.toFixed(1)}%)`;
					drawText(
						this.ctx,
						labelText,
						isRight ? x3 + 5 : x3 - 5,
						y2,
						`${fontSize}px Arial`,
						"#374151",
						isRight ? "left" : "right",
					);

					startAngle += sliceAngle;
					index++;
				}
			}

			drawLabels() {
				// Empty implementation
			}

			draw() {
				this.updateAnimation();
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.drawSlices();
				this.drawLabels();
				this.drawGuideLine();
				this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
			}

			// Update chart when canvas is resized
			onResize() {
				this.updateRadius();
				this.currentRadius = this.radius;
				this.targetRadius = this.radius;
			}

			destroy() {
				cancelAnimationFrame(this.animationFrameId);
				this.canvas.removeEventListener("mousemove", this.onMouseMove);
			}
		}

		const myPiechart = new PieChart({
			canvas: myCanvas,
			seriesName: "fruit shop",
			padding: Math.min(myCanvas.width * 0.15, 80),
			data: {
				banana: 30,
				apple: 40,
				orange: 23,
				strawberry: 7,
			},
			colors: ["#5470C6", "#91CC75", "#fac858", "#ee6666"],
			titleOptions: {
				align: "center",
				fill: "black",
				font: {
					weight: "bold",
					size: "18px",
					family: "Lato",
				},
			},
		});

		myPiechart.draw();

		// Handle window resize
		const handleResize = () => {
			resizeCanvas();
			myPiechart.onResize();
		};

		window.addEventListener("resize", handleResize);

		// Clean up function
		return () => {
			window.removeEventListener("resize", handleResize);
			myPiechart.destroy();
			document.body.style.cursor = "default";
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full h-full flex justify-center items-center"
		>
			<canvas ref={ref} className="w-full h-full" />
		</div>
	);
}
