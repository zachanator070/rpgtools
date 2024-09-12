import * as THREE from "three";
import * as CANNON from 'cannon';
import {FogStroke, Game, Place, PositionedModel, Stroke} from "../types.js";
import {
    DirectionalLight,
    Mesh,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector2,
    WebGLRenderer
} from "three";
import {Object3D} from "three/src/core/Object3D";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {GameController} from "./controller/GameController.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import {PhysicsDie} from "./dice/PhysicsDie.js";

export const PAINT_CONTROLS = "Paint Controls";
export const FOG_CONTROLS = "Fog Controls";
export const SELECT_MODEL_CONTROLS = "Select Model Controls";
export const SELECT_LOCATION_CONTROLS = "Game Location";
export const ADD_MODEL_CONTROLS = "Add Model";
export const SCENE_CONTROLS = "Scene Controls";
export const HOTKEY_CONTROLS = "Hotkey Controls";
export const DICE_CONTROLS = 'Dice Controls';

export const MAP_Y_POSITION = 0;
export const DRAW_Y_POSITION = 0.05;
export const FOG_Y_POSITION = 0.3;
export const GROUND_Y_POSITION = -0.01;

export const DEFAULT_MAP_DRAW_GRID = false;

export interface MeshedModel {
    positionedModel: PositionedModel;
    mesh: any;
}

export interface BrushOptions {
    brushType: string;
    brushColor: string;
    brushFill: boolean;
    brushSize: number;
}

export default class GameState {

    // controllers
    private _controllerMap: { [key: string]: GameController };
    private _focusedElement: HTMLElement;

    // render
    private _currentGame: Game;
    private _renderer: THREE.WebGLRenderer;
    private _renderRoot: HTMLCanvasElement;
    private _composer: EffectComposer;

    // camera and lights
    private _camera: THREE.PerspectiveCamera;
    private _cameraControls: OrbitControls;
    private _scene: THREE.Scene;
    private _light: THREE.DirectionalLight;
    private _raycaster: THREE.Raycaster;
    private _mouseCoords: Vector2;

    // scene
    private _meshedModels: MeshedModel[] = [];
    private _originalMeshedModels: MeshedModel[] = [];

    private _positionedModelUpdatedCallbacks: ((model: PositionedModel) => any)[] = [];
    private _removeModelCallbacks: ((model: PositionedModel) => any)[] = [];

    // map
    private _mapMesh: THREE.Mesh;
    private _location: Place;

    private _currentControls = SELECT_MODEL_CONTROLS;
    private _changeControlsCallbacks: ((mode: string) => any)[] = [];

    // selected model
    private _selectModelCallbacks: ((model: PositionedModel) => any)[] = [];

    // painting
    private _paintingFinishedCallbacks: ((stroke: Stroke) => any)[] = [];

    // fog
    private _fogFinishedCallbacks: ((stroke: FogStroke) => any)[] = [];

    //physics
    public world: CANNON.World;
    public dice: PhysicsDie[] = [];
    private _rollFinishedCallbacks: (() => any)[] = [];

    get renderer(): WebGLRenderer {
        return this._renderer;
    }

    set renderer(value: WebGLRenderer) {
        this._renderer = value;
    }

    get camera(): PerspectiveCamera {
        return this._camera;
    }

    set camera(value: PerspectiveCamera) {
        this._camera = value;
    }

    get scene(): Scene {
        return this._scene;
    }

    set scene(value: Scene) {
        this._scene = value;
    }

    get light(): DirectionalLight {
        return this._light;
    }

    set light(value: DirectionalLight) {
        this._light = value;
    }

    get raycaster(): Raycaster {
        return this._raycaster;
    }

    set raycaster(value: Raycaster) {
        this._raycaster = value;
    }

    get meshedModels(): MeshedModel[] {
        return this._meshedModels;
    }

    set meshedModels(value: MeshedModel[]) {
        this._meshedModels = value;
    }

    get originalMeshedModels(): MeshedModel[] {
        return this._originalMeshedModels;
    }

    get mapMesh(): Mesh {
        return this._mapMesh;
    }

    set mapMesh(value: Mesh) {
        this._mapMesh = value;
    }

    get renderRoot(): HTMLCanvasElement {
        return this._renderRoot;
    }

    set renderRoot(value: HTMLCanvasElement) {
        this._renderRoot = value;
    }

    get mouseCoords(): Vector2 {
        return this._mouseCoords;
    }

    set mouseCoords(value: Vector2) {
        this._mouseCoords = value;
    }

    get currentControls(): string {
        return this._currentControls;
    }

    set currentControls(value: string) {
        this._currentControls = value;
        this.notifyChangesCallback(value);
    }

    get location(): Place {
        return this._location;
    }

    set location(value: Place) {
        this._location = value;
    }

    get currentGame(): Game {
        return this._currentGame;
    }

    set currentGame(value: Game) {
        this._currentGame = value;
    }


    get paintingFinishedCallbacks(): ((stroke: Stroke) => void)[] {
        return this._paintingFinishedCallbacks;
    }

    notifyPaintingFinishedCallbacks(stroke: Stroke): void {
        this._paintingFinishedCallbacks.forEach(callback => callback(stroke));
    }

    get fogFinishedCallbacks(): ((stroke: FogStroke) => void)[] {
        return this._fogFinishedCallbacks;
    }

    notifyFogFinishedCallbacks(fogStroke: FogStroke): void {
        this._fogFinishedCallbacks.forEach((callback) => callback(fogStroke));
    }

    addChangeControlsCallback(callback: ((mode: string) => any)) {
        this._changeControlsCallbacks.push(callback);
    }

    notifyChangesCallback(mode: string) {
        this._changeControlsCallbacks.forEach(callback => callback(mode));
    }

    addSelectModelCallback(callback: ((mode: PositionedModel) => any)) {
        this._selectModelCallbacks.push(callback);
    }

    notifySelectModelCallbacks(model: PositionedModel) {
        this._selectModelCallbacks.forEach(callback => callback(model));
    }

    getFirstMeshUnderMouse(): null | Object3D {
        const allObjects = [];
        for (const model of this.meshedModels) {
            if (model.mesh) {
                allObjects.push(...this.getAllChildren(model.mesh));
                allObjects.push(model.mesh);
            }
        }
        const intersects = this.raycaster.intersectObjects(allObjects);
        if (intersects.length === 0) {
            return;
        }
        let selectedMesh = intersects[0].object;
        while (selectedMesh.parent) {
            if (selectedMesh.parent.type === "Scene") {
                break;
            }
            selectedMesh = selectedMesh.parent;
        }
        return selectedMesh;
    }

    getAllChildren = (object: Object3D) => {
        const children = object?.children ? [...object.children] : [];
        const returnChildren = [...children];
        for (const child of children) {
            returnChildren.push(...this.getAllChildren(child));
        }
        return returnChildren;
    };

    addPositionedModelUpdatedCallback(callback: ((model: PositionedModel) => any)) {
        this._positionedModelUpdatedCallbacks.push(callback);
    }

    notifyPositionedModelUpdatedCallbacks(positionedModel: PositionedModel) {
        this._positionedModelUpdatedCallbacks.forEach((callback) => callback(positionedModel));
    }

    addRemoveModelCallback(callback: ((model: PositionedModel) => any)) {
        this._removeModelCallbacks.push(callback);
    }

    notifyRemoveModelCallback(positionedModel: PositionedModel) {
        this._removeModelCallbacks.forEach((callback) => callback(positionedModel));
    }

    addRollFinishedCallback(callback: (() => any)) {
        this._rollFinishedCallbacks.push(callback);
    }

    notifyRollFinishedCallback() {
        this._rollFinishedCallbacks.forEach((callback) => callback());
        this._rollFinishedCallbacks = [];
    }

    get composer(): EffectComposer {
        return this._composer;
    }

    set composer(value: EffectComposer) {
        this._composer = value;
    }

    get controllerMap(): { [p: string]: GameController } {
        return this._controllerMap;
    }

    set controllerMap(value: { [p: string]: GameController }) {
        this._controllerMap = value;
    }

    get cameraControls(): OrbitControls {
        return this._cameraControls;
    }

    set cameraControls(value: OrbitControls) {
        this._cameraControls = value;
    }

    get focusedElement(): HTMLElement {
        return this._focusedElement;
    }

    set focusedElement(value: HTMLElement) {
        this._focusedElement = value;
    }
}
