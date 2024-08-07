import {PaintController} from "./PaintController";
import {FogStroke, Stroke} from "../../types";
import GameState, {BrushOptions, FOG_Y_POSITION} from "../GameState";
import Queue from "../Queue";


export default class FogController extends PaintController<FogStroke>{
    constructor(gameState: GameState) {
        super(gameState);
    }
    get drawCanvas() {
        return this.gameState.fogCanvas;
    }

    set drawCanvas(drawCanvas) {
        this.gameState.fogCanvas = drawCanvas;
    }

    get drawTexture() {
        return this.gameState.fogTexture;
    }

    set drawTexture(drawTexture) {
        this.gameState.fogTexture = drawTexture;
    }

    get drawMaterial() {
        return this.gameState.fogMaterial;
    }

    set drawMaterial(drawMaterial) {
        this.gameState.fogMaterial = drawMaterial;
    }

    get drawMesh() {
        return this.gameState.fogMesh;
    }

    set drawMesh(drawMesh) {
        this.gameState.fogMesh = drawMesh;
    }

    get brushOptions(): BrushOptions {
        return this.gameState.fogBrushOptions;
    }

    get brushMesh() {
        return this.gameState.fogBrushMesh;
    }

    set brushMesh(brushMesh) {
        this.gameState.fogBrushMesh = brushMesh;
    }

    get brushMaterial() {
        return this.gameState.fogBrushMaterial;
    }

    set brushMaterial(brushMaterial) {
        this.gameState.fogBrushMaterial = brushMaterial;
    }

    get strokesAlreadyDrawn() {
        return this.gameState.fogAlreadyDrawn as Queue<Stroke>;
    }

    get pathBeingDrawn() {
        return this.gameState.fogPathBeingDrawn;
    }

    set pathBeingDrawn(pathBeingDrawn) {
        this.gameState.fogPathBeingDrawn = pathBeingDrawn;
    }

    get strokeBeingDrawnId() {
        return this.gameState.fogStrokeBeingDrawnId;
    }

    set strokeBeingDrawnId(strokeBeingDrawnId) {
        this.gameState.fogStrokeBeingDrawnId = strokeBeingDrawnId;
    }

    get meshY() {
        return FOG_Y_POSITION;
    }
}
