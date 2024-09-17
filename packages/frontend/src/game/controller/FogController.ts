import {FogStroke, PathNode} from "../../types";
import GameState, {BrushOptions, FOG_Y_POSITION} from "../GameState";
import DrawingController from "./DrawingController";
import {BufferGeometry, Mesh, MeshBasicMaterial, Texture} from "three";
import {BRUSH_FOG, BRUSH_FOG_COLOR, DEFAULT_BRUSH_FILL, DEFAULT_BRUSH_SIZE} from "./PaintController";

export default class FogController extends DrawingController<FogStroke>{
    private fogCanvas: HTMLCanvasElement;
    private fogTexture: Texture;
    private fogMaterial: MeshBasicMaterial;
    private fogMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
    private fogBrushOptions: BrushOptions = {
        brushColor: BRUSH_FOG_COLOR,
        brushFill: DEFAULT_BRUSH_FILL,
        brushSize: DEFAULT_BRUSH_SIZE,
        brushType: BRUSH_FOG
    };
    private fogBrushMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
    private fogBrushMaterial: MeshBasicMaterial;
    private fogAlreadyDrawn: {[id: string]: FogStroke} = {};
    private fogPathBeingDrawn: PathNode[] = [];
    private fogStrokeBeingDrawnId: string;

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
        return this.fogCanvas;
    }

    set drawCanvas(drawCanvas) {
        this.fogCanvas = drawCanvas;
    }

    get drawTexture() {
        return this.fogTexture;
    }

    set drawTexture(drawTexture) {
        this.fogTexture = drawTexture;
    }

    get drawMaterial() {
        return this.fogMaterial;
    }

    set drawMaterial(drawMaterial) {
        this.fogMaterial = drawMaterial;
    }

    get drawMesh() {
        return this.fogMesh;
    }

    set drawMesh(drawMesh) {
        this.fogMesh = drawMesh;
    }

    get brushOptions(): BrushOptions {
        return this.fogBrushOptions;
    }

    get brushMesh(): Mesh<BufferGeometry, MeshBasicMaterial> {
        return this.fogBrushMesh;
    }

    set brushMesh(brushMesh: Mesh<BufferGeometry, MeshBasicMaterial>) {
        this.fogBrushMesh = brushMesh;
    }

    get brushMaterial() {
        return this.fogBrushMaterial;
    }

    set brushMaterial(brushMaterial) {
        this.fogBrushMaterial = brushMaterial;
    }

    get strokesAlreadyDrawn() {
        return this.fogAlreadyDrawn;
    }

    get pathBeingDrawn() {
        return this.fogPathBeingDrawn;
    }

    set pathBeingDrawn(pathBeingDrawn) {
        this.fogPathBeingDrawn = pathBeingDrawn;
    }

    get strokeBeingDrawnId() {
        return this.fogStrokeBeingDrawnId;
    }

    set strokeBeingDrawnId(strokeBeingDrawnId) {
        this.fogStrokeBeingDrawnId = strokeBeingDrawnId;
    }

    get meshY() {
        return FOG_Y_POSITION;
    }

    notifyDrawFinishedCallbacks(stroke: FogStroke) {
        this.gameState.notifyFogFinishedCallbacks(stroke);
    }
}
