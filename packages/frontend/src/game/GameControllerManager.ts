import {SelectModelController} from "./controller/SelectModelController";
import {MoveController} from "./controller/MoveController";
import {RotateController} from "./controller/RotateController";
import {PaintController} from "./controller/PaintController";
import {DeleteController} from "./controller/DeleteController";
import {CameraController} from "./controller/CameraController";
import GameState, {
    ADD_MODEL_CONTROLS,
    CAMERA_CONTROLS, DELETE_CONTROLS,
    FOG_CONTROLS,
    MOVE_MODEL_CONTROLS,
    PAINT_CONTROLS, ROTATE_MODEL_CONTROLS, SELECT_LOCATION_CONTROLS, SELECT_MODEL_CONTROLS
} from "./GameState";
import SceneController from "./controller/SceneController";
import MapController from "./controller/MapController";
import {FogStroke, Place, PositionedModel, Stroke} from "../types";
import FogController from "./controller/FogController";
import {GameController} from "./controller/GameController";


export default class GameControllerManager {
    private _selectModelController: SelectModelController;
    private _moveController: MoveController;
    private _rotateController: RotateController;
    private _paintController: PaintController<Stroke>;
    private _deleteController: DeleteController;
    private _fogController: PaintController<FogStroke>;
    private _cameraController: CameraController;
    private _sceneController: SceneController;
    private _mapController: MapController;

    private _gameState: GameState;

    private focusedElement: HTMLElement;

    private controllerMap: { [key: string]: GameController };

    public constructor(gameData: GameState) {
        this._gameState = gameData;
        this.setupControllers();
        this.controllerMap = {
            [CAMERA_CONTROLS]: this._cameraController,
            [PAINT_CONTROLS]: this._paintController,
            [MOVE_MODEL_CONTROLS]: this._moveController,
            [ROTATE_MODEL_CONTROLS]: this._rotateController,
            [DELETE_CONTROLS]: this._deleteController,
            [FOG_CONTROLS]: this._fogController,
            [SELECT_MODEL_CONTROLS]: this._selectModelController,
        };
        this.changeControls(this._gameState.currentControls);
        this.setupListeners();
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
    }

    setupListeners() {
        window.addEventListener("resize", this.resize);
        window.addEventListener("mouseover", this.mouseOverListener);
        window.addEventListener("keydown", this.keyDownListener);
    }

    tearDown() {
        window.removeEventListener("resize", this.resize);
        window.removeEventListener("mouseover", this.mouseOverListener);
        window.removeEventListener("keydown", this.keyDownListener);

        Object.values(this.controllerMap).forEach((controller) => {
            controller.tearDown();
        });
    }

    resize = () => {
        console.log('resize called');
        this._sceneController.resize(
            this._gameState.renderRoot.parentElement.clientWidth,
            this._gameState.renderRoot.parentElement.clientHeight
        );
    };

    mouseOverListener = (event) => {
        this.focusedElement = event.target as HTMLElement;
    }
    keyDownListener = ({ code }) => {
        if (
            ![
                "KeyP",
                "KeyC",
                "KeyM",
                "KeyR",
                "KeyX",
                "KeyF",
                "KeyS",
                "KeyA",
                "KeyL",
            ].includes(code) || this._gameState.renderRoot !== this.focusedElement
        ) {
            return;
        }
        switch (code) {
            case "KeyC":
                this.changeControls(CAMERA_CONTROLS);
                break;
            case "KeyP":
                if (this._gameState.currentGame.canPaint) {
                    this.changeControls(PAINT_CONTROLS);
                }
                break;
            case "KeyM":
                if (this._gameState.currentGame.canModel) {
                    this.changeControls(MOVE_MODEL_CONTROLS);
                }
                break;
            case "KeyR":
                if (this._gameState.currentGame.canModel) {
                    this.changeControls(ROTATE_MODEL_CONTROLS);
                }
                break;
            case "KeyX":
                if (this._gameState.currentGame.canModel) {
                    this.changeControls(DELETE_CONTROLS);
                }
                break;
            case "KeyF":
                if (this._gameState.currentGame.canWriteFog) {
                    this.changeControls(FOG_CONTROLS);
                }
                break;
            case "KeyS":
                this.changeControls(SELECT_MODEL_CONTROLS);
                break;
            case "KeyA":
                if (this._gameState.currentGame.canModel) {
                    this.changeControls(ADD_MODEL_CONTROLS);
                }
                break;
            case "KeyL":
                this.changeControls(SELECT_LOCATION_CONTROLS);
                break;
        }
    };

    // APIs used by react components

    changeControls = (mode: string) => {
        this._gameState.currentControls = mode;

        Object.values(this.controllerMap).forEach((controller) => {
            controller.disable();
        });
        this.controllerMap[mode]?.enable();
    }

    changeLocation(newLocation: Place) {
        this._mapController.setLocation(newLocation);
        this._paintController.setupDrawCanvas();
        this._fogController.setupDrawCanvas();
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

    addChangeControlsCallback(callback: ((mode: string) => any)) {
        this._gameState.addChangeControlsCallback(callback);
    }
}
