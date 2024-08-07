import * as THREE from "three";
import {GameController} from "./GameController";
import GameState from "../GameState";

export class MoveController implements GameController {

	private gameState: GameState;

	constructor(gameData: GameState) {
		this.gameState = gameData;
	}

	moveModel = () => {
		const selectedMeshedModel = this.gameState.selectedMeshedModel;
		if (!selectedMeshedModel) {
			return;
		}
		const mapIntersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
		if (mapIntersects.length === 0) {
			return;
		}
		const mapIntersect = mapIntersects[0].point;
		const origin = this.gameState.raycaster.camera.position;
		const hypotenuse = origin.distanceTo(mapIntersect);
		const theta = Math.asin(origin.y / hypotenuse);
		const newHypotenuseLength =
			this.gameState.intersectionPoint.y / Math.sin(theta);
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
		selectedMeshedModel.mesh.position.copy(
			newModelPosition
		);
	};

	moveDone = () => {
		const selectedMeshedModel = this.gameState.selectedMeshedModel;
		if (selectedMeshedModel) {
			selectedMeshedModel.positionedModel.lookAtX +=
				selectedMeshedModel.mesh.position.x -
				selectedMeshedModel.positionedModel.x;
			selectedMeshedModel.positionedModel.lookAtZ +=
				selectedMeshedModel.mesh.position.z -
				selectedMeshedModel.positionedModel.z;

			selectedMeshedModel.positionedModel.x = selectedMeshedModel.mesh.position.x;
			selectedMeshedModel.positionedModel.z = selectedMeshedModel.mesh.position.z;
		}
	};

	enable = () => {
		this.gameState.renderRoot.addEventListener("mousemove", this.moveModel);
		this.gameState.renderRoot.addEventListener("mouseup", this.moveDone);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameState.renderRoot.removeEventListener("mousemove", this.moveModel);
		this.gameState.renderRoot.removeEventListener("mouseup", this.moveDone);
	};
}
