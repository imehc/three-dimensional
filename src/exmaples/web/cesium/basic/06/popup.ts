import {
	type Cartesian3,
	CustomDataSource,
	createGuid,
	type Entity,
	type Event,
	HorizontalOrigin,
	SceneTransforms,
	VerticalOrigin,
	type Viewer,
} from "cesium";

interface PopupOption {
	viewer: Viewer;
	html?: string;
	className?: string;
}

type PopupAddOption = {
	position: Cartesian3;
	content: {
		header?: string;
		content: string;
	};
	isClose?: boolean;
};

type GetListenerType<T> = T extends Event<infer L> ? L : never;
type Listener = GetListenerType<Event>;

export class Popup {
	private option: PopupOption;

	private id = 0;
	private ctnMap: Record<string, [Cartesian3, HTMLDivElement]> = {};
	private eventListener: Listener | null = null;

	constructor(option: PopupOption) {
		this.option = option;
	}

	public add({ position, content, isClose = false }: PopupAddOption): string {
		const id = `popup_${(((1 + Math.random()) * 0x10000) | 0).toString(16)}${this.id++}`;
		const ctn = document.createElement("div");
		ctn.className = `tw:absolute tw:z-[1000] tw:pointer-events-auto${this.option.className ? ` ${this.option.className}` : ""}`;
		ctn.id = id;
		ctn.style.transform = "translate(-50%, -100%)";
		this.option.viewer.container.appendChild(ctn);

		ctn.innerHTML = this.createHtml(content.header, content.content, isClose);
		this.ctnMap[id] = [position, ctn];
		this.render();
		if (!this.eventListener) {
			this.eventListener = () => {
				this.render();
			};
			this.option.viewer.clock.onTick.addEventListener(this.eventListener);
		}
		if (isClose) {
			const closeEl = ctn.getElementsByClassName(
				"bx-popup-close",
			)?.[0] as HTMLElement | null;
			if (closeEl) {
				closeEl.onclick = () => {
					this.close(ctn);
				};
			}
		}
		return id;
	}

	private render() {
		for (const c in this.ctnMap) {
			if (!Object.hasOwn(this.ctnMap, c)) continue;
			const element = this.ctnMap[c];
			const pos = SceneTransforms.worldToWindowCoordinates(
				this.option.viewer.scene,
				element[0],
			);
			if (!pos.x || !pos.y) continue;
			if (
				Math.abs(pos.x) > window.innerWidth * 2 ||
				Math.abs(pos.y) > window.innerHeight * 2
			) {
				this.ctnMap[c][1].style.display = "none";
			} else {
				this.ctnMap[c][1].style.display = "block";
				this.ctnMap[c][1].style.left = `${pos.x}px`;
				// 在点的上方20像素处显示弹窗
				this.ctnMap[c][1].style.top = `${pos.y - 20}px`;
			}
		}
	}

	private createHtml(header: string, content: string, isClose: boolean) {
		if (this.option.html) {
			return this.option.html;
		}
		return `
			${isClose ? '<div class="tw:absolute tw:top-2 tw:right-2 tw:cursor-pointer tw:text-gray-400 hover:tw:text-gray-600 tw:text-xl tw:leading-none bx-popup-close">×</div>' : ""}
			<div class="tw:bg-white tw:rounded-lg tw:shadow-xl tw:p-2 tw:min-w-50 tw:max-w-75">
				<div class="tw:font-bold tw:text-base tw:mb-2 tw:text-gray-800 tw:border-b tw:border-gray-200 tw:pb-1">
					${header}
				</div>
				<div class="tw:text-sm tw:text-gray-600 tw:space-y-1">
					${content}
				</div>
			</div>
			<div class="tw:absolute tw:left-1/2 tw:-bottom-2 tw:-ml-2 tw:w-0 tw:h-0 tw:border-l-8 tw:border-r-8 tw:border-t-8 tw:border-l-transparent tw:border-r-transparent tw:border-t-white" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));"></div>
		`;
	}

	private close(el: HTMLElement) {
		el.remove();
		delete this.ctnMap[el.id];
		if (Object.keys(this.ctnMap).length === 0) {
			this.option.viewer.clock.onTick.removeEventListener(this.eventListener);
			this.eventListener = null;
		}
	}

	public removeById(id: string) {
		const item = this.ctnMap[id];
		if (item) {
			this.close(item[1]);
		}
	}

	public has(id: string): boolean {
		return id in this.ctnMap;
	}

	public closeAll() {
		for (const c in this.ctnMap) {
			if (!Object.hasOwn(this.ctnMap, c)) continue;
			this.ctnMap[c][1].remove();
		}
		this.ctnMap = {};
		this.option.viewer.clock.onTick.removeEventListener(this.eventListener);
		this.eventListener = null;
	}
}

export class Tooltip {
	private options: {
		color: string;
		stroke: string;
		opacity: number;
		textcolor: string;
		strokewidth: number;
		lineheight: number;
		fontSize: string;
		x: number;
		y: number;
		defaultHeight: number;
		width: number;
	};
	private tooltipEntitylist: Record<
		string,
		{
			id: string;
			entity: Entity;
			clear: () => void;
		}
	> = {};
	private viewer: Viewer;
	private dataSource: CustomDataSource;

	constructor(opt: { viewer: Viewer } & Record<string, unknown>) {
		this.options = {
			color: "rgb(59, 130, 246)", // 使用蓝色主题
			stroke: "rgb(96, 165, 250)",
			opacity: 0.9,
			textcolor: "white",
			strokewidth: 2,
			lineheight: 24,
			fontSize: "14px",
			x: 20,
			y: 52,
			defaultHeight: 200,
			width: 220,
		};
		this.options = Object.assign(this.options, opt);
		this.viewer = opt.viewer;
		this.dataSource = new CustomDataSource("tooltipname");
		this.viewer.dataSources.add(this.dataSource);
	}

	add(option: {
		position: Cartesian3;
		header?: string;
		content: string;
		width?: number;
		id?: string;
	}): {
		id: string;
		entity: Entity;
		clear: () => void;
	} {
		const { header, content } = option;
		const contlist = content.split("<br/>");
		const width = option.width || this.options.width;

		// 使用设备像素比提高清晰度
		const scale = window.devicePixelRatio || 2;
		const scaledWidth = width * scale;
		const padding = 18 * scale;
		const radius = 8 * scale;
		const arrowHeight = 12 * scale;
		const arrowWidth = 10 * scale;
		const headerHeight = header ? 38 * scale : 0;
		const lineHeight = 22 * scale;
		const contentTopPadding = 14 * scale; // 上内边距
		const contentBottomPadding = 0 * scale; // 下内边距（减少）

		// 计算总高度：上下内边距 + 标题高度 + 内容高度
		const contentHeight =
			contlist.length * lineHeight + contentTopPadding + contentBottomPadding;
		const totalHeight = headerHeight + contentHeight;
		const svgHeight = totalHeight + arrowHeight + padding;
		const svgWidth = scaledWidth + padding;

		// 构建文字内容
		let textElements = "";
		let textY = headerHeight + contentTopPadding + lineHeight * 0.72;
		for (let i = 0; i < contlist.length; i++) {
			textElements += `<tspan x="${padding / 2 + 8 * scale}" y="${textY}">${contlist[i]}</tspan>`;
			textY += lineHeight;
		}

		// 主体路径 - 圆角矩形
		const mainPath = `M${padding / 2 + radius} ${padding / 2}
			L${svgWidth - padding / 2 - radius} ${padding / 2}
			Q${svgWidth - padding / 2} ${padding / 2} ${svgWidth - padding / 2} ${padding / 2 + radius}
			L${svgWidth - padding / 2} ${totalHeight + padding / 2 - radius}
			Q${svgWidth - padding / 2} ${totalHeight + padding / 2} ${svgWidth - padding / 2 - radius} ${totalHeight + padding / 2}
			L${svgWidth / 2 + arrowWidth / 2} ${totalHeight + padding / 2}
			L${svgWidth / 2} ${svgHeight - padding / 2}
			L${svgWidth / 2 - arrowWidth / 2} ${totalHeight + padding / 2}
			L${padding / 2 + radius} ${totalHeight + padding / 2}
			Q${padding / 2} ${totalHeight + padding / 2} ${padding / 2} ${totalHeight + padding / 2 - radius}
			L${padding / 2} ${padding / 2 + radius}
			Q${padding / 2} ${padding / 2} ${padding / 2 + radius} ${padding / 2} Z`;

		// 标题背景路径（如果有标题）
		const headerPath = header
			? `M${padding / 2 + radius} ${padding / 2}
				L${svgWidth - padding / 2 - radius} ${padding / 2}
				Q${svgWidth - padding / 2} ${padding / 2} ${svgWidth - padding / 2} ${padding / 2 + radius}
				L${svgWidth - padding / 2} ${headerHeight + padding / 2}
				L${padding / 2} ${headerHeight + padding / 2}
				L${padding / 2} ${padding / 2 + radius}
				Q${padding / 2} ${padding / 2} ${padding / 2 + radius} ${padding / 2} Z`
			: "";

		const filterId = createGuid();

		// 构建 SVG
		const svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow-${filterId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${2 * scale}" stdDeviation="${3 * scale}" flood-opacity="0.25"/></filter></defs><path d="${mainPath}" fill="${this.options.color}" stroke="${this.options.stroke}" stroke-width="${this.options.strokewidth * scale}" opacity="${this.options.opacity}" filter="url(#shadow-${filterId})"/>${header ? `<path d="${headerPath}" fill="rgba(0,0,0,0.15)"/>` : ""}${header ? `<text x="${padding / 2 + 8 * scale}" y="${padding / 2 + 26 * scale}" fill="${this.options.textcolor}" font-size="${15 * scale}px" font-weight="600">${header}</text>` : ""}<text fill="${this.options.textcolor}" font-size="${13 * scale}px">${textElements}</text></svg>`;

		// URL 编码 SVG
		const data = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

		const entity = this.dataSource.entities.add({
			position: option.position,
			billboard: {
				image: data,
				scale: 1 / scale, // 缩小回原始大小
				horizontalOrigin: HorizontalOrigin.CENTER,
				verticalOrigin: VerticalOrigin.BOTTOM,
				disableDepthTestDistance: Number.POSITIVE_INFINITY,
			},
		});

		const id = option.id || createGuid();
		const tooltip = {
			id: id,
			entity: entity,
			clear: () => {
				this.cleartooltip(id);
			},
		};
		this.tooltipEntitylist[id] = tooltip;
		return tooltip;
	}

	cleartooltip(id?: string): void {
		if (id) {
			this.dataSource.entities.remove(this.tooltipEntitylist[id].entity);
			delete this.tooltipEntitylist[id];
		} else {
			this.dataSource.entities.removeAll();
			this.tooltipEntitylist = {};
		}
	}

	has(id: string): boolean {
		return id in this.tooltipEntitylist;
	}
}
