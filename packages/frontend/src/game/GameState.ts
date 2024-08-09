import * as THREE from "three";
import {FogStroke, Game, PathNode, Place, PositionedModel, Stroke} from "../types";
import {
    BufferGeometry,
    CanvasTexture,
    DirectionalLight, Fog, Material,
    Mesh, MeshPhongMaterial, Object3DEventMap,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Texture,
    Vector2,
    Vector3,
    WebGLRenderer
} from "three";
import {
    DEFAULT_BRUSH_COLOR,
    DEFAULT_BRUSH_FILL,
    DEFAULT_BRUSH_SIZE,
    DEFAULT_BRUSH_TYPE
} from "./controller/PaintController";

export const CAMERA_CONTROLS = "Camera Controls";
export const PAINT_CONTROLS = "Paint Controls";
export const MOVE_MODEL_CONTROLS = "Move Model Controls";
export const ROTATE_MODEL_CONTROLS = "Rotate Model Controls";
export const DELETE_CONTROLS = "Delete Controls";
export const FOG_CONTROLS = "Fog Controls";
export const SELECT_MODEL_CONTROLS = "Select Model Controls";
export const SELECT_LOCATION_CONTROLS = "Game Location";
export const ADD_MODEL_CONTROLS = "Add Model";

export const MAP_Y_POSITION = 0;
export const DRAW_Y_POSITION = 0.05;
export const FOG_Y_POSITION = 0.1;
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
    private _currentGame: Game;
    private _renderer: THREE.WebGLRenderer;
    private _renderRoot: HTMLCanvasElement;

    // camera and lights
    private _camera: THREE.PerspectiveCamera;
    private _scene: THREE.Scene;
    private _light: THREE.DirectionalLight;
    private _raycaster: THREE.Raycaster;
    private _mouseCoords: Vector2;

    // scene
    private _meshedModels: MeshedModel[] = [];
    private _originalMeshedModels: MeshedModel[] = [];

    // map
    private _mapMesh: THREE.Mesh;
    private _groundMesh: THREE.Mesh;
    private _mapCanvas: HTMLCanvasElement;
    private _mapTexture: THREE.Texture;
    private _drawGrid: boolean = DEFAULT_MAP_DRAW_GRID;
    private _location: Place;

    private _currentControls = CAMERA_CONTROLS;
    private _changeControlsCallbacks: ((mode: string) => any)[] = [];

    // selected model
    private _selectedMeshedModel: MeshedModel;
    private _intersectionPoint: Vector3;
    private _glow: Mesh;

    // painting
    private _paintCanvas: HTMLCanvasElement;
    private _paintTexture: THREE.CanvasTexture;
    private _paintMaterial: THREE.Material;
    private _paintMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material, THREE.Object3DEventMap>;
    private _pathBeingPainted: PathNode[] = [];
    private _paintStrokeBeingDrawnId: string = null;
    private _paintBrushOptions: BrushOptions = {
        brushType: DEFAULT_BRUSH_TYPE,
        brushColor: DEFAULT_BRUSH_COLOR,
        brushFill: DEFAULT_BRUSH_FILL,
        brushSize: DEFAULT_BRUSH_SIZE
    };
    private _paintStrokesAlreadyDrawn: { [ket: string]: Stroke } = {};
    private _paintBrushMesh: THREE.Mesh = null;
    private _paintBrushMaterial: THREE.Material = null;
    private _paintingFinishedCallbacks: ((stroke: Stroke) => any)[] = [];

    // fog
    private _fogCanvas: HTMLCanvasElement;
    private _fogTexture: THREE.CanvasTexture;
    private _fogMaterial: THREE.MeshPhongMaterial;
    private _fogMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material, THREE.Object3DEventMap>;
    private _fogPathBeingDrawn: PathNode[] = [];
    private _fogStrokeBeingDrawnId: string = null;
    private _fogBrushOptions: BrushOptions = {
        brushType: DEFAULT_BRUSH_TYPE,
        brushColor: DEFAULT_BRUSH_COLOR,
        brushFill: DEFAULT_BRUSH_FILL,
        brushSize: DEFAULT_BRUSH_SIZE
    };
    private _fogAlreadyDrawn: { [ket: string]: FogStroke } = {};
    private _fogBrushMesh: THREE.Mesh = null;
    private _fogBrushMaterial: THREE.Material = null;
    private _fogFinishedCallbacks: ((stroke: FogStroke) => any)[] = [];

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

    set originalMeshedModels(value: MeshedModel[]) {
        this._originalMeshedModels = value;
    }

    get mapMesh(): Mesh {
        return this._mapMesh;
    }

    set mapMesh(value: Mesh) {
        this._mapMesh = value;
    }

    get groundMesh(): Mesh {
        return this._groundMesh;
    }

    set groundMesh(value: Mesh) {
        this._groundMesh = value;
    }

    get mapCanvas(): HTMLCanvasElement {
        return this._mapCanvas;
    }

    set mapCanvas(value: HTMLCanvasElement) {
        this._mapCanvas = value;
    }

    get mapTexture(): Texture {
        return this._mapTexture;
    }

    set mapTexture(value: Texture) {
        this._mapTexture = value;
    }

    get renderRoot(): HTMLCanvasElement {
        return this._renderRoot;
    }

    set renderRoot(value: HTMLCanvasElement) {
        this._renderRoot = value;
    }

    get drawGrid(): boolean {
        return this._drawGrid;
    }

    set drawGrid(value: boolean) {
        this._drawGrid = value;
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

    get selectedMeshedModel(): MeshedModel {
        return this._selectedMeshedModel;
    }

    set selectedMeshedModel(value: MeshedModel) {
        this._selectedMeshedModel = value;
    }

    get intersectionPoint(): Vector3 {
        return this._intersectionPoint;
    }

    set intersectionPoint(value: Vector3) {
        this._intersectionPoint = value;
    }

    get glow(): Mesh {
        return this._glow;
    }

    set glow(value: Mesh) {
        this._glow = value;
    }


    get location(): Place {
        return this._location;
    }

    set location(value: Place) {
        this._location = value;
    }

    get paintCanvas(): HTMLCanvasElement {
        return this._paintCanvas;
    }

    set paintCanvas(value: HTMLCanvasElement) {
        this._paintCanvas = value;
    }

    get paintTexture(): CanvasTexture {
        return this._paintTexture;
    }

    set paintTexture(value: CanvasTexture) {
        this._paintTexture = value;
    }

    get paintMaterial(): THREE.Material {
        return this._paintMaterial;
    }

    set paintMaterial(value: THREE.Material) {
        this._paintMaterial = value;
    }

    get paintMesh(): Mesh<BufferGeometry, Material, Object3DEventMap> {
        return this._paintMesh;
    }

    set paintMesh(value: Mesh<BufferGeometry, Material, Object3DEventMap>) {
        this._paintMesh = value;
    }

    get pathBeingPainted(): PathNode[] {
        return this._pathBeingPainted;
    }

    set pathBeingPainted(value: PathNode[]) {
        this._pathBeingPainted = value;
    }

    get paintBrushOptions(): BrushOptions {
        return this._paintBrushOptions;
    }

    get paintBrushMesh(): any {
        return this._paintBrushMesh;
    }

    set paintBrushMesh(value: any) {
        this._paintBrushMesh = value;
    }

    get paintBrushMaterial(): any {
        return this._paintBrushMaterial;
    }

    set paintBrushMaterial(value: any) {
        this._paintBrushMaterial = value;
    }

    get paintStrokeBeingDrawnId(): string {
        return this._paintStrokeBeingDrawnId;
    }

    set paintStrokeBeingDrawnId(value: string) {
        this._paintStrokeBeingDrawnId = value;
    }

    get currentGame(): Game {
        return this._currentGame;
    }

    set currentGame(value: Game) {
        this._currentGame = value;
    }


    get fogCanvas(): HTMLCanvasElement {
        return this._fogCanvas;
    }

    set fogCanvas(value: HTMLCanvasElement) {
        this._fogCanvas = value;
    }

    get fogTexture(): CanvasTexture {
        return this._fogTexture;
    }

    set fogTexture(value: CanvasTexture) {
        this._fogTexture = value;
    }

    get fogMaterial(): MeshPhongMaterial {
        return this._fogMaterial;
    }

    set fogMaterial(value: MeshPhongMaterial) {
        this._fogMaterial = value;
    }

    get fogMesh(): Mesh<BufferGeometry, Material, Object3DEventMap> {
        return this._fogMesh;
    }

    set fogMesh(value: Mesh<BufferGeometry, Material, Object3DEventMap>) {
        this._fogMesh = value;
    }

    get fogPathBeingDrawn(): PathNode[] {
        return this._fogPathBeingDrawn;
    }

    set fogPathBeingDrawn(value: PathNode[]) {
        this._fogPathBeingDrawn = value;
    }

    get fogStrokeBeingDrawnId(): string {
        return this._fogStrokeBeingDrawnId;
    }

    set fogStrokeBeingDrawnId(value: string) {
        this._fogStrokeBeingDrawnId = value;
    }

    get fogBrushOptions(): BrushOptions {
        return this._fogBrushOptions;
    }

    set fogBrushOptions(value: BrushOptions) {
        this._fogBrushOptions = value;
    }

    get fogBrushMesh(): Mesh {
        return this._fogBrushMesh;
    }

    set fogBrushMesh(value: Mesh) {
        this._fogBrushMesh = value;
    }

    get fogBrushMaterial(): Material {
        return this._fogBrushMaterial;
    }

    set fogBrushMaterial(value: Material) {
        this._fogBrushMaterial = value;
    }


    get paintStrokesAlreadyDrawn(): { [p: string]: Stroke } {
        return this._paintStrokesAlreadyDrawn;
    }

    get paintingFinishedCallbacks(): ((stroke: Stroke) => void)[] {
        return this._paintingFinishedCallbacks;
    }

    notifyPaintingFinishedCallbacks(stroke: Stroke): void {
        this._paintingFinishedCallbacks.forEach(callback => callback(stroke));
    }

    get fogAlreadyDrawn(): { [p: string]: FogStroke } {
        return this._fogAlreadyDrawn;
    }

    notifyFogFinishedCallbacks(fogStroke: FogStroke): void {
        this._fogFinishedCallbacks.forEach((callback) => callback(fogStroke));
    }

    get fogFinishedCallbacks(): ((stroke: FogStroke) => void)[] {
        return this._fogFinishedCallbacks;
    }

    addChangeControlsCallback(callback: ((mode: string) => any)) {
        this._changeControlsCallbacks.push(callback);
    }

    notifyChangesCallback(mode: string) {
        this._changeControlsCallbacks.forEach(callback => callback(mode));
    }
}
