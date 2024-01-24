import { GameControls } from "./GameControls";
import { SelectControls } from "./SelectControls";
import THREE from "three";
import { MeshedModel } from "../rendering/GameRenderer";

export class RotateControls implements GameControls {
	private renderRoot: HTMLCanvasElement;
	private selectControls: SelectControls;
	private raycaster: THREE.Raycaster;
	private mapMesh: THREE.Mesh;
	private rotateCallback: (subject: MeshedModel) => void;

	constructor(renderRoot, raycaster, mapMesh, selectControls, rotateCallback) {
		this.renderRoot = renderRoot;
		this.selectControls = selectControls;
		this.raycaster = raycaster;
		this.mapMesh = mapMesh;
		this.rotateCallback = rotateCallback;
	}

	rotateModel = () => {
		if (!this.selectControls.getSelectedMeshedModel()) {
			return;
		}
		const intersects = this.raycaster.intersectObject(this.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const mapIntersect = intersects[0].point;
		this.selectControls.getSelectedMeshedModel().mesh.lookAt(mapIntersect);
		this.selectControls.getSelectedMeshedModel().positionedModel.lookAtX = mapIntersect.x;
		this.selectControls.getSelectedMeshedModel().positionedModel.lookAtZ = mapIntersect.z;
	};

	rotateDone = () => {
		if (this.selectControls.getSelectedMeshedModel()) {
			this.rotateCallback(this.selectControls.getSelectedMeshedModel());
		}
		this.selectControls.clearSelection();
	};

	enable = () => {
		this.selectControls.enable();
		this.renderRoot.addEventListener("mousemove", this.rotateModel);
		this.renderRoot.addEventListener("mouseup", this.rotateDone);
	};

	disable = () => {
		this.tearDown();
		this.selectControls.disable();
	};

	tearDown = () => {
		this.selectControls.tearDown();
		this.renderRoot.removeEventListener("mousemove", this.rotateModel);
		this.renderRoot.removeEventListener("mouseup", this.rotateDone);
	};
}
