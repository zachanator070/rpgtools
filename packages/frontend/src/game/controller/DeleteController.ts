
import {GameController} from "./GameController";
import GameState from "../GameState";

export class DeleteController implements GameController {

	private gameState: GameState;

	constructor(gameState: GameState) {
		this.gameState = gameState;
	}

	deleteModelEvent = (event: KeyboardEvent) => {
		if (event.key === 'del' && this.gameState.selectedMeshedModel) {
			this.gameState.selectedMeshedModel = null;
		}
	};

	enable = () => {
		this.gameState.renderRoot.addEventListener("keydown", this.deleteModelEvent);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameState.renderRoot.removeEventListener("keydown", this.deleteModelEvent);
	};
}
