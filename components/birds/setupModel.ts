import { AnimationMixer } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 提取模型
 */
const setupModel = (data: GLTF) => {
  const model = data.scene.children[0];
  const clip = data.animations[0];

  const mixer = new AnimationMixer(model);
  const action = mixer.clipAction(clip);
  action
    .startAt(2)// 延迟动画的开始
    .setEffectiveTimeScale(0.5)// 动画的速度
    .play();

  (model as (typeof model) & { tick?(ms: number): void }).tick = (delta) => {
    mixer.update(delta)
  };

  // action
  //   .halt(3) // 逐渐减慢动画停止
  //   .stop()

  return model;
}

export { setupModel };