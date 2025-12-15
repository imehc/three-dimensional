import Phaser from "phaser";
import { sharedInstance as events } from "./EventCenter";

export default class GameSuc extends Phaser.Scene {
  constructor() {
    super("game-suc");
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width * 0.5, height * 0.3, "bg").setScale(1.2);
    this.add
      .text(width * 0.5, height * 0.3, "Victory!", {
        fontSize: "100px",
        color: "#fff",
        fontFamily: "Arial",
        stroke: "#00ff00", // 绿色外边框颜色
        strokeThickness: 10, // 外边框粗细
        shadow: {
          offsetX: 2, // 阴影横向偏移
          offsetY: 2, // 阴影纵向偏移
          color: "#000", // 阴影颜色
          blur: 4, // 阴影模糊程度
          stroke: true, // 是否为阴影添加外边框
          fill: true, // 是否填充阴影
        },
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(width * 0.5, height * 0.55, 150, 75, 0xffffff)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        events.emit("play_menuClick");
        this.scene.start("game");
      });
    this.add.image(button.x, button.y + 10, "start").setScale(0.5);
  }
}
