import * as THREE from "three";
import {GameController} from "./GameController";
import GameData from "../GameData";

export class MoveController implements GameController {

	private gameData: GameData;

	constructor(gameData: GameData) {
		this.gameData = gameData;
	}

	moveModel = () => {
		const selectedMeshedModel = this.gameData.selectedMeshedModel;
		if (!selectedMeshedModel) {
			return;
		}
		const mapIntersects = this.gameData.raycaster.intersectObject(this.gameData.mapMesh);
		if (mapIntersects.length === 0) {
			return;
		}
		const mapIntersect = mapIntersects[0].point;
		const origin = this.gameData.raycaster.camera.position;
		const hypotenuse = origin.distanceTo(mapIntersect);
		const theta = Math.asin(origin.y / hypotenuse);
		const newHypotenuseLength =
			this.gameData.intersectionPoint.y / Math.sin(theta);
		const hypotenuseRatio = newHypotenuseLength / hypotenuse;
		const newHypotenuse = new THREE.Line3(
			mapIntersect,
			this.gameData.raycaster.camera.position
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
		const selectedMeshedModel = this.gameData.selectedMeshedModel;
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
		this.gameData.renderRoot.addEventListener("mousemove", this.moveModel);
		this.gameData.renderRoot.addEventListener("mouseup", this.moveDone);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameData.renderRoot.removeEventListener("mousemove", this.moveModel);
		this.gameData.renderRoot.removeEventListener("mouseup", this.moveDone);
	};
}
