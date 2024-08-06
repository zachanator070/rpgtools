import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import {GameController} from "./GameController";
import {FogStroke, Stroke} from "../../types";
import GameState from "../GameState";

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

export class PaintController implements GameController {

	private gameData: GameState;
	private meshY: number;

	constructor(
		gameData: GameState,
		meshY = 0.01
	) {
		this.gameData = gameData;
		this.meshY = meshY;

		this.gameData.drawCanvas = document.createElement("canvas");
		if(this.gameData.location) {
			this.setupDrawCanvas();
		}
	}

	setupDrawCanvas() {
		this.gameData.drawCanvas.height = this.gameData.location.mapImage.height;
		this.gameData.drawCanvas.width = this.gameData.location.mapImage.width;

		this.gameData.drawTexture = new THREE.CanvasTexture(this.gameData.drawCanvas);
		this.gameData.drawTexture.generateMipmaps = false;
		this.gameData.drawTexture.wrapS = this.gameData.drawTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.gameData.drawTexture.minFilter = THREE.LinearFilter;

		const drawGeometry = new THREE.PlaneGeometry(
			this.gameData.location.mapImage.width / this.gameData.location.pixelsPerFoot,
			this.gameData.location.mapImage.height / this.gameData.location.pixelsPerFoot
		);
		drawGeometry.rotateX(-Math.PI / 2);
		this.gameData.drawMaterial = new THREE.MeshPhongMaterial({
			map: this.gameData.drawTexture,
			transparent: true,
		});
		this.gameData.drawMesh = new THREE.Mesh(drawGeometry, this.gameData.drawMaterial);
		this.gameData.drawMesh.receiveShadow = true;
		this.gameData.drawMesh.position.set(0, this.meshY, 0);
		this.gameData.drawMeshOpacity = 1;
		this.gameData.scene.add(this.gameData.drawMesh);

		this.gameData.pathBeingPainted = [];
		this.gameData.strokeId = null;
		this.gameData.brushType = DEFAULT_BRUSH_TYPE;
		this.gameData.brushColor = DEFAULT_BRUSH_COLOR;
		this.gameData.brushFill = DEFAULT_BRUSH_FILL;
		this.gameData.brushSize = DEFAULT_BRUSH_SIZE;

		this.gameData.strokesAlreadyDrawn = [];

		this.gameData.paintBrushMesh = null;
		this.gameData.paintBrushMaterial = null;

		this.setupBrush();
	}

	setBrushType = (type: string) => {
		this.gameData.brushType = type;
		this.gameData.scene.remove(this.gameData.paintBrushMesh);
		this.createPaintBrushMesh();
		this.gameData.paintBrushMaterial.needsUpdate = true;
		this.gameData.scene.add(this.gameData.paintBrushMesh);
		this.updateBrushPosition();
	};
	getBrushType = () => {
		return this.gameData.brushType;
	}

	setBrushColor = (color: string) => {
		this.gameData.brushColor = color;
		this.gameData.paintBrushMaterial.color.setHex(parseInt("0x" + color.substring(1)));
		this.gameData.paintBrushMaterial.needsUpdate = true;
	};
	getBrushColor = () => {
		return this.gameData.brushColor;
	}

	setBrushFill = (fill: boolean) => {
		this.gameData.brushFill = fill;

		this.gameData.paintBrushMaterial.wireframe = !fill;
		this.gameData.paintBrushMaterial.needsUpdate = true;
	};
	getBrushFill = () => {
		return this.gameData.brushFill;
	}

	setBrushSize = (size: number) => {
		this.gameData.brushSize = size;
		this.createPaintBrushMesh();
	};
	getBrushSize = () => {
		return this.gameData.brushSize;
	}

	setupBrush = () => {
		this.createPaintBrushMesh();
		this.gameData.paintBrushMesh.visible = false;
	};

	setDrawMeshOpacity = (value: number) => {
		if (this.gameData.drawMesh) {
			this.gameData.drawMeshOpacity = value;
			this.gameData.drawMesh.material.opacity = value;
			this.gameData.drawMesh.material.needsUpdate = true;
		}
	};

	createPaintBrushMesh = () => {
		if (this.gameData.paintBrushMesh) {
			this.gameData.scene.remove(this.gameData.paintBrushMesh);
		}
		if (!this.gameData.paintBrushMaterial) {
			this.gameData.paintBrushMaterial = new THREE.MeshBasicMaterial({
				color: this.gameData.brushColor,
			});
		}
		this.setBrushColor(this.gameData.brushColor);
		let geometry: THREE.BufferGeometry;
		if (this.gameData.brushType === BRUSH_CIRCLE || this.gameData.brushType === BRUSH_LINE) {
			geometry = new THREE.CylinderGeometry(
				this.gameData.brushSize / 2,
				this.gameData.brushSize / 2,
				1,
				32
			);
		} else {
			geometry = new THREE.BoxGeometry(this.gameData.brushSize, 1, this.gameData.brushSize);
		}
		const oldVisibility = this.gameData.paintBrushMesh
			? this.gameData.paintBrushMesh.visible
			: false;
		this.gameData.paintBrushMesh = new THREE.Mesh(geometry, this.gameData.paintBrushMaterial);
		this.gameData.paintBrushMesh.visible = oldVisibility;
		this.gameData.scene.add(this.gameData.paintBrushMesh);
	};

	stroke = (stroke: Stroke | FogStroke, useCache = true) => {
		let { path, type, size, _id } = stroke;
		const color = (stroke as Stroke).color;
		const fill = (stroke as Stroke).fill;
		size *= this.gameData.location.pixelsPerFoot;
		if (useCache) {
			for (let stroke of this.gameData.strokesAlreadyDrawn) {
				if (stroke._id === _id) {
					return;
				}
			}
		}
		if (path.length === 0) {
			console.warn("Trying to stroke a path with zero length path!");
			return;
		}
		const ctx = this.gameData.drawCanvas.getContext("2d");
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
			this.gameData.strokesAlreadyDrawn.push(stroke);
		}
		this.gameData.drawTexture.needsUpdate = true;
	};

	paintWithBrush = () => {
		if (!this.gameData.mapMesh) {
			return;
		}
		const intersects = this.gameData.raycaster.intersectObject(this.gameData.mapMesh);

		for (let intersect of intersects) {
			const currentPath = [];
			if (this.gameData.pathBeingPainted.length > 0 && this.gameData.brushType === BRUSH_LINE) {
				currentPath.push(
					this.gameData.pathBeingPainted[this.gameData.pathBeingPainted.length - 1]
				);
			}
			const newPoint = {
				x:
					intersect.point.x * this.gameData.location.pixelsPerFoot +
					this.gameData.location.mapImage.width / 2,
				y:
					intersect.point.z * this.gameData.location.pixelsPerFoot +
					this.gameData.location.mapImage.height / 2,
				_id: uuidv4(),
			};
			currentPath.push(newPoint);
			this.gameData.pathBeingPainted.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.gameData.brushType,
					color: this.gameData.brushColor,
					fill: this.gameData.brushFill,
					size: this.gameData.brushSize,
					_id: this.gameData.strokeId,
				},
				false
			);
		}
	};

	stopPaintingWithBrush = () => {
		this.gameData.renderRoot.removeEventListener("mousemove", this.paintWithBrush);
		this.gameData.renderRoot.removeEventListener("mouseup", this.stopPaintingWithBrush);
		this.gameData.renderRoot.removeEventListener(
			"mouseleave",
			this.stopPaintingWithBrush
		);
		if (this.gameData.strokeId) {
			const stroke = {
				path: this.gameData.pathBeingPainted,
				type: this.gameData.brushType,
				color: this.gameData.brushColor,
				size: this.gameData.brushSize,
				fill: this.gameData.brushFill,
				_id: this.gameData.strokeId,
				strokeId: this.gameData.strokeId,
			};
			this.gameData.strokesAlreadyDrawn.push(stroke);
			this.gameData.pathBeingPainted = [];
			this.gameData.strokeId = null;
		}
	};

	updateBrushPosition = () => {
		if (!this.gameData.mapMesh || !this.gameData.paintBrushMesh) {
			return;
		}
		const intersects = this.gameData.raycaster.intersectObject(this.gameData.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const intersect = intersects[0];
		this.gameData.paintBrushMesh.position.set(intersect.point.x, 0, intersect.point.z);
	};

	paintMouseDownEvent = () => {
		this.gameData.strokeId = uuidv4();
		this.paintWithBrush();
		this.gameData.renderRoot.addEventListener("mousemove", this.paintWithBrush);
		this.gameData.renderRoot.addEventListener("mouseup", this.stopPaintingWithBrush);
		this.gameData.renderRoot.addEventListener("mouseleave", this.stopPaintingWithBrush);
	};

	getSaveState = () => {
		return {
			brushType: this.gameData.brushType,
			brushColor: this.gameData.brushColor,
			brushSize: this.gameData.brushSize,
			brushFill: this.gameData.brushFill,
			drawMeshOpacity: this.gameData.drawMeshOpacity,
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
		this.gameData.renderRoot.addEventListener("mousedown", this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.gameData.paintBrushMesh.visible = true;
		this.gameData.renderRoot.addEventListener("mousemove", this.updateBrushPosition);
	};

	disable = () => {
		this.gameData.renderRoot.removeEventListener("mousedown", this.paintMouseDownEvent);
		this.gameData.paintBrushMesh.visible = false;
	};

	tearDown = () => {
		this.disable();
		this.gameData.renderRoot.removeEventListener("mousemove", this.updateBrushPosition);
		this.gameData.scene.remove(this.gameData.drawMesh);
		this.gameData.scene.remove(this.gameData.paintBrushMesh);
	};
}
