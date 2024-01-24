import * as THREE from "three";
import { MeshBasicMaterial, Vector3 } from "three";
import EventEmitter from "events";
import { GameControls } from "./GameControls";
import { PositionedModel } from "../types";
import { SelectControls } from "./SelectControls";

export const MODEL_SELECTED_EVENT = "model selected";

export class SelectModelControls extends EventEmitter implements GameControls {
	private renderRoot: HTMLCanvasElement;
	private camera: THREE.Camera;
	private scene: THREE.Scene;
	selectControls: SelectControls;
	private selectedPositionedModel: PositionedModel;
	private glow: THREE.Mesh;

	constructor(renderRoot, camera, scene, selectControls) {
		super();
		this.renderRoot = renderRoot;
		this.camera = camera;
		this.scene = scene;
		this.selectControls = selectControls;
		this.selectedPositionedModel = null;
	}

	constructGlow = (moveOnly = false) => {
		if (!this.selectControls.getSelectedMeshedModel()) {
			if (this.glow) {
				this.glow.visible = false;
			}
			return;
		}

		this.scene.remove(this.glow);
		const basicMaterial = new MeshBasicMaterial({
			color: new THREE.Color(0xffff00),
			transparent: true,
			opacity: 0.5,
		});
		const boxGeometry = new THREE.BoxGeometry(
			this.selectControls.getSelectedMeshedModel().positionedModel.model.width,
			this.selectControls.getSelectedMeshedModel().positionedModel.model.height,
			this.selectControls.getSelectedMeshedModel().positionedModel.model.depth,
			2,
			2,
			2,
		);
		this.glow = new THREE.Mesh(boxGeometry, basicMaterial);
		this.scene.add(this.glow);

		const boxHeight = this.selectControls.getSelectedMeshedModel().positionedModel.model.height;

		this.glow.position.set(
			this.selectControls.getSelectedMeshedModel().mesh.position.x,
			0,
			this.selectControls.getSelectedMeshedModel().mesh.position.z,
		);
		this.glow.lookAt(
			new Vector3(
				this.selectControls.getSelectedMeshedModel().positionedModel.lookAtX,
				0,
				this.selectControls.getSelectedMeshedModel().positionedModel.lookAtZ,
			),
		);
		this.glow.position.set(
			this.selectControls.getSelectedMeshedModel().mesh.position.x,
			boxHeight / 2 + 0.03,
			this.selectControls.getSelectedMeshedModel().mesh.position.z,
		);
		if (!moveOnly) {
			this.glow.visible = true;
		}
		this.glow.needsUpdate = true;
	};

	getPositionedModel = () => {
		if (this.selectControls && this.selectControls.getSelectedMeshedModel()) {
			return this.selectControls.getSelectedMeshedModel().positionedModel;
		}
	};

	select = async () => {
		this.constructGlow();
		this.emit(
			MODEL_SELECTED_EVENT,
			this.selectControls.getSelectedMeshedModel()
				? this.selectControls.getSelectedMeshedModel().positionedModel
				: null,
		);
	};

	enable = () => {
		this.selectControls.enable();
		this.renderRoot.addEventListener("mousedown", this.select);
	};

	disable = () => {
		this.selectControls.disable();
		this.tearDown();
	};

	tearDown = () => {
		this.selectControls.tearDown();
		if (this.glow) {
			this.glow.visible = false;
		}
		this.renderRoot.removeEventListener("mousedown", this.select);
	};
}
