import { GUI } from "dat.gui";
import {
	Mesh,
	type PerspectiveCamera,
	type Scene,
	type WebGLRenderer,
} from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadBirds } from "./components/birds";
import { createCamera } from "./components/camera";
import { createAxesHelper, createGridHelper } from "./components/helpers";
import { createLights } from "./components/lights";
import { createScene } from "./components/scene";
import { Train } from "./components/Train";
import { createControls } from "./systems/controls";
import Loop from "./systems/Loop";
import Resizer from "./systems/Resizer";
import { createRenderer } from "./systems/renderer";

export class Model {
	private readonly scene: Scene;
	private readonly camera: PerspectiveCamera;
	private readonly renderer: WebGLRenderer;
	private readonly loop: Loop;
	private readonly controls: OrbitControls;
	private readonly gui = new GUI();
	private guiVisible = false;
	private handleKeyPress: (e: KeyboardEvent) => void;

	constructor(container: HTMLElement) {
		if (!container) {
			throw new Error("You have to pass a element");
		}
		this.camera = createCamera();
		this.scene = createScene();
		this.renderer = createRenderer();
		this.loop = new Loop(this.camera, this.scene, this.renderer);

		container.append(this.renderer.domElement);

		this.controls = createControls(this.camera, this.renderer.domElement);
		this.controls.addEventListener("change", () => {
			// 按需渲染需要执行以获取下一帧
			this.render();
		});

		const { ambientLight, mainLight } = createLights();
		const train = new Train();

		// this.loop.updatables.push(controls, train);

		this.scene.add(ambientLight, mainLight /**train */);

		const resizer = new Resizer(container, this.camera, this.renderer);
		resizer.onResize = () => {
			// 添加动画后会自动刷新，所以可以移除该函数
			this.render(); // 处理变化时需重新执行，避免物体拉升变形
		};

		this.scene.add(createAxesHelper() /**createGridHelper() */);
		// 默认隐藏调试控制器
		this.gui.hide();

		// 添加键盘事件监听器（仅在客户端环境）
		this.handleKeyPress = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "h") {
				this.toggleGUI();
			}
		};
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", this.handleKeyPress);
		}
	}

	/**
	 * 按需渲染
	 */
	public render() {
		this.renderer.render(this.scene, this.camera);
	}

	/**
	 * 循环运行
	 */
	public start() {
		this.loop.start();
	}

	/**
	 * 停止循环运行
	 */
	public stop() {
		this.loop.stop();
	}

	/**
	 * 切换GUI显示/隐藏
	 */
	private toggleGUI() {
		this.guiVisible = !this.guiVisible;
		if (this.guiVisible) {
			this.gui.show();
		} else {
			this.gui.hide();
		}
	}

	public async init() {
		const { parrot, flamingo, stork } = await loadBirds(this.gui);

		this.controls.target.copy(parrot.position); // 把目标移到前鸟的中心

		this.loop.updatables.push(parrot, flamingo, stork);
		this.scene.add(parrot, flamingo, stork);
	}

	/**
	 * 执行销毁方法
	 */
	public dispose() {
		// 移除键盘事件监听器（仅在客户端环境）
		if (typeof window !== "undefined") {
			window.removeEventListener("keydown", this.handleKeyPress);
		}

		// 销毁GUI
		try {
			// 移除GUI的DOM元素
			const guiDom = this.gui.domElement.parentElement;
			if (guiDom && guiDom.parentElement) {
				guiDom.parentElement.removeChild(guiDom);
			}
			this.gui.destroy();
		} catch (e) {
			console.warn("GUI cleanup error:", e);
		}

		// 销毁场景中的对象
		while (this.scene.children.length) {
			const child = this.scene.children[0];
			this.scene.remove(child);
			// 进行特定对象的清理
			if (child instanceof Mesh) {
				child.geometry.dispose();
				child.material.dispose();
			}
		}
		// 销毁渲染器等
		this.renderer.dispose();
	}
}

export default Model;
