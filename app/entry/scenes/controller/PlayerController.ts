import StateMachine from "../../statemachine/StateMachine";
import { sharedInstance as events } from "../EventCenter";
import store from "../Store";
import type ObstaclesController from "./ObstaclesController";

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController {
	private scene: Phaser.Scene;
	private sprite: Phaser.Physics.Matter.Sprite;
	private cursors: CursorKeys;
	private obstacles: ObstaclesController;
	private stateMachine: StateMachine;
	private health = 100;
	private status = "";

	private lastSnake?: Phaser.Physics.Matter.Sprite;
	constructor(
		scene: Phaser.Scene,
		sprite: Phaser.Physics.Matter.Sprite,
		cursors: CursorKeys,
		obstacles: ObstaclesController,
	) {
		this.scene = scene;
		this.sprite = sprite;
		this.cursors = cursors;
		this.obstacles = obstacles;

		this.createAnimations();

		this.stateMachine = new StateMachine(this, "player");

		this.stateMachine
			.addState("idle", {
				onEnter: this.idleOnEnter,
				onUpdate: this.idleOnUpdate,
			})
			.addState("walk", {
				onEnter: this.walkOnEnter,
				onUpdate: this.walkOnUpdate,
				onExit: this.walkOnExit,
			})
			.addState("jump", {
				onEnter: this.jumpOnEnter,
				onUpdate: this.jumpOnUpdate,
				onExit: this.jumpOnExit,
			})
			.addState("spike-hit", {
				onEnter: this.spikeHitOnEnter,
			})
			.addState("snake-hit", {
				onEnter: this.snakeHitOnEnter,
			})
			.addState("snake-stomp", {
				onEnter: this.snakeStompOnEnter,
			})
			.addState("dead", {
				onEnter: this.deadOnEnter,
			})
			.setState("idle");

		this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
			const body = data.bodyB as MatterJS.BodyType;

			if (this.obstacles.is("spikes", body)) {
				this.stateMachine.setState("spike-hit");
				events.emit("play_hitWall");

				return;
			}

			if (this.obstacles.is("door", body)) {
				events.emit("play_eat");
				events.emit("game-suc");
				return;
			}

			if (this.obstacles.is("snake", body)) {
				this.lastSnake = body.gameObject as Phaser.Physics.Matter.Sprite;
				if (this.sprite.y + 30 < body.position.y) {
					this.stateMachine.setState("snake-stomp");
					events.emit("play_eat");
				} else {
					this.stateMachine.setState("snake-hit");
					events.emit("play_hitWall");
				}
				return;
			}

			const gameObject = body.gameObject;

			if (!gameObject) {
				return;
			}
			if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
				if (this.stateMachine.isCurrentState("jump")) {
					this.stateMachine.setState("idle");
				}
				return;
			}

			const sprite = gameObject as Phaser.Physics.Matter.Sprite;
			const type = sprite.getData("type");

			switch (type) {
				case "star": {
					events.emit("star-collected");
					events.emit("play_eat");

					sprite.destroy();
					break;
				}

				case "health": {
					const value = sprite.getData("healthPoints") ?? 10;
					this.health = Phaser.Math.Clamp(this.health + value, 0, 100);
					events.emit("health-changed", this.health);
					events.emit("play_eat");

					sprite.destroy();
					break;
				}

				case "key": {
					events.emit("play_eat");
					const hideLayer = sprite.getData("hideLayer");

					const hide = store.get("hide") as NonNullable<ReturnType<typeof store.get>>
					hideLayer.setVisible(true);
					hide.isSensor = false;
					sprite.destroy();
					break;
				}
			}
		});
	}

	update(dt: number) {
		this.stateMachine.update(dt);

		// 物体的y轴速度发生了变化
		const currentVelocityY = (this.sprite.body as Phaser.Physics.Arcade.Body)
			.velocity.y;
		if (currentVelocityY > 0) {
			this.status = "drop";
		} else if (currentVelocityY < 0) {
			this.status = "jump";
		} else {
			this.status = "";
		}
	}

	private setHealth(value: number) {
		this.health = Phaser.Math.Clamp(value, 0, 100);

		events.emit("health-changed", this.health);

		// TODO: check for death
		if (this.health <= 0) {
			this.stateMachine.setState("dead");
		}
	}

	private idleOnEnter() {
		this.sprite.play("player-idle");
	}

	private idleOnUpdate() {
		if (this.cursors.left.isDown || this.cursors.right.isDown) {
			this.stateMachine.setState("walk");
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
		if (spaceJustPressed) {
			this.stateMachine.setState("jump");
		}
	}

	private walkOnEnter() {
		this.sprite.play("player-walk");
	}

	private walkOnUpdate() {
		const speed = 5;

		if (this.cursors.left.isDown) {
			this.sprite.flipX = false;
			this.sprite.setVelocityX(-speed);
		} else if (this.cursors.right.isDown) {
			this.sprite.flipX = true;
			this.sprite.setVelocityX(speed);
		} else {
			this.sprite.setVelocityX(0);
			this.stateMachine.setState("idle");
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
		if (spaceJustPressed) {
			this.stateMachine.setState("jump");
		}
	}

	private walkOnExit() {
		this.sprite.stop();
	}
	private jumpOnEnter() {
		if (this.status === "drop") return;
		this.sprite.setVelocityY(-12);
	}

	private jumpOnUpdate() {
		const speed = 5;

		if (this.cursors.left.isDown) {
			this.sprite.flipX = false;
			this.sprite.setVelocityX(-speed);
		} else if (this.cursors.right.isDown) {
			this.sprite.flipX = true;
			this.sprite.setVelocityX(speed);
		}
	}

	private jumpOnExit() {}

	private spikeHitOnEnter() {
		this.sprite.setVelocityY(-12);

		const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
		const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

		this.scene.tweens.addCounter({
			from: 0,
			to: 100,
			duration: 100,
			repeat: 2,
			yoyo: true,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (tween) => {
				const value = tween.getValue();
				const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
					startColor,
					endColor,
					100,
					value as number,
				);

				const color = Phaser.Display.Color.GetColor(
					colorObject.r,
					colorObject.g,
					colorObject.b,
				);

				this.sprite.setTint(color);
			},
		});

		this.stateMachine.setState("idle");

		this.setHealth(this.health - 40);
	}

	private snakeHitOnEnter() {
		if (this.lastSnake) {
			if (this.sprite.x < this.lastSnake.x) {
				this.sprite.setVelocityX(-20);
			} else {
				this.sprite.setVelocityX(20);
			}
		} else {
			this.sprite.setVelocityY(-20);
		}

		const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
		const endColor = Phaser.Display.Color.ValueToColor(0x0000ff);

		this.scene.tweens.addCounter({
			from: 0,
			to: 100,
			duration: 100,
			repeat: 2,
			yoyo: true,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (tween) => {
				const value = tween.getValue();
				const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
					startColor,
					endColor,
					100,
					value as number,
				);

				const color = Phaser.Display.Color.GetColor(
					colorObject.r,
					colorObject.g,
					colorObject.b,
				);

				this.sprite.setTint(color);
			},
		});

		this.stateMachine.setState("idle");

		this.setHealth(this.health - 15);
	}

	private snakeStompOnEnter() {
		this.sprite.setVelocityY(-10);

		events.emit("snake-stomped", this.lastSnake);

		this.stateMachine.setState("idle");
	}

	private deadOnEnter() {
		this.sprite.play("player-death");

		this.sprite.setOnCollide(() => {});

		this.scene.time.delayedCall(1500, () => {
			events.emit("play_gameover");
			this.scene.scene.start("game-over");
		});
	}

	private createAnimations() {
		this.sprite.anims.create({
			key: "player-idle",
			frames: [{ key: "panda", frame: "panda_idle_01.png" }],
		});

		this.sprite.anims.create({
			key: "player-walk",
			frameRate: 10,
			frames: this.sprite.anims.generateFrameNames("panda", {
				start: 1,
				end: 4,
				prefix: "panda_01_run_0",
				suffix: ".png",
			}),
			repeat: -1,
		});

		this.sprite.anims.create({
			key: "player-death",
			frameRate: 10,
			frames: this.sprite.anims.generateFrameNames("panda", {
				start: 1,
				end: 5,
				prefix: "panda_01_die_0",
				suffix: ".png",
			}),
			repeat: 0,
		});
	}
}
