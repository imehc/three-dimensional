import Phaser from "phaser";
import { sharedInstance as events } from "./EventCenter";

export default class UI extends Phaser.Scene {
  private starsLabel!: Phaser.GameObjects.Text;
  private starsCollected = 0;
  private graphics!: Phaser.GameObjects.Graphics;

  private lastHealth = 100;

  constructor() {
    super({
      key: "ui",
    });
  }

  init() {
    this.starsCollected = 0;
    events.on("star-collected", this.handleStarCollected, this);
    events.on("health-changed", this.handleHealthChanged, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("star-collected", this.handleStarCollected, this);
      events.off("health-changed", this.handleHealthChanged, this);
    });
  }

  create() {
    this.graphics = this.add.graphics();
    this.setHealthBar(100);

    this.starsLabel = this.add.text(10, 35, "star  0", {
      fontSize: "32px",
      color: "#fff",
      fontFamily: "Arial",
      stroke: "#00ff00", // 绿色外边框颜色
      strokeThickness: 10, // 外边框粗细
      shadow: {
        offsetY: 2, // 阴影纵向偏移
        blur: 4, // 阴影模糊程度
        stroke: true, // 是否为阴影添加外边框
        fill: true, // 是否填充阴影
      },
    });

    this.add.image(0, 0, "star");
  }

  /**
   * 设置健康条
   * @param value
   */
  private setHealthBar(value: number) {
    const width = 120;
    const percent = Phaser.Math.Clamp(value, 0, 100) / 100;

    this.graphics.clear();
    this.graphics.fillStyle(0x808080);
    this.graphics.fillRoundedRect(10, 10, width, 20, 5);
    if (percent > 0) {
      this.graphics.fillStyle(0x6df300);
      this.graphics.fillRoundedRect(10, 10, width * percent, 20, 5);
    }
  }

  /**
   * 设置健康值
   * @param value
   */
  private handleHealthChanged(value: number) {
    this.tweens.addCounter({
      from: this.lastHealth,
      to: value,
      duration: 200,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue();
        this.setHealthBar(value as number);
      },
    });

    this.lastHealth = value;
  }

  /**
   * 收集星星
   */
  private handleStarCollected() {
    ++this.starsCollected;
    this.starsLabel.text = `star ${this.starsCollected}`;
  }
}
