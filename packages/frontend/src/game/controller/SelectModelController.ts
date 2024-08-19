
import {GameController} from "./GameController";
import GameState from "../GameState";
import * as THREE from "three";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";

export class SelectModelController implements GameController {
	private gameState: GameState;
	private outlinePass: OutlinePass;
	constructor(gameState: GameState) {
		this.gameState = gameState;

		const renderPass = new RenderPass(this.gameState.scene, this.gameState.camera);
		this.gameState.composer.addPass(renderPass);

		this.outlinePass = new OutlinePass(new THREE.Vector2(this.gameState.renderRoot.width, this.gameState.renderRoot.height), this.gameState.scene, this.gameState.camera);
		this.outlinePass.edgeThickness = 1;
		this.outlinePass.edgeStrength = 10;
		this.outlinePass.pulsePeriod = 0;
		this.outlinePass.usePatternTexture = false;
		this.gameState.composer.addPass(this.outlinePass);

		const outputPass = new OutputPass();
		this.gameState.composer.addPass(outputPass);

		const effectFXAA = new ShaderPass(FXAAShader);
		effectFXAA.uniforms['resolution'].value.set(1 / this.gameState.renderRoot.width, 1 / this.gameState.renderRoot.height);
		this.gameState.composer.addPass(effectFXAA);
	}

	selectModel = () => {
		this.removeGlow();
		const selectedMesh = this.gameState.getFirstMeshUnderMouse();
		if (!selectedMesh) {
			return;
		}

		for (let meshedModel of this.gameState.meshedModels) {
			if (meshedModel.mesh.id === selectedMesh.id) {
				this.gameState.selectedMeshedModel = meshedModel;
				break;
			}
		}
		this.constructGlow();
	};

	constructGlow = () => {
		if (!this.gameState.selectedMeshedModel) {
			return;
		}

		this.outlinePass.selectedObjects = [this.gameState.selectedMeshedModel.mesh];
	};

	removeGlow() {
		this.outlinePass.selectedObjects = [];
	}

	clearSelection = () => {
		this.gameState.selectedMeshedModel = null;
		this.removeGlow();
	};

	enable = () => {
		this.gameState.renderRoot.addEventListener("mousedown", this.selectModel);
	};

	disable = () => {
		this.clearSelection();
		this.tearDown();
	};

	tearDown = () => {
		this.gameState.renderRoot.removeEventListener("mousedown", this.selectModel);
	};
}
