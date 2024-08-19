import {Stroke} from "../../types";
import GameState, {BrushOptions, DRAW_Y_POSITION} from "../GameState";
import DrawingController from "./DrawingController";

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
		return this.gameState.paintCanvas;
	}

	set drawCanvas(drawCanvas) {
		this.gameState.paintCanvas = drawCanvas;
	}

	get drawTexture() {
		return this.gameState.paintTexture;
	}

	set drawTexture(drawTexture) {
		this.gameState.paintTexture = drawTexture;
	}

	get drawMaterial() {
		return this.gameState.paintMaterial;
	}

	set drawMaterial(drawMaterial) {
		this.gameState.paintMaterial = drawMaterial;
	}

	get drawMesh() {
		return this.gameState.paintMesh;
	}

	set drawMesh(drawMesh) {
		this.gameState.paintMesh = drawMesh;
	}

	get brushOptions(): BrushOptions {
		return this.gameState.paintBrushOptions;
	}

	get brushMesh() {
		return this.gameState.paintBrushMesh;
	}

	set brushMesh(brushMesh) {
		this.gameState.paintBrushMesh = brushMesh;
	}

	get brushMaterial() {
		return this.gameState.paintBrushMaterial;
	}

	set brushMaterial(brushMaterial) {
		this.gameState.paintBrushMaterial = brushMaterial;
	}

	get strokesAlreadyDrawn(): { [key: string]: Stroke } {
		return this.gameState.paintStrokesAlreadyDrawn as { [key: string]: Stroke };
	}

	set strokesAlreadyDrawn(strokes: { [key: string]: Stroke }) {
		(this.gameState.paintStrokesAlreadyDrawn as { [key: string]: Stroke }) = strokes;
	}

	get pathBeingDrawn() {
		return this.gameState.pathBeingPainted;
	}

	set pathBeingDrawn(pathBeingDrawn) {
		this.gameState.pathBeingPainted = pathBeingDrawn;
	}

	get strokeBeingDrawnId() {
		return this.gameState.paintStrokeBeingDrawnId;
	}

	set strokeBeingDrawnId(strokeBeingDrawnId) {
		this.gameState.paintStrokeBeingDrawnId = strokeBeingDrawnId;
	}

	get meshY() {
		return DRAW_Y_POSITION;
	}
}
