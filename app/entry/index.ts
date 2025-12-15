import Phaser from "phaser";
import AudioPlay from "./scenes/AudioPlay";
import Game from "./scenes/Game";
import GameOver from "./scenes/GameOver";
import GameStart from "./scenes/GameStart";
import GameSuc from "./scenes/GameSuc";
import UI from "./scenes/UI";

export function createGame(parent: HTMLElement) {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		width: window.innerWidth,
		height: window.innerHeight,
		parent: parent,
		physics: {
			default: "matter",
			matter: {
				debug: import.meta.env.DEV,
			},
		},
		scene: [GameStart, Game, UI, AudioPlay, GameOver, GameSuc],
		scale: {
			mode: Phaser.Scale.RESIZE,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
	};

	return new Phaser.Game(config);
}

export default createGame;
