import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createScene } from "./components/scene";
import { createCamera } from "./components/camera";
import { createLights } from "./components/lights";
import { createAxesHelper, createGridHelper } from "./components/helpers";
import { Train } from "./components/Train/Train";
import { loadBirds } from "./components/birds/birds";
import { createRenderer } from "./systems/renderer";
import { createControls } from "./systems/controls";
import Resizer from './systems/Resizer';
import Loop from './systems/Loop';

export class Model {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly loop: Loop;
  private readonly controls: OrbitControls;

  constructor(container: HTMLElement) {
    if (!container) {
      throw new Error("You have to pass a element");
    }
    this.camera = createCamera();
    this.scene = createScene();
    this.renderer = createRenderer();
    this.loop = new Loop(this.camera, this.scene, this.renderer)

    container.append(this.renderer.domElement);

    this.controls = createControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      // 按需渲染需要执行以获取下一帧
      this.render()
    })

    const { ambientLight, mainLight } = createLights();
    const train = new Train()

    // this.loop.updatables.push(controls, train);

    this.scene.add(ambientLight, mainLight, /**train */);

    const resizer = new Resizer(container, this.camera, this.renderer);
    resizer.onResize = () => { // 添加动画后会自动刷新，所以可以移除该函数
      this.render() // 处理变化时需重新执行，避免物体拉升变形
    }

    this.scene.add(createAxesHelper(), /**createGridHelper() */);
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
    this.loop.start()
  }

  /**
   * 停止循环运行
   */
  public stop() {
    this.loop.stop()
  }

  public async init() {
    const { parrot, flamingo, stork } = await loadBirds();

    this.controls.target.copy(parrot.position); // 把目标移到前鸟的中心

    this.loop.updatables.push(parrot, flamingo, stork);
    this.scene.add(parrot, flamingo, stork);
  }
}

export default Model;