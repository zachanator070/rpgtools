import {GameController} from "./GameController";
import GameState from "../GameState";

export class RotateController implements GameController {

	private gameData: GameState;

	constructor(gameData: GameState) {
		this.gameData = gameData;
	}

	rotateModel = () => {
		if (!this.gameData.selectedMeshedModel) {
			return;
		}
		const intersects = this.gameData.raycaster.intersectObject(this.gameData.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const mapIntersect = intersects[0].point;
		this.gameData.selectedMeshedModel.mesh.lookAt(mapIntersect);
		this.gameData.selectedMeshedModel.positionedModel.lookAtX =
			mapIntersect.x;
		this.gameData.selectedMeshedModel.positionedModel.lookAtZ =
			mapIntersect.z;
	};

	rotateDone = () => {
	};

	enable = () => {
		this.gameData.renderRoot.addEventListener("mousemove", this.rotateModel);
		this.gameData.renderRoot.addEventListener("mouseup", this.rotateDone);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameData.renderRoot.removeEventListener("mousemove", this.rotateModel);
		this.gameData.renderRoot.removeEventListener("mouseup", this.rotateDone);
	};
}
