import * as THREE from "three";
import {Game, Image, Place, PositionedModel} from "../types";
import {
    BufferGeometry,
    CanvasTexture,
    DirectionalLight, Material,
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
import {Subject} from "rxjs";

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

export interface MeshedModel {
    positionedModel: PositionedModel;
    mesh: any;
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
    private _mapImage: Image;
    private _pixelsPerFoot: number;
    private _drawGrid: boolean = false;
    private _location: Place;

    private _currentControls = CAMERA_CONTROLS;
    private _currentControlsSubject = new Subject();

    // selected model
    private _selectedMeshedModel: MeshedModel;
    private _intersectionPoint: Vector3;
    private _glow: Mesh;

    // painting
    private _drawCanvas: HTMLCanvasElement;
    private _drawTexture: THREE.CanvasTexture;
    private _drawMaterial: THREE.MeshPhongMaterial;
    private _drawMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material, THREE.Object3DEventMap>;
    private _drawMeshOpacity: number;
    private _pathBeingPainted: any[];
    private _strokeId: any;
    private _brushType: string = DEFAULT_BRUSH_TYPE;
    private _brushColor: string = DEFAULT_BRUSH_COLOR;
    private _brushFill: boolean = DEFAULT_BRUSH_FILL;
    private _brushSize: number = DEFAULT_BRUSH_SIZE;
    private _strokesAlreadyDrawn: any[];
    private _paintBrushMesh: any;
    private _paintBrushMaterial: any;

    // fog


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

    get mapImage(): Image {
        return this._mapImage;
    }

    set mapImage(value: Image) {
        this._mapImage = value;
    }

    get pixelsPerFoot(): number {
        return this._pixelsPerFoot;
    }

    set pixelsPerFoot(value: number) {
        this._pixelsPerFoot = value;
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

    get drawCanvas(): HTMLCanvasElement {
        return this._drawCanvas;
    }

    set drawCanvas(value: HTMLCanvasElement) {
        this._drawCanvas = value;
    }

    get drawTexture(): CanvasTexture {
        return this._drawTexture;
    }

    set drawTexture(value: CanvasTexture) {
        this._drawTexture = value;
    }

    get drawMaterial(): MeshPhongMaterial {
        return this._drawMaterial;
    }

    set drawMaterial(value: MeshPhongMaterial) {
        this._drawMaterial = value;
    }

    get drawMesh(): Mesh<BufferGeometry, Material, Object3DEventMap> {
        return this._drawMesh;
    }

    set drawMesh(value: Mesh<BufferGeometry, Material, Object3DEventMap>) {
        this._drawMesh = value;
    }

    get drawMeshOpacity(): number {
        return this._drawMeshOpacity;
    }

    set drawMeshOpacity(value: number) {
        this._drawMeshOpacity = value;
    }

    get pathBeingPainted(): any[] {
        return this._pathBeingPainted;
    }

    set pathBeingPainted(value: any[]) {
        this._pathBeingPainted = value;
    }

    get strokeId(): any {
        return this._strokeId;
    }

    set strokeId(value: any) {
        this._strokeId = value;
    }

    get brushType(): string {
        return this._brushType;
    }

    set brushType(value: string) {
        this._brushType = value;
    }

    get brushColor(): string {
        return this._brushColor;
    }

    set brushColor(value: string) {
        this._brushColor = value;
    }

    get brushFill(): boolean {
        return this._brushFill;
    }

    set brushFill(value: boolean) {
        this._brushFill = value;
    }

    get brushSize(): number {
        return this._brushSize;
    }

    set brushSize(value: number) {
        this._brushSize = value;
    }

    get strokesAlreadyDrawn(): any[] {
        return this._strokesAlreadyDrawn;
    }

    set strokesAlreadyDrawn(value: any[]) {
        this._strokesAlreadyDrawn = value;
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

    get currentGame(): Game {
        return this._currentGame;
    }

    set currentGame(value: Game) {
        this._currentGame = value;
    }

    get currentControlsSubject(): Subject<unknown> {
        return this._currentControlsSubject;
    }

    set currentControlsSubject(value: Subject<unknown>) {
        this._currentControlsSubject = value;
    }
}