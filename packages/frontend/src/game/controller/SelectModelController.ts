
import {GameController} from "./GameController";
import GameState from "../GameState";
import {Material, MeshBasicMaterial, Vector3} from "three";
import * as THREE from "three";

export class SelectModelController implements GameController {
	private gameData: GameState;

	constructor(gameData: GameState) {
		this.gameData = gameData;
	}

	selectModel = () => {

		const selectedMesh = this.gameData.getFirstMeshUnderMouse();
		if (!selectedMesh) {
			this.removeGlow();
			return;
		}

		for (let meshedModel of this.gameData.meshedModels) {
			if (meshedModel.mesh.id === selectedMesh.id) {
				this.gameData.selectedMeshedModel = meshedModel;
				break;
			}
		}
		this.constructGlow();
	};

	constructGlow = (moveOnly = false) => {
		this.removeGlow();
		if (!this.gameData.selectedMeshedModel) {
			return;
		}

		this.gameData.scene.remove(this.gameData.glow);
		const basicMaterial = new MeshBasicMaterial({
			color: new THREE.Color(0xffff00),
			transparent: true,
			opacity: 0.5,
		});
		let boxGeometry = new THREE.BoxGeometry(
			this.gameData.selectedMeshedModel.positionedModel.model.width,
			this.gameData.selectedMeshedModel.positionedModel.model.height,
			this.gameData.selectedMeshedModel.positionedModel.model.depth,
			2,
			2,
			2
		);
		this.gameData.glow = new THREE.Mesh(boxGeometry, basicMaterial);
		this.gameData.scene.add(this.gameData.glow);

		const boxHeight = this.gameData.selectedMeshedModel.positionedModel.model.height;

		this.gameData.glow.position.set(
			this.gameData.selectedMeshedModel.mesh.position.x,
			0,
			this.gameData.selectedMeshedModel.mesh.position.z
		);
		this.gameData.glow.lookAt(
			new Vector3(
				this.gameData.selectedMeshedModel.positionedModel.lookAtX,
				0,
				this.gameData.selectedMeshedModel.positionedModel.lookAtZ
			)
		);
		this.gameData.glow.position.set(
			this.gameData.selectedMeshedModel.mesh.position.x,
			boxHeight / 2 + 0.03,
			this.gameData.selectedMeshedModel.mesh.position.z
		);
		if (!moveOnly) {
			this.gameData.glow.visible = true;
		}
		(this.gameData.glow.material as Material).needsUpdate = true;
	};

	removeGlow() {
		this.gameData.scene.remove(this.gameData.glow);
	}

	clearSelection = () => {
		this.gameData.selectedMeshedModel = null;
		this.removeGlow();
	};

	enable = () => {
		this.gameData.renderRoot.addEventListener("mousedown", this.selectModel);
	};

	disable = () => {
		this.clearSelection();
		this.tearDown();
	};

	tearDown = () => {
		this.gameData.renderRoot.removeEventListener("mousedown", this.selectModel);
	};
}
