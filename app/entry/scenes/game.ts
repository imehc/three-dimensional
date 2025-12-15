import Phaser from "phaser";
import ObstaclesController from "./controller/ObstaclesController";
import PlayerController from "./controller/PlayerController";
import SnakeController from "./controller/SnakeController";
import { sharedInstance as events } from "./EventCenter";
import store from "./Store";

export default class Game extends Phaser.Scene {
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

	private panda?: Phaser.Physics.Matter.Sprite;
	private playerController?: PlayerController;
	private obstacles!: ObstaclesController;
	private snake: SnakeController[] = [];

	constructor() {
		super("game");
	}

	init() {
		this.cursors = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).createCursorKeys();
		this.obstacles = new ObstaclesController();
		this.snake = [];

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.destroy();
		});

		events.on("game-suc", () => {
			this.scene.start("game-suc");
		});
	}

	preload() {
		this.load.atlas("panda", "assets/panda.png", "assets/panda.json");
		this.load.atlas("snake", "assets/snake.png", "assets/snake.json");
		this.load.image("tiles", "assets/tiles_spritesheet.png");
		this.load.image("tiles", "assets/sheet.png");
		this.load.tilemapTiledJSON("tilemap", "assets/game.json");

		this.load.image("star", "assets/star.png");
		this.load.image("health", "assets/health.png");
		this.load.image("key", "assets/key.png");
	}

	create() {
		this.scene.launch("ui");
		this.scene.launch("audio");

		this.add.image(0, 0, "bg").setScale(1.3).setOrigin(0, 0);
		this.add.image(1600, 0, "bg").setScale(1.3).setOrigin(0, 0);
		this.add.image(3200, 0, "bg").setScale(1.3).setOrigin(0, 0);

		const map = this.make.tilemap({ key: "tilemap" });
		const tileset = map.addTilesetImage(
			"tiles_spritesheet",
			"tiles",
		) as Phaser.Tilemaps.Tileset;

		const ground = map.createLayer(
			"ground",
			tileset,
		) as Phaser.Tilemaps.TilemapLayer;

		ground.setCollisionByProperty({ collides: true });

		map.createLayer("obstacles", tileset);
		map.createLayer("door", tileset);
		const hideLayer = map.createLayer(
			"hide",
			tileset,
		) as Phaser.Tilemaps.TilemapLayer;
		hideLayer.setVisible(false);

		const objectsLayer = map.getObjectLayer(
			"objects",
		) as Phaser.Tilemaps.ObjectLayer;

		objectsLayer.objects.forEach((objData) => {
			const { x = 0, y = 0, name, width = 0, height = 0 } = objData;
			switch (name) {
				case "panda-spawn": {
					this.panda = this.matter.add
						.sprite(x + width * 0.5, y, "panda")
						.setFixedRotation();

					this.playerController = new PlayerController(
						this,
						this.panda,
						this.cursors,
						this.obstacles,
					);

					this.cameras.main.startFollow(this.panda, true);
					break;
				}

				case "snake": {
					const snake = this.matter.add
						.sprite(x, y, "snake")
						.setFixedRotation();

					this.snake.push(new SnakeController(this, snake));
					this.obstacles.add("snake", snake.body as MatterJS.BodyType);
					break;
				}

				case "star": {
					const star = this.matter.add.sprite(
						x + width * 0.5,
						y + height * 0.5,
						"star",
						undefined,
						{
							isStatic: true,
							isSensor: true,
						},
					);

					star.setData("type", "star");
					break;
				}
				case "key": {
					const key = this.matter.add.sprite(
						x + width * 0.5,
						y + height * 0.5,
						"key",
						undefined,
						{
							isStatic: true,
							isSensor: true,
						},
					);
					key.setData("type", "key");
					key.setData("hideLayer", hideLayer);
					break;
				}

				case "health": {
					const health = this.matter.add.sprite(x, y, "health", undefined, {
						isStatic: true,
						isSensor: true,
					});

					health.setData("type", "health");
					health.setData("healthPoints", 10);
					break;
				}

				case "spikes": {
					const spike = this.matter.add.rectangle(
						x + width * 0.5,
						y + height * 0.5,
						width,
						height,
						{
							isStatic: true,
						},
					);
					this.obstacles.add("spikes", spike);
					break;
				}

				case "hide": {
					const hide = this.matter.add.rectangle(
						x + width * 0.5,
						y + height * 0.5,
						width,
						height,
						{
							isStatic: true,
							isSensor: true,
						},
					);
					store.set("hide", hide);
					break;
				}

				case "door": {
					const door = this.matter.add.rectangle(
						x + width * 0.5,
						y + height * 0.5,
						width,
						height,
						{
							isStatic: true,
							isSensor: true,
						},
					);
					this.obstacles.add("door", door);
					break;
				}
			}
		});

		this.matter.world.convertTilemapLayer(ground);
	}

	destroy() {
		this.scene.stop("ui");
		this.sound.get("bg").destroy();
		this.snake.forEach((snake) => {
			snake.destroy();
		});
	}

	update(t: number, dt: number) {
		this.playerController?.update(dt);

		this.snake.forEach((snake) => {
			snake.update(dt);
		});
	}
}
