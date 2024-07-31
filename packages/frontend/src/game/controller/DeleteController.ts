
import {GameController} from "./GameController";
import GameData from "../GameData";

export class DeleteController implements GameController {

	private renderRoot: HTMLCanvasElement;
	private gameData: GameData;

	constructor(renderRoot: HTMLCanvasElement, gameData: GameData) {
		this.renderRoot = renderRoot;
		this.gameData = gameData;
	}

	deleteModelEvent = (event: KeyboardEvent) => {
		if (event.key === 'del' && this.gameData.selectedMeshedModel) {
			this.gameData.selectedMeshedModel = null;
		}
	};

	enable = () => {
		this.renderRoot.addEventListener("keydown", this.deleteModelEvent);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.renderRoot.removeEventListener("keydown", this.deleteModelEvent);
	};
}
