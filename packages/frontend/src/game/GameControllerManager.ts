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
import {FogStroke, Stroke} from "../types";
import FogController from "./controller/FogController";


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

    private controllerMap: { [key: string]: any };

    public constructor(gameData: GameState) {
        this._gameState = gameData;
        this.setupControllers();
        this.controllerMap = {
            [CAMERA_CONTROLS]: this.cameraController,
            [PAINT_CONTROLS]: this.paintController,
            [MOVE_MODEL_CONTROLS]: this.moveController,
            [ROTATE_MODEL_CONTROLS]: this.rotateController,
            [DELETE_CONTROLS]: this.deleteController,
            [FOG_CONTROLS]: this.fogController,
            [SELECT_MODEL_CONTROLS]: this.selectModelController,
        };
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

        if (this._selectModelController) {
            this._selectModelController.tearDown();
        }
        this._selectModelController = new SelectModelController(
            this._gameState
        );

        if (this._moveController) {
            this._moveController.tearDown();
        }
        this._moveController = new MoveController(
            this._gameState,
        );

        if (this._rotateController) {
            this._rotateController.tearDown();
        }
        this._rotateController = new RotateController(
            this._gameState,
        );

        if (this._deleteController) {
            this._deleteController.tearDown();
        }
        this._deleteController = new DeleteController(
            this._gameState,
        );

        this.changeControls(this._gameState.currentControls);
    }

    setupListeners() {
        window.addEventListener("resize", () => this.resize());
        window.addEventListener("mouseover", (event) => this.mouseOverListener(event));
        window.addEventListener("keydown", (event) => this.keyDownListener(event));
    }

    tearDown() {
        window.removeEventListener("resize", this.resize);
        window.removeEventListener("mouseover", this.mouseOverListener);
        window.removeEventListener("keydown", this.keyDownListener);

        Object.values(this.controllerMap).forEach((controller) => {
            controller.tearDown();
        });
    }

    resize() {
        this.sceneController.resize(
            this._gameState.renderRoot.parentElement.clientWidth,
            this._gameState.renderRoot.parentElement.clientHeight
        );
    };

    mouseOverListener(event) {
        this.focusedElement = event.target as HTMLElement;
    }
    keyDownListener({ code }) {
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

    changeControls = (mode: string) => {
        this._gameState.currentControls = mode;

        Object.values(this.controllerMap).forEach((controller) => {
            controller.disable();
        });
        this.controllerMap[mode].enable();
    }

    get selectModelController(): SelectModelController {
        return this._selectModelController;
    }

    get moveController(): MoveController {
        return this._moveController;
    }

    get rotateController(): RotateController {
        return this._rotateController;
    }

    get paintController(): PaintController<Stroke> {
        return this._paintController;
    }

    get deleteController(): DeleteController {
        return this._deleteController;
    }

    get fogController(): PaintController<FogStroke> {
        return this._fogController;
    }

    get cameraController(): CameraController {
        return this._cameraController;
    }

    get sceneController(): SceneController {
        return this._sceneController;
    }

    get mapController(): MapController {
        return this._mapController;
    }
}
