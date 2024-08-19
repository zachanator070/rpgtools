import {GameController} from "./GameController";
import GameState, {
    ADD_MODEL_CONTROLS,
    CAMERA_CONTROLS,
    DELETE_CONTROLS, FOG_CONTROLS,
    MOVE_MODEL_CONTROLS,
    PAINT_CONTROLS,
    ROTATE_MODEL_CONTROLS, SELECT_LOCATION_CONTROLS, SELECT_MODEL_CONTROLS
} from "../GameState";

export default class HotkeyController implements GameController {

    private gameState: GameState;
    private focusedElement: HTMLElement;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    disable(): void {
    }

    enable(): void {
        window.addEventListener("mouseover", this.mouseOverListener);
        window.addEventListener("keydown", this.keyDownListener);
    }

    tearDown() {
        window.removeEventListener("mouseover", this.mouseOverListener);
        window.removeEventListener("keydown", this.keyDownListener);
    }

    mouseOverListener = (event) => {
        this.focusedElement = event.target as HTMLElement;
    }

    keyDownListener = ({ code }) => {
        if (this.gameState.renderRoot !== this.focusedElement) {
            return;
        }
        switch (code) {
            case "KeyC":
                this.changeControls(CAMERA_CONTROLS);
                break;
            case "KeyP":
                if (this.gameState.currentGame.canPaint) {
                    this.changeControls(PAINT_CONTROLS);
                }
                break;
            case "KeyM":
                if (this.gameState.currentGame.canModel) {
                    this.changeControls(MOVE_MODEL_CONTROLS);
                }
                break;
            case "KeyR":
                if (this.gameState.currentGame.canModel) {
                    this.changeControls(ROTATE_MODEL_CONTROLS);
                }
                break;
            case "KeyX":
                if (this.gameState.currentGame.canModel) {
                    this.changeControls(DELETE_CONTROLS);
                }
                break;
            case "KeyF":
                if (this.gameState.currentGame.canWriteFog) {
                    this.changeControls(FOG_CONTROLS);
                }
                break;
            case "KeyS":
                this.changeControls(SELECT_MODEL_CONTROLS);
                break;
            case "KeyA":
                if (this.gameState.currentGame.canModel) {
                    this.changeControls(ADD_MODEL_CONTROLS);
                }
                break;
            case "KeyL":
                this.changeControls(SELECT_LOCATION_CONTROLS);
                break;
        }
    };

    changeControls(mode: string) {
        this.gameState.currentControls = mode;

        Object.values(this.gameState.controllerMap).forEach((controller) => {
            controller.disable();
        });
        this.gameState.controllerMap[mode]?.enable();
    }

}