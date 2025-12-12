import type { PerspectiveCamera, WebGLRenderer } from "three";

class Resizer {
  constructor(container: HTMLElement, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.setSize(container, camera, renderer);

    window.addEventListener('resize', () => {
      this.setSize(container, camera, renderer)
      this.onResize();
    });
  }

  private setSize(container: HTMLElement, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    camera.aspect = container.clientWidth / container.clientHeight;
    // 更新相机的截锥体
    camera.updateProjectionMatrix();
    // 设置渲染器场景大小
    renderer.setSize(container.clientWidth, container.clientHeight);
    // 设置设备像素比
    renderer.setPixelRatio(window.devicePixelRatio);
  };

  public onResize() { }
}

export default Resizer;