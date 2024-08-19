import {FogStroke} from "../../types";
import GameState, {BrushOptions, FOG_Y_POSITION} from "../GameState";
import DrawingController from "./DrawingController";
import {BufferGeometry, Mesh, MeshBasicMaterial} from "three";


export default class FogController extends DrawingController<FogStroke>{
    constructor(gameState: GameState) {
        super(gameState);
        this.drawCanvas = document.createElement("canvas");
        if(this.gameState.location) {
            this.setupDrawCanvas(
                this.gameState.location.mapImage.width,
                this.gameState.location.mapImage.height,
                this.gameState.location.pixelsPerFoot,
            );
        }
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

    get brushMesh(): Mesh<BufferGeometry, MeshBasicMaterial> {
        return this.gameState.fogBrushMesh;
    }

    set brushMesh(brushMesh: Mesh<BufferGeometry, MeshBasicMaterial>) {
        this.gameState.fogBrushMesh = brushMesh;
    }

    get brushMaterial() {
        return this.gameState.fogBrushMaterial;
    }

    set brushMaterial(brushMaterial) {
        this.gameState.fogBrushMaterial = brushMaterial;
    }

    get strokesAlreadyDrawn() {
        return this.gameState.fogAlreadyDrawn;
    }

    set strokesAlreadyDrawn(strokes: {[p: string]: FogStroke}) {
        this.gameState.fogAlreadyDrawn = strokes;
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

    notifyDrawFinishedCallbacks(stroke: FogStroke) {
        this.gameState.notifyFogFinishedCallbacks(stroke);
    }
}
