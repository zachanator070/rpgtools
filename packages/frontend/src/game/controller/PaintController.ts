import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import {GameController} from "./GameController";
import {FogStroke, Stroke} from "../../types";
import GameState from "../GameState";
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

	private gameState: GameState;
	private strokeCache: Queue<T>;
	private meshY: number;

	constructor(
		gameData: GameState,
		strokeCache: Queue<T>,
		meshY = 0.01
	) {
		this.gameState = gameData;
		this.strokeCache = strokeCache;
		this.meshY = meshY;

		this.gameState.drawCanvas = document.createElement("canvas");
		if(this.gameState.location) {
			this.setupDrawCanvas();
		}
	}

	setupDrawCanvas() {
		this.gameState.drawCanvas.height = this.gameState.location.mapImage.height;
		this.gameState.drawCanvas.width = this.gameState.location.mapImage.width;

		this.gameState.drawTexture = new THREE.CanvasTexture(this.gameState.drawCanvas);
		this.gameState.drawTexture.generateMipmaps = false;
		this.gameState.drawTexture.wrapS = this.gameState.drawTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.gameState.drawTexture.minFilter = THREE.LinearFilter;

		const drawGeometry = new THREE.PlaneGeometry(
			this.gameState.location.mapImage.width / this.gameState.location.pixelsPerFoot,
			this.gameState.location.mapImage.height / this.gameState.location.pixelsPerFoot
		);
		drawGeometry.rotateX(-Math.PI / 2);
		this.gameState.drawMaterial = new THREE.MeshPhongMaterial({
			map: this.gameState.drawTexture,
			transparent: true,
		});
		this.gameState.drawMesh = new THREE.Mesh(drawGeometry, this.gameState.drawMaterial);
		this.gameState.drawMesh.receiveShadow = true;
		this.gameState.drawMesh.position.set(0, this.meshY, 0);
		this.gameState.scene.add(this.gameState.drawMesh);

		this.setupBrush();
	}

	setBrushType = (type: string) => {
		this.gameState.brushType = type;
		this.gameState.scene.remove(this.gameState.paintBrushMesh);
		this.createPaintBrushMesh();
		this.gameState.paintBrushMaterial.needsUpdate = true;
		this.gameState.scene.add(this.gameState.paintBrushMesh);
		this.updateBrushPosition();
	};
	getBrushType = () => {
		return this.gameState.brushType;
	}

	setBrushColor = (color: string) => {
		this.gameState.brushColor = color;
		this.gameState.paintBrushMaterial.color.setHex(parseInt("0x" + color.substring(1)));
		this.gameState.paintBrushMaterial.needsUpdate = true;
	};
	getBrushColor = () => {
		return this.gameState.brushColor;
	}

	setBrushFill = (fill: boolean) => {
		this.gameState.brushFill = fill;

		this.gameState.paintBrushMaterial.wireframe = !fill;
		this.gameState.paintBrushMaterial.needsUpdate = true;
	};
	getBrushFill = () => {
		return this.gameState.brushFill;
	}

	setBrushSize = (size: number) => {
		this.gameState.brushSize = size;
		this.createPaintBrushMesh();
	};
	getBrushSize = () => {
		return this.gameState.brushSize;
	}

	setupBrush = () => {
		this.createPaintBrushMesh();
		this.gameState.paintBrushMesh.visible = false;
	};

	setDrawMeshOpacity = (value: number) => {
		if (this.gameState.drawMesh) {
			this.gameState.drawMeshOpacity = value;
			this.gameState.drawMesh.material.opacity = value;
			this.gameState.drawMesh.material.needsUpdate = true;
		}
	};

	createPaintBrushMesh = () => {
		if (this.gameState.paintBrushMesh) {
			this.gameState.scene.remove(this.gameState.paintBrushMesh);
		}
		if (!this.gameState.paintBrushMaterial) {
			this.gameState.paintBrushMaterial = new THREE.MeshBasicMaterial({
				color: this.gameState.brushColor,
			});
		}
		this.setBrushColor(this.gameState.brushColor);
		let geometry: THREE.BufferGeometry;
		if (this.gameState.brushType === BRUSH_CIRCLE || this.gameState.brushType === BRUSH_LINE) {
			geometry = new THREE.CylinderGeometry(
				this.gameState.brushSize / 2,
				this.gameState.brushSize / 2,
				1,
				32
			);
		} else {
			geometry = new THREE.BoxGeometry(this.gameState.brushSize, 1, this.gameState.brushSize);
		}
		const oldVisibility = this.gameState.paintBrushMesh
			? this.gameState.paintBrushMesh.visible
			: false;
		this.gameState.paintBrushMesh = new THREE.Mesh(geometry, this.gameState.paintBrushMaterial);
		this.gameState.paintBrushMesh.visible = oldVisibility;
		this.gameState.scene.add(this.gameState.paintBrushMesh);
	};

	stroke = (stroke: T, useCache = true) => {
		let { path, type, size, _id } = stroke;
		const color = (stroke as Stroke).color;
		const fill = (stroke as Stroke).fill;
		size *= this.gameState.location.pixelsPerFoot;
		if (useCache) {
			for (let stroke of this.gameState.strokesAlreadyDrawn) {
				if (stroke._id === _id) {
					return;
				}
			}
		}
		if (path.length === 0) {
			console.warn("Trying to stroke a path with zero length path!");
			return;
		}
		const ctx = this.gameState.drawCanvas.getContext("2d");
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
		this.gameState.drawTexture.needsUpdate = true;
	};

	paintWithBrush = () => {
		if (!this.gameState.mapMesh) {
			return;
		}
		const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);

		for (let intersect of intersects) {
			const currentPath = [];
			if (this.gameState.pathBeingPainted.length > 0 && this.gameState.brushType === BRUSH_LINE) {
				currentPath.push(
					this.gameState.pathBeingPainted[this.gameState.pathBeingPainted.length - 1]
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
			this.gameState.pathBeingPainted.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.gameState.brushType,
					color: this.gameState.brushColor,
					fill: this.gameState.brushFill,
					size: this.gameState.brushSize,
					_id: this.gameState.strokeId,
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
		if (this.gameState.strokeId) {
			const stroke = {
				path: this.gameState.pathBeingPainted,
				type: this.gameState.brushType,
				color: this.gameState.brushColor,
				size: this.gameState.brushSize,
				fill: this.gameState.brushFill,
				_id: this.gameState.strokeId,
				strokeId: this.gameState.strokeId,
			};
			this.strokeCache.enqueue(stroke as any);
			this.gameState.pathBeingPainted = [];
			this.gameState.strokeId = null;
		}
	};

	updateBrushPosition = () => {
		if (!this.gameState.mapMesh || !this.gameState.paintBrushMesh) {
			return;
		}
		const intersects = this.gameState.raycaster.intersectObject(this.gameState.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const intersect = intersects[0];
		this.gameState.paintBrushMesh.position.set(intersect.point.x, 0, intersect.point.z);
	};

	paintMouseDownEvent = () => {
		this.gameState.strokeId = uuidv4();
		this.paintWithBrush();
		this.gameState.renderRoot.addEventListener("mousemove", this.paintWithBrush);
		this.gameState.renderRoot.addEventListener("mouseup", this.stopPaintingWithBrush);
		this.gameState.renderRoot.addEventListener("mouseleave", this.stopPaintingWithBrush);
	};

	getSaveState = () => {
		return {
			brushType: this.gameState.brushType,
			brushColor: this.gameState.brushColor,
			brushSize: this.gameState.brushSize,
			brushFill: this.gameState.brushFill,
			drawMeshOpacity: this.gameState.drawMeshOpacity,
		};
	};

	loadSaveState = ({
		brushType,
		brushColor,
		brushSize,
		brushFill,
		drawMeshOpacity,
	}) => {
		this.setBrushType(brushType);
		this.setBrushColor(brushColor);
		this.setBrushSize(brushSize);
		this.setBrushFill(brushFill);
		this.setDrawMeshOpacity(drawMeshOpacity);
	};

	enable = () => {
		this.gameState.renderRoot.addEventListener("mousedown", this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.gameState.paintBrushMesh.visible = true;
		this.gameState.renderRoot.addEventListener("mousemove", this.updateBrushPosition);
	};

	disable = () => {
		this.gameState.renderRoot.removeEventListener("mousedown", this.paintMouseDownEvent);
		this.gameState.paintBrushMesh.visible = false;
	};

	tearDown = () => {
		this.disable();
		this.gameState.renderRoot.removeEventListener("mousemove", this.updateBrushPosition);
		this.gameState.scene.remove(this.gameState.drawMesh);
		this.gameState.scene.remove(this.gameState.paintBrushMesh);
	};
}
