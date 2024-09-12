import {PathNode, Stroke} from "../../types.js";
import GameState, {BrushOptions, DRAW_Y_POSITION} from "../GameState.js";
import DrawingController from "./DrawingController.js";
import {BufferGeometry, Mesh, MeshBasicMaterial, Texture} from "three";

export const BRUSH_CIRCLE = "circle";
export const BRUSH_SQUARE = "square";
export const BRUSH_ERASE = "erase";
export const BRUSH_LINE = "line";
export const BRUSH_FOG = "fog";
export const BRUSH_FOG_COLOR = '#000000';
export const DEFAULT_BRUSH_COLOR = "#FFFFFF";
export const DEFAULT_BRUSH_TYPE = BRUSH_LINE;
export const DEFAULT_BRUSH_FILL = true;
export const DEFAULT_BRUSH_SIZE = 5;
export const DEFAULT_MAP_SIZE = 50;

export class PaintController extends DrawingController<Stroke> {

	private paintCanvas: HTMLCanvasElement;
	private paintTexture: Texture;
	private paintMaterial: MeshBasicMaterial;
	private paintMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
	private paintBrushOptions: BrushOptions = {
		brushColor: DEFAULT_BRUSH_COLOR,
		brushFill: DEFAULT_BRUSH_FILL,
		brushSize: DEFAULT_BRUSH_SIZE,
		brushType: DEFAULT_BRUSH_TYPE
	};
	private paintBrushMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
	private paintBrushMaterial: MeshBasicMaterial;
	private paintStrokesAlreadyDrawn: {[id: string]: Stroke} = {};
	private pathBeingPainted: PathNode[] = [];
	private paintStrokeBeingDrawnId: string;

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
		return this.paintCanvas;
	}

	set drawCanvas(drawCanvas) {
		this.paintCanvas = drawCanvas;
	}

	get drawTexture() {
		return this.paintTexture;
	}

	set drawTexture(drawTexture) {
		this.paintTexture = drawTexture;
	}

	get drawMaterial() {
		return this.paintMaterial;
	}

	set drawMaterial(drawMaterial) {
		this.paintMaterial = drawMaterial;
	}

	get drawMesh() {
		return this.paintMesh;
	}

	set drawMesh(drawMesh) {
		this.paintMesh = drawMesh;
	}

	get brushOptions(): BrushOptions {
		return this.paintBrushOptions;
	}

	get brushMesh() {
		return this.paintBrushMesh;
	}

	set brushMesh(brushMesh) {
		this.paintBrushMesh = brushMesh;
	}

	get brushMaterial() {
		return this.paintBrushMaterial;
	}

	set brushMaterial(brushMaterial) {
		this.paintBrushMaterial = brushMaterial;
	}

	get strokesAlreadyDrawn(): { [key: string]: Stroke } {
		return this.paintStrokesAlreadyDrawn as { [key: string]: Stroke };
	}

	get pathBeingDrawn() {
		return this.pathBeingPainted;
	}

	set pathBeingDrawn(pathBeingDrawn) {
		this.pathBeingPainted = pathBeingDrawn;
	}

	get strokeBeingDrawnId() {
		return this.paintStrokeBeingDrawnId;
	}

	set strokeBeingDrawnId(strokeBeingDrawnId) {
		this.paintStrokeBeingDrawnId = strokeBeingDrawnId;
	}

	get meshY() {
		return DRAW_Y_POSITION;
	}
}
