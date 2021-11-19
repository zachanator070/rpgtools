import * as THREE from "three";
import {GameControls} from "./GameControls";
import {SelectControls} from "./SelectControls";

export class MoveControls implements GameControls {

	private renderRoot: any;
	private raycaster: any;
	private mapMesh: any;
	private selectControls: SelectControls;
	private moveCallback: any;

	constructor(renderRoot, raycaster, mapMesh, selectControls, moveCallback) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.mapMesh = mapMesh;
		this.selectControls = selectControls;
		this.moveCallback = moveCallback;
	}

	moveModel = () => {
		const selectedMeshedModel = this.selectControls.getSelectedMeshedModel();
		if (!selectedMeshedModel) {
			return;
		}
		const mapIntersects = this.raycaster.intersectObject(this.mapMesh);
		if (mapIntersects.length === 0) {
			return;
		}
		const mapIntersect = mapIntersects[0].point;
		const origin = this.raycaster.camera.position;
		const hypotenuse = origin.distanceTo(mapIntersect);
		const theta = Math.asin(origin.y / hypotenuse);
		const newHypotenuseLength =
			this.selectControls.getIntersectionPoint().y / Math.sin(theta);
		const hypotenuseRatio = newHypotenuseLength / hypotenuse;
		const newHypotenuse = new THREE.Line3(
			mapIntersect,
			this.raycaster.camera.position
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
		const selectedMeshedModel = this.selectControls.getSelectedMeshedModel();
		if (selectedMeshedModel) {
			selectedMeshedModel.positionedModel.lookAtX +=
				selectedMeshedModel.mesh.position.x -
				selectedMeshedModel.positionedModel.x;
			selectedMeshedModel.positionedModel.lookAtZ +=
				selectedMeshedModel.mesh.position.z -
				selectedMeshedModel.positionedModel.z;

			selectedMeshedModel.positionedModel.x = selectedMeshedModel.mesh.position.x;
			selectedMeshedModel.positionedModel.z = selectedMeshedModel.mesh.position.z;

			this.moveCallback(selectedMeshedModel);
		}
		this.selectControls.clearSelection();
	};

	enable = () => {
		this.selectControls.enable();
		this.renderRoot.addEventListener("mousemove", this.moveModel);
		this.renderRoot.addEventListener("mouseup", this.moveDone);
	};

	disable = () => {
		this.selectControls.disable();
		this.tearDown();
	};

	tearDown = () => {
		this.selectControls.tearDown();
		this.renderRoot.removeEventListener("mousemove", this.moveModel);
		this.renderRoot.removeEventListener("mouseup", this.moveDone);
	};
}
