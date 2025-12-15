import Phaser from "phaser";
import { sharedInstance as events } from "./EventCenter";

export default class AudioPlay extends Phaser.Scene {
  constructor() {
    super("audio");
  }

  preload() {
    this.load
      .audio("bg", "assets/audio/bg.mp3")
      .audio("hitWall", "assets/audio/hitWall.wav")
      .audio("gameover", "assets/audio/gameOver.wav")
      .audio("eat", "assets/audio/eat.wav")
      .audio("menuClick", "assets/audio/menuClick.wav")
      .audio("success", "assets/audio/success.wav")
      .audio("run", "assets/audio/run.mp3");
  }
  init() {
    events.on("pause_bg", this.pauseBgMusic, this);
    events.on("play_bg", this.playBgMusic, this);

    events.on("play_hitWall", this.playHitWallMusic, this);
    events.on("play_gameover", this.playGameOverMusic, this);
    events.on("play_eat", this.playEatMusic, this);
    events.on("play_menuClick", this.playMenuClickMusic, this);
    events.on("play_success", this.playSuccessMusic, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("pause_bg", this.pauseBgMusic, this);
      events.off("play_bg", this.playBgMusic, this);

      events.off("play_hitWall", this.playHitWallMusic, this);
      events.off("play_gameover", this.playGameOverMusic, this);
      events.off("play_eat", this.playEatMusic, this);
      events.off("play_menuClick", this.playMenuClickMusic, this);
      events.off("play_success", this.playSuccessMusic, this);
    });
  }

  create() {
    const bg = this.sound.add("bg", { loop: true });
    this.sound.add("bg");
    this.sound.add("hitWall");
    this.sound.add("gameover");
    this.sound.add("eat");
    this.sound.add("menuClick");
    this.sound.add("success");
    bg.play();
  }

  pauseBgMusic() {
    this.sound.get("bg").pause();
  }
  playBgMusic() {
    this.sound.get("bg").play({ loop: true });
  }
  playHitWallMusic() {
    this.sound.get("hitWall").play();
  }
  playGameOverMusic() {
    this.sound.get("gameover").play();
  }
  playEatMusic() {
    this.sound.get("eat").play();
  }
  playMenuClickMusic() {
    this.sound.get("menuClick").play();
  }
  playSuccessMusic() {
    this.sound.get("success").play();
  }
}
