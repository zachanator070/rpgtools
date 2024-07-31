import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GameController} from "./GameController";
import GameData from "../GameData";
import {CAMERA_CONTROLS} from "../GameRenderer";

export class CameraController implements GameController {

	private enabled: boolean;
	private controls: OrbitControls;
	private gameData: GameData;

	constructor(gameData: GameData) {
		this.gameData = gameData;
		this.controls = new OrbitControls(this.gameData.camera, this.gameData.renderRoot);
		gameData.currentControlsSubject.subscribe(currentControls => {
			if (currentControls === CAMERA_CONTROLS) {
				this.enable();
			} else {
				this.disable();
			}
		})
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
