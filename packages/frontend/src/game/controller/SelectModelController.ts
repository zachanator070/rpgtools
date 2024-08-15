
import {GameController} from "./GameController";
import GameState from "../GameState";
import * as THREE from "three";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";

export class SelectModelController implements GameController {
	private gameData: GameState;
	private outlinePass: OutlinePass;
	constructor(gameData: GameState) {
		this.gameData = gameData;

		const renderPass = new RenderPass(this.gameData.scene, this.gameData.camera);
		this.gameData.composer.addPass(renderPass);

		this.outlinePass = new OutlinePass(new THREE.Vector2(this.gameData.renderRoot.width, this.gameData.renderRoot.height), this.gameData.scene, this.gameData.camera);
		this.gameData.composer.addPass(this.outlinePass);

		const outputPass = new OutputPass();
		this.gameData.composer.addPass(outputPass);

		const effectFXAA = new ShaderPass(FXAAShader);
		effectFXAA.uniforms['resolution'].value.set(1 / this.gameData.renderRoot.width, 1 / this.gameData.renderRoot.height);
		this.gameData.composer.addPass(effectFXAA);
	}

	selectModel = () => {
		this.removeGlow();
		const selectedMesh = this.gameData.getFirstMeshUnderMouse();
		if (!selectedMesh) {
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

	constructGlow = () => {
		if (!this.gameData.selectedMeshedModel) {
			return;
		}

		this.outlinePass.selectedObjects = [this.gameData.selectedMeshedModel.mesh];
	};

	removeGlow() {
		this.outlinePass.selectedObjects = [];
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
