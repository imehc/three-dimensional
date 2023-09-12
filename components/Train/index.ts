import { Group, MathUtils } from 'three';
import { createMeshes } from './meshes';

class Train extends Group {
  private readonly whellSpeed = MathUtils.degToRad(24); // 角度转弧度
  private readonly meshes = createMeshes();

  constructor() {
    super();

    this.add(
      this.meshes.nose,
      this.meshes.cabin,
      this.meshes.chimney,
      this.meshes.smallWhellRear,
      this.meshes.smallWhellCenter,
      this.meshes.smallWhellFront,
      this.meshes.bigWheel,
    );
  }

  public tick(delta: number) {
    this.meshes.bigWheel.rotation.y += this.whellSpeed * delta;
    this.meshes.smallWhellRear.rotation.y += this.whellSpeed * delta;
    this.meshes.smallWhellCenter.rotation.y += this.whellSpeed * delta;
    this.meshes.smallWhellFront.rotation.y += this.whellSpeed * delta;
  }
}

export { Train };