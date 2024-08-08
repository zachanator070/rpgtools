import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import {GameController} from "./GameController";
import {FogStroke, Stroke} from "../../types";
import GameState, {BrushOptions, DRAW_Y_POSITION} from "../GameState";
import Queue from "../Queue";

export const BRUSH_CIRCLE = "circle";
export const BRUSH_SQUARE = "square";
export const BRUSH_ERASE = "erase";
export const BRUSH_LINE = "line";
export const BRUSH_FOG = "fog";
export const DEFAULT_BRUSH_COLOR = "#FFFFFF";
export const DEFAULT_BRUSH_TYPE = BRUSH_LINE;
export const DEFAULT_BRUSH_FILL = true;
export const DEFAULT_BRUSH_SIZE = 5;
export const DEFAULT_MAP_SIZE = 50;

export class PaintController<T extends Stroke | FogStroke> implements GameController {

	protected gameState: GameState;
	constructor(
		gameData: GameState,
	) {
		this.gameState = gameData;

		this.drawCanvas = document.createElement("canvas");
		if(this.gameState.location) {
			this.setupDrawCanvas();
		}
	}

	setupDrawCanvas() {
		this.drawCanvas.height = this.gameState.location.mapImage.height;
		this.drawCanvas.width = this.gameState.location.mapImage.width;

		this.drawTexture = new THREE.CanvasTexture(this.drawCanvas);
		this.drawTexture.generateMipmaps = false;
		this.drawTexture.wrapS = this.drawTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.drawTexture.minFilter = THREE.LinearFilter;
		// in threejs v155 color space was changed to be more realistic, this fixes the color to be more accurate to original image
		this.drawTexture.colorSpace = THREE.SRGBColorSpace;

		const drawGeometry = new THREE.PlaneGeometry(
			this.gameState.location.mapImage.width / this.gameState.location.pixelsPerFoot,
			this.gameState.location.mapImage.height / this.gameState.location.pixelsPerFoot
		);
		drawGeometry.rotateX(-Math.PI / 2);
		this.drawMaterial = new THREE.MeshBasicMaterial({
			map: this.drawTexture,
			transparent: true,
		});
		this.drawMesh = new THREE.Mesh(drawGeometry, this.drawMaterial);
		this.drawMesh.receiveShadow = true;
		this.drawMesh.position.set(0, this.meshY, 0);
		this.gameState.scene.add(this.drawMesh);

		this.setupBrush();
	}

	setupBrush = () => {
		this.createPaintBrushMesh();
		this.brushMesh.visible = false;
	};

	createPaintBrushMesh = () => {
		if (this.brushMesh) {
			this.gameState.scene.remove(this.brushMesh);
		}
		if (!this.brushMaterial) {
			this.brushMaterial = new THREE.MeshBasicMaterial({
				color: this.brushOptions.brushColor,
			});
		}
		this.setBrushColor(this.brushOptions.brushColor);
		let geometry: THREE.BufferGeometry;
		if (this.brushOptions.brushType === BRUSH_CIRCLE || this.brushOptions.brushType === BRUSH_LINE) {
			geometry = new THREE.CylinderGeometry(
				this.brushOptions.brushSize / 2,
				this.brushOptions.brushSize / 2,
				1,
				32
			);
		} else {
			geometry = new THREE.BoxGeometry(this.brushOptions.brushSize, 1, this.brushOptions.brushSize);
		}
		const oldVisibility = this.brushMesh
			? this.brushMesh.visible
			: false;
		this.brushMesh = new THREE.Mesh(geometry, this.brushMaterial);
		this.brushMesh.visible = oldVisibility;
		this.gameState.scene.add(this.brushMesh);
	};

	stroke = (stroke: T, useCache = true) => {
		let { path, type, size, _id } = stroke;
		console.log('Stroke called');
		const color = (stroke as Stroke).color;
		const fill = (stroke as Stroke).fill;
		size *= this.gameState.location.pixelsPerFoot;
		if (useCache) {
			for (let stroke of this.strokesAlreadyDrawn) {
				if (stroke._id === _id) {
					return;
				}
			}
		}
		if (path.length === 0) {
			console.warn("Trying to stroke a path with zero length path!");
			return;
		}
		const ctx = this.drawCanvas.getContext("2d");
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		switch (type) {
			case BRUSH_LINE:
				ctx.strokeStyle = color;
				ctx.lineWidth = size;
				ctx.beginPath();
				if (path.length > 0) {
					ctx.moveTo(path[0].x, path[0].y);
				}
				for (let part of path) {
					ctx.lineTo(part.x, part.y);
				}
				ctx.stroke();
				break;
			case BRUSH_SQUARE:
				for (let part of path) {
					if (fill) {
						ctx.fillStyle = color;
						ctx.fillRect(part.x - size / 2, part.y - size / 2, size, size);
					} else {
						ctx.lineWidth = DEFAULT_BRUSH_SIZE;
						ctx.strokeStyle = color;
						ctx.strokeRect(part.x - size / 2, part.y - size / 2, size, size);
					}
				}
				break;
			case BRUSH_FOG:
				for (let part of path) {
					ctx.fillStyle = color;
					ctx.fillRect(part.x - size / 2, part.y - size / 2, size, size);
				}
				break;
			case BRUSH_CIRCLE:
				for (let part of path) {
					ctx.beginPath();
					ctx.arc(part.x, part.y, size / 2, 0, Math.PI * 2);
					if (fill) {
						ctx.fillStyle = color;
						ctx.fill();
					} else {
						ctx.lineWidth = DEFAULT_BRUSH_SIZE;
						ctx.strokeStyle = color;
						ctx.stroke();
					}
				}
				break;
			case BRUSH_ERASE:
				for (let part of path) {
					ctx.clearRect(part.x - size / 2, part.y - size / 2, size, size);
				}
				break;
			default:
				console.warn(`Unknown stroke type when rendering stroke ${stroke._id}`);
		}
		if (useCache) {
			this.strokeCache.enqueue(stroke);
		}
		this.drawTexture.needsUpdate = true;
	};

	paintWithBrush = () => {
		if (!this.gameState.mapMesh) {
			return;
		}
		const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);

		for (let intersect of intersects) {
			const currentPath = [];
			if (this.pathBeingDrawn.length > 0 && this.brushOptions.brushType === BRUSH_LINE) {
				currentPath.push(
					this.pathBeingDrawn[this.pathBeingDrawn.length - 1]
				);
			}
			const newPoint = {
				x:
					intersect.point.x * this.gameState.location.pixelsPerFoot +
					this.gameState.location.mapImage.width / 2,
				y:
					intersect.point.z * this.gameState.location.pixelsPerFoot +
					this.gameState.location.mapImage.height / 2,
				_id: uuidv4(),
			};
			currentPath.push(newPoint);
			this.pathBeingDrawn.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.brushOptions.brushType,
					color: this.brushOptions.brushColor,
					fill: this.brushOptions.brushFill,
					size: this.brushOptions.brushSize,
					_id: this.strokeBeingDrawnId,
				} as any,
				false
			);
		}
	};

	stopPaintingWithBrush = () => {
		this.gameState.renderRoot.removeEventListener("mousemove", this.paintWithBrush);
		this.gameState.renderRoot.removeEventListener("mouseup", this.stopPaintingWithBrush);
		this.gameState.renderRoot.removeEventListener(
			"mouseleave",
			this.stopPaintingWithBrush
		);
		if (this.strokeBeingDrawnId) {
			const stroke = {
				path: this.pathBeingDrawn,
				type: this.brushOptions.brushType,
				color: this.brushOptions.brushColor,
				size: this.brushOptions.brushSize,
				fill: this.brushOptions.brushFill,
				_id: this.strokeBeingDrawnId,
			};
			this.strokeCache.enqueue(stroke as T);
			this.pathBeingDrawn = [];
			this.strokeBeingDrawnId = null;
		}
	};

	updateBrushPosition = () => {
		if (!this.gameState.mapMesh || !this.brushMesh) {
			return;
		}
		const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const intersect = intersects[0];
		this.brushMesh.position.set(intersect.point.x, 0, intersect.point.z);
	};

	paintMouseDownEvent = () => {
		this.strokeBeingDrawnId = uuidv4();
		this.paintWithBrush();
		this.gameState.renderRoot.addEventListener("mousemove", this.paintWithBrush);
		this.gameState.renderRoot.addEventListener("mouseup", this.stopPaintingWithBrush);
		this.gameState.renderRoot.addEventListener("mouseleave", this.stopPaintingWithBrush);
	};

	enable = () => {
		this.gameState.renderRoot.addEventListener("mousedown", this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.brushMesh.visible = true;
		this.gameState.renderRoot.addEventListener("mousemove", this.updateBrushPosition);
	};

	disable = () => {
		this.gameState.renderRoot.removeEventListener("mousedown", this.paintMouseDownEvent);
		this.brushMesh.visible = false;
	};

	tearDown = () => {
		this.disable();
		this.gameState.renderRoot.removeEventListener("mousemove", this.updateBrushPosition);
		this.gameState.scene.remove(this.drawMesh);
		this.gameState.scene.remove(this.brushMesh);
	};

	setBrushType = (type: string) => {
		this.brushOptions.brushType = type;
		this.gameState.scene.remove(this.brushMesh);
		this.createPaintBrushMesh();
		this.brushMaterial.needsUpdate = true;
		this.gameState.scene.add(this.brushMesh);
		this.updateBrushPosition();
	};

	getBrushType = () => {
		return this.brushOptions.brushType;
	}

	setBrushColor = (color: string) => {
		this.brushOptions.brushColor = color;
		this.brushMaterial.color.setHex(parseInt("0x" + color.substring(1)));
		this.brushMaterial.needsUpdate = true;
	};

	getBrushColor = () => {
		return this.brushOptions.brushColor;
	}

	setBrushFill = (fill: boolean) => {
		this.brushOptions.brushFill = fill;

		this.brushMaterial.wireframe = !fill;
		this.brushMaterial.needsUpdate = true;
	};

	getBrushFill = () => {
		return this.brushOptions.brushFill;
	}

	setBrushSize = (size: number) => {
		this.brushOptions.brushSize = size;
		this.createPaintBrushMesh();
	};

	getBrushSize = () => {
		return this.brushOptions.brushSize;
	}

	setDrawMeshOpacity = (value: number) => {
		if (this.drawMesh) {
			this.drawMesh.material.opacity = value;
			this.drawMesh.material.needsUpdate = true;
		}
	};

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

	get strokesAlreadyDrawn() {
		return this.gameState.paintStrokesAlreadyDrawn;
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

	get strokeCache(): Queue<T> {
		return this.gameState.paintStrokesAlreadyDrawn as Queue<T>;
	}

	get meshY() {
		return DRAW_Y_POSITION;
	}
}
