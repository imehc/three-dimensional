import StateMachine from "../../statemachine/StateMachine";
import { sharedInstance as events } from "../EventCenter";

export default class SnakeController {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Matter.Sprite;
  private stateMachine: StateMachine;

  private moveTime = 0;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
    this.scene = scene;
    this.sprite = sprite;

    this.createAnimations();

    this.stateMachine = new StateMachine(this, "snake");

    this.stateMachine
      .addState("idle", {
        onEnter: this.idleOnEnter,
      })
      .addState("move-left", {
        onEnter: this.moveLeftOnEnter,
        onUpdate: this.moveLeftOnUpdate,
      })
      .addState("move-right", {
        onEnter: this.moveRightOnEnter,
        onUpdate: this.moveRightOnUpdate,
      })
      .addState("dead")
      .setState("idle");

    events.on("snake-stomped", this.handleStomped, this);
  }

  destroy() {
    events.off("snake-stomped", this.handleStomped, this);
  }

  update(dt: number) {
    this.stateMachine.update(dt);
  }

  private createAnimations() {
    this.sprite.anims.create({
      key: "idle",
      frames: [{ key: "snake", frame: "slug_1.png" }],
    });

    this.sprite.anims.create({
      key: "move-left",
      frames: this.sprite.anims.generateFrameNames("snake", {
        start: 1,
        end: 3,
        prefix: "slug_",
        suffix: ".png",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.sprite.anims.create({
      key: "move-right",
      frames: this.sprite.anims.generateFrameNames("snake", {
        start: 1,
        end: 3,
        prefix: "slug_",
        suffix: ".png",
      }),
      frameRate: 5,
      repeat: -1,
    });
  }

  private idleOnEnter() {
    this.sprite.play("idle");
    const r = Phaser.Math.Between(1, 100);
    if (r < 50) {
      this.stateMachine.setState("move-left");
    } else {
      this.stateMachine.setState("move-right");
    }
  }

  private moveLeftOnEnter() {
    this.moveTime = 0;
    this.sprite.play("move-left");
  }

  private moveLeftOnUpdate(dt: number) {
    this.moveTime += dt;
    this.sprite.setVelocityX(-3);
    this.sprite.flipX = false;

    if (this.moveTime > 2000) {
      this.stateMachine.setState("move-right");
    }
  }

  private moveRightOnEnter() {
    this.moveTime = 0;
    this.sprite.play("move-right");
  }

  private moveRightOnUpdate(dt: number) {
    this.moveTime += dt;
    this.sprite.setVelocityX(3);
    this.sprite.flipX = true;

    if (this.moveTime > 2000) {
      this.stateMachine.setState("move-left");
    }
  }

  private handleStomped(snake: Phaser.Physics.Matter.Sprite) {
    if (this.sprite !== snake) {
      return;
    }

    events.off("snake-stomped", this.handleStomped, this);

    this.scene.tweens.add({
      targets: this.sprite,
      displayHeight: 0,
      y: this.sprite.y + this.sprite.displayHeight * 0.5,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy();
      },
    });

    this.stateMachine.setState("dead");
  }
}
