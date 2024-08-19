import * as THREE from "three";
import {GameController} from "./GameController";
import GameState, {MeshedModel} from "../GameState";
import {Object3D} from "three/src/core/Object3D";
import {Vector3} from "three";

export class MoveController implements GameController {

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
		const objectIntersectionPoint = this.gameState.raycaster.intersectObject(selectedObject)[0].point;
		if (selectedObject) {
			this.mouseMoveListener = () => this.moveModel(selectedObject, objectIntersectionPoint);
			this.gameState.renderRoot.addEventListener("mousemove", this.mouseMoveListener);
			this.mouseUpListener = () => this.moveDone(selectedMeshedModel);
			this.gameState.renderRoot.addEventListener("mouseup", this.mouseUpListener);
		}
	}

	moveModel = (selectedObject: Object3D, objectIntersectionPoint: Vector3) => {

		const mapIntersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
		if (mapIntersects.length === 0) {
			return;
		}
		const mapIntersect = mapIntersects[0].point;
		const origin = this.gameState.raycaster.camera.position;
		const hypotenuse = origin.distanceTo(mapIntersect);
		const theta = Math.asin(origin.y / hypotenuse);
		const newHypotenuseLength =
			objectIntersectionPoint.y / Math.sin(theta);
		const hypotenuseRatio = newHypotenuseLength / hypotenuse;
		const newHypotenuse = new THREE.Line3(
			mapIntersect,
			this.gameState.raycaster.camera.position
		);
		const newModelIntersection = new THREE.Vector3();
		newHypotenuse.at(hypotenuseRatio, newModelIntersection);
		const newModelPosition = new THREE.Vector3();
		const mapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
		mapPlane.projectPoint(newModelIntersection, newModelPosition);
		selectedObject.position.copy(
			newModelPosition
		);

	};

	moveDone = (selectedMeshedModel: MeshedModel) => {
		this.gameState.renderRoot.removeEventListener("mousemove", this.mouseMoveListener);
		this.gameState.renderRoot.removeEventListener("mouseup", this.mouseUpListener);
		if (selectedMeshedModel) {
			selectedMeshedModel.positionedModel.lookAtX +=
				selectedMeshedModel.mesh.position.x -
				selectedMeshedModel.positionedModel.x;
			selectedMeshedModel.positionedModel.lookAtZ +=
				selectedMeshedModel.mesh.position.z -
				selectedMeshedModel.positionedModel.z;

			selectedMeshedModel.positionedModel.x = selectedMeshedModel.mesh.position.x;
			selectedMeshedModel.positionedModel.z = selectedMeshedModel.mesh.position.z;
			this.gameState.notifyPositionedModelUpdatedCallbacks(selectedMeshedModel.positionedModel);
		}
	};

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
