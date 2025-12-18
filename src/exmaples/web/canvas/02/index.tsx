import { useEffect, useEffectEvent, useRef } from "react";
import { maxOrbit, random } from "./util";
import Container from "../../componets/Container";

type Star = {
	orbitRadius: number;
	radius: number;
	orbitX: number;
	orbitY: number;
	timePassed: number;
	speed: number;
	alpha: number;
	draw: (ctx: CanvasRenderingContext2D, gradient: HTMLCanvasElement) => void;
};

export default function Canvas02() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLCanvasElement>(null);
	const starsRef = useRef<Star[]>([]);
	const hueRef = useRef(217);
	const gradientRef = useRef<HTMLCanvasElement | null>(null);

	// 创建渐变星星图像
	const createStarGradient = useEffectEvent((hue: number) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return canvas;

		canvas.width = 100;
		canvas.height = 100;
		const half = canvas.width / 2;
		const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
		gradient.addColorStop(0.025, "#fff");
		gradient.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`);
		gradient.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`);
		gradient.addColorStop(1, "transparent");

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(half, half, half, 0, Math.PI * 2);
		ctx.fill();

		return canvas;
	});

	// 创建星星实例
	const createStar = useEffectEvent(
		(w: number, h: number, maxStars: number) => {
			const star: Star = {
				// 星星轨道半径
				// orbitRadius: random(maxOrbit(w, h)),
				orbitRadius: Math.sqrt(Math.random()) * maxOrbit(w, h),
				// 星星半径
				radius: random(60, random(maxOrbit(w, h))) / 12,
				// 轨道中心点x坐标
				orbitX: w / 2,
				// 轨道中心点y坐标
				orbitY: h / 2,
				// 时间参数，用于计算星星在轨道上的位置
				timePassed: random(0, maxStars),
				// 星星移动速度
				speed: random(random(maxOrbit(w, h))) / 50000,
				// 星星透明度
				alpha: random(2, 10) / 10,
				// 绘制星星的方法
				draw: function (
					ctx: CanvasRenderingContext2D,
					gradient: HTMLCanvasElement,
				) {
					// 根据时间参数和轨道半径计算星星当前位置
					const x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
					const y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
					// 随机闪烁效果
					const twinkle = random(10);

					// 实现星星闪烁效果
					if (twinkle === 1 && this.alpha > 0) {
						this.alpha -= 0.05;
					} else if (twinkle === 2 && this.alpha < 1) {
						this.alpha += 0.05;
					}

					// 绘制星星
					ctx.globalAlpha = this.alpha;
					ctx.drawImage(
						gradient,
						x - this.radius / 2,
						y - this.radius / 2,
						this.radius,
						this.radius,
					);
					// 更新时间参数，使星星沿轨道移动
					this.timePassed += this.speed;
				},
			};

			return star;
		},
	);

	// 初始化星空
	const init = useEffectEvent(() => {
		const container = containerRef.current;
		const canvas = ref.current;
		if (!container || !canvas) return;

		const { clientWidth, clientHeight } = container;
		canvas.width = clientWidth;
		canvas.height = clientHeight;

		// 创建星星数组
		const maxStars = 1000;
		starsRef.current = [];
		for (let i = 0; i < maxStars; i++) {
			starsRef.current.push(createStar(clientWidth, clientHeight, maxStars));
		}

		// 创建渐变图像
		gradientRef.current = createStarGradient(hueRef.current);
	});

	// 动画循环
	const animate = useEffectEvent(() => {
		const canvas = ref.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx || !gradientRef.current) return;

		const { width: w, height: h } = canvas;
		const hue = hueRef.current;
		const stars = starsRef.current;

		// 绘制背景
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = 0.8;
		ctx.fillStyle = `hsla(${hue}, 64%, 6%, 1)`;
		ctx.fillRect(0, 0, w, h);

		// 绘制星星
		ctx.globalCompositeOperation = "lighter";
		for (let i = 0; i < stars.length; i++) {
			stars[i].draw(ctx, gradientRef.current);
		}

		requestAnimationFrame(animate);
	});

	useEffect(() => {
		init();
		animate();

		// 窗口大小变化时重新初始化
		const handleResize = () => {
			init();
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<Container ref={containerRef}>
			<canvas ref={ref} className="block" />
		</Container>
	);
}
