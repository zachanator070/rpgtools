import {GameController} from "./GameController.js";
import GameState, {
    ADD_MODEL_CONTROLS,
    FOG_CONTROLS,
    PAINT_CONTROLS,
    SELECT_LOCATION_CONTROLS, SELECT_MODEL_CONTROLS
} from "../GameState.js";

export default class HotkeyController implements GameController {

    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        window.addEventListener("mouseover", this.mouseOverListener);
        window.addEventListener("keydown", this.keyDownListener);
    }

    disable(): void {
    }

    enable(): void {
    }

    tearDown() {
        window.removeEventListener("mouseover", this.mouseOverListener);
        window.removeEventListener("keydown", this.keyDownListener);
    }

    mouseOverListener = (event) => {
        this.gameState.focusedElement = event.target as HTMLElement;
    }

    keyDownListener = ({ code }) => {
        if (this.gameState.renderRoot !== this.gameState.focusedElement) {
            return;
        }
        switch (code) {
            case "KeyP":
                if (this.gameState.currentGame.canPaint) {
                    this.changeControls(PAINT_CONTROLS);
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