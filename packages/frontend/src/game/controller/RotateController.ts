import {GameController} from "./GameController";
import GameState, {MeshedModel} from "../GameState";

export class RotateController implements GameController {

	private gameState: GameState;

	private mouseMoveListener: () => void;
	private mouseUpListener: () => void;

	constructor(gameState: GameState) {
		this.gameState = gameState;
	}

	selectModel = () => {
		const selectedObject = this.gameState.getFirstMeshUnderMouse();
		if (!selectedObject) {
			return;
		}
		let selectedMeshedModel: MeshedModel;
		for (let meshedModel of this.gameState.meshedModels) {
			if (meshedModel.mesh.id === selectedObject.id) {
				selectedMeshedModel = meshedModel;
				break;
			}
		}
		if (selectedObject) {
			this.mouseMoveListener = () => this.rotateModel(selectedMeshedModel);
			this.gameState.renderRoot.addEventListener("mousemove", this.mouseMoveListener);
			this.mouseUpListener = () => this.rotateDone(selectedMeshedModel);
			this.gameState.renderRoot.addEventListener("mouseup", this.mouseUpListener);
		}
	}

	rotateModel = (selectedMeshedModel: MeshedModel) => {
		if (!selectedMeshedModel) {
			return;
		}
		const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const mapIntersect = intersects[0].point;
		selectedMeshedModel.mesh.lookAt(mapIntersect);
		selectedMeshedModel.positionedModel.lookAtX =
			mapIntersect.x;
		selectedMeshedModel.positionedModel.lookAtZ =
			mapIntersect.z;
	};

	rotateDone = (selectedMeshedModel: MeshedModel) => {
		this.gameState.renderRoot.removeEventListener("mousemove", this.mouseMoveListener);
		this.gameState.renderRoot.removeEventListener("mouseup", this.mouseUpListener);
		this.gameState.notifyPositionedModelUpdatedCallbacks(selectedMeshedModel.positionedModel);
	}

	enable = () => {
		this.gameState.renderRoot.addEventListener("mousedown", this.selectModel);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameState.renderRoot.removeEventListener("mousedown", this.selectModel);
	};
}
