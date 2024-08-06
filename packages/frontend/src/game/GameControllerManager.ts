import {SelectModelController} from "./controller/SelectModelController";
import {MoveController} from "./controller/MoveController";
import {RotateController} from "./controller/RotateController";
import {PaintController} from "./controller/PaintController";
import {DeleteController} from "./controller/DeleteController";
import {CameraController} from "./controller/CameraController";
import GameState, {
    ADD_MODEL_CONTROLS,
    CAMERA_CONTROLS, DELETE_CONTROLS,
    DRAW_Y_POSITION, FOG_CONTROLS,
    FOG_Y_POSITION,
    MOVE_MODEL_CONTROLS,
    PAINT_CONTROLS, ROTATE_MODEL_CONTROLS, SELECT_LOCATION_CONTROLS, SELECT_MODEL_CONTROLS
} from "./GameState";
import SceneController from "./controller/SceneController";
import MapController from "./controller/MapController";


export default class GameControllerManager {
    private _selectModelController: SelectModelController;
    private _moveController: MoveController;
    private _rotateController: RotateController;
    private _paintController: PaintController;
    private _deleteController: DeleteController;
    private _fogController: PaintController;
    private _cameraController: CameraController;
    private _sceneController: SceneController;
    private _mapController: MapController;

    private _gameState: GameState;
    
    private focusedElement: HTMLElement;

    public constructor(gameData: GameState) {
        this._gameState = gameData;
        this.setupControls();
        this.setupListeners();
    }

    setupControls() {
        this._mapController = new MapController(this._gameState);
        this._sceneController = new SceneController(this._gameState);
        this._cameraController = new CameraController(this._gameState);

        this._paintController = new PaintController(
            this._gameState,
            DRAW_Y_POSITION
        );

        this._fogController = new PaintController(
            this._gameState,
            FOG_Y_POSITION
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

        this._changeControls(this._gameState.currentControls);
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
    }

    resize() {
        this.sceneController.resize(
            this.gameState.renderRoot.clientWidth,
            this.gameState.renderRoot.clientHeight
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
            ].includes(code) || this.gameState.renderRoot !== this.focusedElement
        ) {
            return;
        }
        switch (code) {
            case "KeyC":
                this.gameState.currentControls = CAMERA_CONTROLS;
                break;
            case "KeyP":
                if (this.gameState.currentGame.canPaint) {
                    this.gameState.currentControls = PAINT_CONTROLS;
                }
                break;
            case "KeyM":
                if (this.gameState.currentGame.canModel) {
                    this.gameState.currentControls = MOVE_MODEL_CONTROLS;
                }
                break;
            case "KeyR":
                if (this.gameState.currentGame.canModel) {
                    this.gameState.currentControls = ROTATE_MODEL_CONTROLS;
                }
                break;
            case "KeyX":
                if (this.gameState.currentGame.canModel) {
                    this.gameState.currentControls = DELETE_CONTROLS;
                }
                break;
            case "KeyF":
                if (this.gameState.currentGame.canWriteFog) {
                    this.gameState.currentControls = FOG_CONTROLS;
                }
                break;
            case "KeyS":
                this.gameState.currentControls = SELECT_MODEL_CONTROLS;
                break;
            case "KeyA":
                if (this.gameState.currentGame.canModel) {
                    this.gameState.currentControls = ADD_MODEL_CONTROLS;
                }
                break;
            case "KeyL":
                this.gameState.currentControls = SELECT_LOCATION_CONTROLS;
                break;
        }
    };

    private _changeControls = (mode: string) => {
        this._gameState.currentControls = mode;
    };


    get selectModelController(): SelectModelController {
        return this._selectModelController;
    }

    set selectModelController(value: SelectModelController) {
        this._selectModelController = value;
    }

    get moveController(): MoveController {
        return this._moveController;
    }

    set moveController(value: MoveController) {
        this._moveController = value;
    }

    get rotateController(): RotateController {
        return this._rotateController;
    }

    set rotateController(value: RotateController) {
        this._rotateController = value;
    }

    get paintController(): PaintController {
        return this._paintController;
    }

    set paintController(value: PaintController) {
        this._paintController = value;
    }

    get deleteController(): DeleteController {
        return this._deleteController;
    }

    set deleteController(value: DeleteController) {
        this._deleteController = value;
    }

    get fogController(): PaintController {
        return this._fogController;
    }

    set fogController(value: PaintController) {
        this._fogController = value;
    }

    get cameraController(): CameraController {
        return this._cameraController;
    }

    set cameraController(value: CameraController) {
        this._cameraController = value;
    }

    get gameState(): GameState {
        return this._gameState;
    }

    set gameState(value: GameState) {
        this._gameState = value;
    }

    get changeControls(): (mode: string) => void {
        return this._changeControls;
    }

    set changeControls(value: (mode: string) => void) {
        this._changeControls = value;
    }

    get sceneController(): SceneController {
        return this._sceneController;
    }

    set sceneController(value: SceneController) {
        this._sceneController = value;
    }

    get mapController(): MapController {
        return this._mapController;
    }

    set mapController(value: MapController) {
        this._mapController = value;
    }
}