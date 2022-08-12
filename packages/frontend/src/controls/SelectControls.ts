import {GameControls} from "./GameControls";
import {GameRenderer, MeshedModel} from "../rendering/GameRenderer";

export class SelectControls implements GameControls {
	private renderRoot: any;
	private raycaster: any;
	private renderer: GameRenderer;
	private selectedMeshedModel: MeshedModel;
	private intersectionPoint: any;

	constructor(renderRoot: any, raycaster: any, renderer: GameRenderer) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.renderer = renderer;

		this.selectedMeshedModel = null;
		this.intersectionPoint = null;
	}

	getAllChildren = (object) => {
		const children = [...object.children] || [];
		const returnChildren = [...children];
		for (let child of children) {
			returnChildren.push(...this.getAllChildren(child));
		}
		return returnChildren;
	};

	selectModel = () => {
		const allObjects = [];
		for (let model of this.renderer.getMeshedModels()) {
			allObjects.push(...this.getAllChildren(model.mesh));
			allObjects.push(model.mesh);
		}
		const intersects = this.raycaster.intersectObjects(allObjects);
		if (intersects.length === 0) {
			this.clearSelection();
			return;
		}
		let selectedMesh = intersects[0].object;
		while (selectedMesh.parent) {
			if (selectedMesh.parent.type === "Scene") {
				break;
			}
			selectedMesh = selectedMesh.parent;
		}
		for (let meshedModel of this.renderer.getMeshedModels()) {
			if (meshedModel.mesh.id === selectedMesh.id) {
				this.selectedMeshedModel = meshedModel;
				break;
			}
		}
		this.intersectionPoint = intersects[0].point;
	};

	clearSelection = () => {
		this.selectedMeshedModel = null;
		this.intersectionPoint = null;
	};

	enable = () => {
		this.renderRoot.addEventListener("mousedown", this.selectModel);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.renderRoot.removeEventListener("mousedown", this.selectModel);
		this.clearSelection();
	};

	getSelectedMeshedModel(): MeshedModel {
		return this.selectedMeshedModel;
	}

	getIntersectionPoint() {
		return this.intersectionPoint;
	}
}
