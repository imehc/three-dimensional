import type { Camera, WebGLRenderer, Scene, Object3D, } from "three";
import { Clock } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Updatable = ((Object3D | OrbitControls) & { tick?(ms: number): void })

class Loop {
  private readonly camera: Camera;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private readonly clock = new Clock();
  public updatables: Updatable[];

  constructor(camera: Camera, scene: Scene, renderer: WebGLRenderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  public start() {
    this.renderer.setAnimationLoop(() => {
      this.tick()

      this.renderer.render(this.scene, this.camera);
    })
  }

  public stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * 执行下一帧动画
   */
  private tick() {
    // 前一帧花了多长时间 
    const delta = this.clock.getDelta(); // 每次执行只调用一次
    for (const object of this.updatables) {
      object?.tick?.(delta);
    }
  }
}

export default Loop;