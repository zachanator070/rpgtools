
import {GameController} from "./GameController";
import GameData from "../GameData";
import {Material, MeshBasicMaterial, Vector3} from "three";
import * as THREE from "three";

export class SelectModelController implements GameController {
	private gameData: GameData;

	constructor(gameData: GameData) {
		this.gameData = gameData;
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
		for (let model of this.gameData.meshedModels) {
			allObjects.push(...this.getAllChildren(model.mesh));
			allObjects.push(model.mesh);
		}
		const intersects = this.gameData.raycaster.intersectObjects(allObjects);
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
		for (let meshedModel of this.gameData.meshedModels) {
			if (meshedModel.mesh.id === selectedMesh.id) {
				this.gameData.selectedMeshedModel = meshedModel;
				break;
			}
		}
		this.gameData.intersectionPoint = intersects[0].point;
	};

	constructGlow = (moveOnly = false) => {
		if (!this.gameData.selectedMeshedModel) {
			if (this.gameData.glow) {
				this.gameData.glow.visible = false;
			}
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

	clearSelection = () => {
		this.gameData.selectedMeshedModel = null;
		this.gameData.intersectionPoint = null;
	};

	enable = () => {
		this.gameData.renderRoot.addEventListener("mousedown", this.selectModel);
	};

	disable = () => {
		this.tearDown();
	};

	tearDown = () => {
		this.gameData.renderRoot.removeEventListener("mousedown", this.selectModel);
	};
}
