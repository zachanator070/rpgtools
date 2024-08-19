import {SelectModelController} from "./controller/SelectModelController";
import {MoveController} from "./controller/MoveController";
import {RotateController} from "./controller/RotateController";
import {BRUSH_FOG, PaintController} from "./controller/PaintController";
import {DeleteController} from "./controller/DeleteController";
import {CameraController} from "./controller/CameraController";
import GameState, {
    CAMERA_CONTROLS,
    DELETE_CONTROLS,
    FOG_CONTROLS, HOTKEY_CONTROLS,
    MOVE_MODEL_CONTROLS,
    PAINT_CONTROLS,
    ROTATE_MODEL_CONTROLS, SCENE_CONTROLS,
    SELECT_MODEL_CONTROLS
} from "./GameState";
import SceneController from "./controller/SceneController";
import MapController from "./controller/MapController";
import {FogStroke, Place, PositionedModel, Stroke} from "../types";
import FogController from "./controller/FogController";
import {v4 as uuidv4} from "uuid";
import HotkeyController from "./controller/HotkeyController";


export default class GameControllerFacade {
    private _selectModelController: SelectModelController;
    private _moveController: MoveController;
    private _rotateController: RotateController;
    private _paintController: PaintController<Stroke>;
    private _deleteController: DeleteController;
    private _fogController: PaintController<FogStroke>;
    private _cameraController: CameraController;
    private _sceneController: SceneController;
    private _mapController: MapController;
    private _hotkeyController: HotkeyController;

    private _gameState: GameState;

    public constructor(gameData: GameState) {
        this._gameState = gameData;
        this.setupControllers();
        this._sceneController.enable();
        this._hotkeyController.enable();
        this.changeControls(this._gameState.currentControls);
    }

    tearDown() {
        Object.values(this._gameState.controllerMap).forEach((controller) => {
            controller.tearDown();
        });
    }

    setupControllers() {
        this._mapController = new MapController(this._gameState);
        this._sceneController = new SceneController(this._gameState);
        this._cameraController = new CameraController(this._gameState);

        this._paintController = new PaintController(
            this._gameState,
        );

        this._fogController = new FogController(
            this._gameState,
        );

        this._selectModelController = new SelectModelController(
            this._gameState
        );

        this._moveController = new MoveController(
            this._gameState,
        );

        this._rotateController = new RotateController(
            this._gameState,
        );

        this._deleteController = new DeleteController(
            this._gameState,
        );

        this._hotkeyController = new HotkeyController(this._gameState);

        this._gameState.controllerMap = {
            [CAMERA_CONTROLS]: this._cameraController,
            [PAINT_CONTROLS]: this._paintController,
            [MOVE_MODEL_CONTROLS]: this._moveController,
            [ROTATE_MODEL_CONTROLS]: this._rotateController,
            [DELETE_CONTROLS]: this._deleteController,
            [FOG_CONTROLS]: this._fogController,
            [SELECT_MODEL_CONTROLS]: this._selectModelController,
            [SCENE_CONTROLS]: this._sceneController,
            [HOTKEY_CONTROLS]: this._hotkeyController,
        };
    }

    // APIs used by react components

    changeControls = (mode: string) => {
        this._hotkeyController.changeControls(mode);
    }

    changeLocation(newLocation: Place, setFog: boolean) {
        this._mapController.setLocation(newLocation);
        this._paintController.resize(newLocation.mapImage.width, newLocation.mapImage.height, newLocation.pixelsPerFoot);
        this._fogController.resize(newLocation.mapImage.width, newLocation.mapImage.height, newLocation.pixelsPerFoot);
        if (setFog) {
            const newMaxSize = Math.max(newLocation.mapImage.height, newLocation.mapImage.width);
            this._fogController.stroke(
                {
                    _id: uuidv4(),
                    path:[
                        {
                            _id: uuidv4(),
                            x: Math.ceil(newMaxSize / newLocation.pixelsPerFoot / 2),
                            y: Math.ceil(newMaxSize / newLocation.pixelsPerFoot / 2)
                        },
                    ],
                    size: newMaxSize,
                    type: BRUSH_FOG
                },
                false
            );
        }
    }

    setDrawGrid(drawGrid: boolean) {
        this._mapController.setDrawGrid(drawGrid);
    }

    clearSelection() {
        this._selectModelController.clearSelection();
    }

    setBrushType(brushType: string) {
        this._paintController.setBrushType(brushType);
    }

    setBrushColor(color: string) {
        this._paintController.setBrushColor(color);
    }

    setBrushSize(size: number) {
        this._paintController.setBrushSize(size);
    }

    setBrushFill(fill: boolean) {
        this._paintController.setBrushFill(fill);
    }

    setFogBrushType(brushType: string) {
        this._fogController.setBrushType(brushType);
    }

    setFogBrushSize(size: number) {
        this._fogController.setBrushSize(size);
    }

    setFogOpacity(opacity: number) {
        this._fogController.setDrawMeshOpacity(opacity);
    }

    addPaintingFinishedCallback(callback: (stroke: Stroke) => any) {
        this._gameState.paintingFinishedCallbacks.push(callback);
    }

    addFogFinishedCallback(callback: (stroke: FogStroke) => any) {
        this._gameState.fogFinishedCallbacks.push(callback);
    }

    stroke(stroke: Stroke) {
        this._paintController.stroke(stroke);
    }

    fogStroke(stroke: FogStroke) {
        this._fogController.stroke(stroke);
    }

    addModel(positionedModel: PositionedModel) {
        this._sceneController.addModel(positionedModel);
    }

    removeModel(positionedModel: PositionedModel) {
        this._sceneController.removeModel(positionedModel);
    }

    addRemoveModelCallback(callback: ((model: PositionedModel) => any)) {
        this._gameState.addRemoveModelCallback(callback);
    }

    addChangeControlsCallback(callback: ((mode: string) => any)) {
        this._gameState.addChangeControlsCallback(callback);
    }

    addSelectedModelCallback(callback: (model: PositionedModel) => any) {
        this._gameState.addSelectModelCallback(callback);
    }

    addPositionedModelUpdatedCallback(callback: (model: PositionedModel) => any) {
        this._gameState.addPositionedModelUpdatedCallback(callback);
    }

    updateModel(positionedModel: PositionedModel) {
        this._sceneController.updateModel(positionedModel);
    }
}
