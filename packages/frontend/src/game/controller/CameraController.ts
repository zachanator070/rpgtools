import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GameController} from "./GameController";
import GameState from "../GameState";

export class CameraController implements GameController {

	private controls: OrbitControls;
	private gameState: GameState;

	constructor(gameState: GameState) {
		this.gameState = gameState;
		this.controls = new OrbitControls(this.gameState.camera, this.gameState.renderRoot);
	}

	enable = () => {
		this.controls.enabled = true;
	};

	disable = () => {
		this.controls.enabled = false;
	};

	tearDown = () => {
		this.controls.dispose();
	};
}
