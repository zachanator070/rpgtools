import {GameController} from "./GameController.js";
import GameState, {MeshedModel} from "../GameState.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import * as THREE from "three";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";
import {Object3D} from "three/src/core/Object3D";
import {Vector3} from "three";
import {PositionedModel} from "../../types.js";

export default class ModelController implements GameController {

    private gameState: GameState;

    private outlinePass: OutlinePass;
    private mouseMoveListener: () => void;
    private mouseUpListener: () => void;
    private mouseDragging: boolean = false;
    private selectedMeshedModel: MeshedModel;

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

    enable = () => {
        this.gameState.cameraControls.enabled = true;
        this.gameState.renderRoot.addEventListener("mousedown", this.tryModelSelect);
        this.gameState.renderRoot.addEventListener("mousedown", this.setMouseDragging);
        this.gameState.renderRoot.addEventListener("mouseup", this.setMouseNotDragging);
        this.gameState.renderRoot.addEventListener("mousemove", this.enableCameraMove);
        this.gameState.renderRoot.addEventListener("contextmenu", this.disableContextMenu);
        window.addEventListener("keydown", this.deleteModelEvent, true);
    };

    disable = () => {
        this.selectModel(null);
        this.gameState.renderRoot.removeEventListener("mousedown", this.tryModelSelect);
        this.gameState.renderRoot.removeEventListener("mousedown", this.setMouseDragging);
        this.gameState.renderRoot.removeEventListener("mouseup", this.setMouseNotDragging);
        this.gameState.renderRoot.removeEventListener("mousemove", this.enableCameraMove);
        this.gameState.renderRoot.removeEventListener("contextmenu", this.disableContextMenu);
        window.removeEventListener("keydown", this.deleteModelEvent);
    };

    tearDown = () => {
    };

    setMouseDragging = () => {
        this.mouseDragging = true;
    }

    setMouseNotDragging = () => {
        this.mouseDragging = false;
    }

    disableContextMenu = (event: PointerEvent) => {
        event.preventDefault();
    }

    enableCameraMove = () => {
        if (!this.mouseDragging) {
            const selectedMesh = this.gameState.getFirstMeshUnderMouse();
            this.gameState.cameraControls.enabled = !selectedMesh;
        }
    }

    tryModelSelect = (event: MouseEvent) => {
        const selectedMesh = this.gameState.getFirstMeshUnderMouse();
        this.selectModel(selectedMesh);
        if (selectedMesh) {
            if (this.gameState.currentGame.canModel) {
                let selectedMeshedModel: MeshedModel;
                for (const meshedModel of this.gameState.meshedModels) {
                    if (meshedModel.mesh.id === selectedMesh.id) {
                        selectedMeshedModel = meshedModel;
                        break;
                    }
                }
                const objectIntersectionPoint = this.gameState.raycaster.intersectObject(selectedMesh)[0].point;
                // left mouse button will move model
                if (event.buttons === 1) {
                    this.mouseMoveListener = () => this.moveModel(selectedMesh, objectIntersectionPoint);
                    this.gameState.renderRoot.addEventListener("mousemove", this.mouseMoveListener);
                    this.mouseUpListener = () => this.moveDone(selectedMeshedModel);
                    this.gameState.renderRoot.addEventListener("mouseup", this.mouseUpListener);
                    // right mouse button will rotate model
                } else if (event.buttons === 2) {
                    this.mouseMoveListener = () => this.rotateModel(selectedMeshedModel);
                    this.gameState.renderRoot.addEventListener("mousemove", this.mouseMoveListener);
                    this.mouseUpListener = () => this.rotateDone(selectedMeshedModel);
                    this.gameState.renderRoot.addEventListener("mouseup", this.mouseUpListener);
                }
            }


        }
    }

    selectModel = (selectedMesh: Object3D) => {
        this.removeGlow();
        this.selectedMeshedModel = null;

        for (const meshedModel of this.gameState.meshedModels) {
            if (meshedModel.mesh.id === selectedMesh?.id) {
                this.selectedMeshedModel = meshedModel;
                break;
            }
        }
        if (this.selectedMeshedModel){
            this.constructGlow();
        }
        this.gameState.notifySelectModelCallbacks(this.selectedMeshedModel?.positionedModel);
    };

    constructGlow = () => {
        if (!this.selectedMeshedModel) {
            return;
        }

        this.outlinePass.selectedObjects = [this.selectedMeshedModel.mesh];
    };

    removeGlow() {
        this.outlinePass.selectedObjects = [];
    }

    moveModel = (selectedObject: Object3D, objectIntersectionPoint: Vector3) => {

        const mapIntersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
        if (mapIntersects.length === 0) {
            return;
        }
        const mapIntersect = mapIntersects[0].point;
        const origin = this.gameState.raycaster.camera.position;
        const hypotenuse = origin.distanceTo(mapIntersect);
        const theta = Math.asin(origin.y / hypotenuse);
        const newHypotenuseLength =
            objectIntersectionPoint.y / Math.sin(theta);
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
        selectedObject.position.copy(
            newModelPosition
        );

    };

    moveDone = (selectedMeshedModel: MeshedModel) => {
        this.gameState.renderRoot.removeEventListener("mousemove", this.mouseMoveListener);
        this.gameState.renderRoot.removeEventListener("mouseup", this.mouseUpListener);
        if (selectedMeshedModel) {
            selectedMeshedModel.positionedModel.lookAtX +=
                selectedMeshedModel.mesh.position.x -
                selectedMeshedModel.positionedModel.x;
            selectedMeshedModel.positionedModel.lookAtZ +=
                selectedMeshedModel.mesh.position.z -
                selectedMeshedModel.positionedModel.z;

            selectedMeshedModel.positionedModel.x = selectedMeshedModel.mesh.position.x;
            selectedMeshedModel.positionedModel.z = selectedMeshedModel.mesh.position.z;
            this.gameState.notifyPositionedModelUpdatedCallbacks(selectedMeshedModel.positionedModel);
        }
    };

    rotateModel = (selectedMeshedModel: MeshedModel) => {
        if (!selectedMeshedModel) {
            return;
        }
        const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
        if (intersects.length === 0) {
            return;
        }
        const mapIntersect = intersects[0].point;
        selectedMeshedModel.mesh.lookAt(mapIntersect);
        selectedMeshedModel.positionedModel.lookAtX =
            mapIntersect.x;
        selectedMeshedModel.positionedModel.lookAtZ =
            mapIntersect.z;
    };

    rotateDone = (selectedMeshedModel: MeshedModel) => {
        this.gameState.renderRoot.removeEventListener("mousemove", this.mouseMoveListener);
        this.gameState.renderRoot.removeEventListener("mouseup", this.mouseUpListener);
        this.gameState.notifyPositionedModelUpdatedCallbacks(selectedMeshedModel.positionedModel);
    }

    deleteModelEvent = (event: KeyboardEvent) => {
        if (this.gameState.renderRoot !== this.gameState.focusedElement) {
            return;
        }
        if (event.key === 'Delete' && this.selectedMeshedModel) {
            this.gameState.notifyRemoveModelCallback(this.selectedMeshedModel.positionedModel);
        }
    };

}