import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import {GameControls} from "./GameControls";
import {FogStroke, Stroke} from "../types";

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

export class PaintControls implements GameControls {

	private renderRoot: any;
	private raycaster: any;
	private scene: any;
	private location: any;
	private mapMesh: any;
	private strokeCallback: any;
	private drawCanvas: HTMLCanvasElement;
	private drawTexture: THREE.CanvasTexture;
	private drawMaterial: THREE.MeshPhongMaterial;
	private drawMesh: THREE.Mesh;
	private drawMeshOpacity: number;
	private pathBeingPainted: any[];
	private strokeId: any;
	private brushType: string = DEFAULT_BRUSH_TYPE;
	private brushColor: string = DEFAULT_BRUSH_COLOR;
	private brushFill: boolean = DEFAULT_BRUSH_FILL;
	private brushSize: number = DEFAULT_BRUSH_SIZE;
	private strokesAlreadyDrawn: any[];
	private paintBrushMesh: any;
	private paintBrushMaterial: any;

	constructor(
		renderRoot,
		raycaster,
		scene,
		mapMesh,
		location,
		strokeCallback,
		meshY = 0.01
	) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.scene = scene;
		this.mapMesh = mapMesh;
		this.location = location;
		this.strokeCallback = strokeCallback;

		this.drawCanvas = document.createElement("canvas");
		this.drawCanvas.height = this.location.mapImage.height;
		this.drawCanvas.width = this.location.mapImage.width;

		this.drawTexture = new THREE.CanvasTexture(this.drawCanvas);
		this.drawTexture.generateMipmaps = false;
		this.drawTexture.wrapS = this.drawTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.drawTexture.minFilter = THREE.LinearFilter;

		const drawGeometry = new THREE.PlaneGeometry(
			this.location.mapImage.width / this.location.pixelsPerFoot,
			this.location.mapImage.height / this.location.pixelsPerFoot
		);
		drawGeometry.rotateX(-Math.PI / 2);
		this.drawMaterial = new THREE.MeshPhongMaterial({
			map: this.drawTexture,
			transparent: true,
		});
		this.drawMesh = new THREE.Mesh(drawGeometry, this.drawMaterial);
		this.drawMesh.receiveShadow = true;
		this.drawMesh.position.set(0, meshY, 0);
		this.drawMeshOpacity = 1;
		this.scene.add(this.drawMesh);

		this.pathBeingPainted = [];
		this.strokeId = null;
		this.brushType = DEFAULT_BRUSH_TYPE;
		this.brushColor = DEFAULT_BRUSH_COLOR;
		this.brushFill = DEFAULT_BRUSH_FILL;
		this.brushSize = DEFAULT_BRUSH_SIZE;

		this.strokesAlreadyDrawn = [];

		this.paintBrushMesh = null;
		this.paintBrushMaterial = null;

		this.setupBrush();
	}

	setBrushType = (type) => {
		this.brushType = type;
		this.scene.remove(this.paintBrushMesh);
		this.createPaintBrushMesh();
		this.paintBrushMaterial.needsUpdate = true;
		this.scene.add(this.paintBrushMesh);
		this.updateBrushPosition();
	};
	getBrushType = () => {
		return this.brushType;
	}

	setBrushColor = (color) => {
		this.brushColor = color;
		this.paintBrushMaterial.color.setHex(parseInt("0x" + color.substr(1)));
		this.paintBrushMaterial.needsUpdate = true;
	};
	getBrushColor = () => {
		return this.brushColor;
	}

	setBrushFill = (fill) => {
		this.brushFill = fill;

		this.paintBrushMaterial.wireframe = !fill;
		this.paintBrushMaterial.needsUpdate = true;
	};
	getBrushFill = () => {
		return this.brushFill;
	}

	setBrushSize = (size) => {
		this.brushSize = size;
		this.createPaintBrushMesh();
	};
	getBrushSize = () => {
		return this.brushSize;
	}

	setupBrush = () => {
		this.createPaintBrushMesh();
		this.paintBrushMesh.visible = false;
	};

	setDrawMeshOpacity = (value) => {
		if (this.drawMesh) {
			this.drawMeshOpacity = value;
			this.drawMesh.material.opacity = value;
			this.drawMesh.material.needsUpdate = true;
		}
	};

	createPaintBrushMesh = () => {
		if (this.paintBrushMesh) {
			this.scene.remove(this.paintBrushMesh);
		}
		if (!this.paintBrushMaterial) {
			this.paintBrushMaterial = new THREE.MeshBasicMaterial({
				color: this.brushColor,
			});
		}
		this.setBrushColor(this.brushColor);
		let geometry;
		if (this.brushType === BRUSH_CIRCLE || this.brushType === BRUSH_LINE) {
			geometry = new THREE.CylinderGeometry(
				this.brushSize / 2,
				this.brushSize / 2,
				1,
				32
			);
		} else {
			geometry = new THREE.BoxGeometry(this.brushSize, 1, this.brushSize);
		}
		const oldVisibility = this.paintBrushMesh
			? this.paintBrushMesh.visible
			: false;
		this.paintBrushMesh = new THREE.Mesh(geometry, this.paintBrushMaterial);
		this.paintBrushMesh.visible = oldVisibility;
		this.scene.add(this.paintBrushMesh);
	};

	stroke = (stroke: Stroke | FogStroke, useCache = true) => {
		let { path, type, size, _id } = stroke;
		const color = (stroke as Stroke).color;
		const fill = (stroke as Stroke).fill;
		size *= this.location.pixelsPerFoot;
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
			this.strokesAlreadyDrawn.push(stroke);
		}
		this.drawTexture.needsUpdate = true;
	};

	paintWithBrush = () => {
		if (!this.mapMesh) {
			return;
		}
		const intersects = this.raycaster.intersectObject(this.mapMesh);

		for (let intersect of intersects) {
			const currentPath = [];
			if (this.pathBeingPainted.length > 0 && this.brushType === BRUSH_LINE) {
				currentPath.push(
					this.pathBeingPainted[this.pathBeingPainted.length - 1]
				);
			}
			const newPoint = {
				x:
					intersect.point.x * this.location.pixelsPerFoot +
					this.location.mapImage.width / 2,
				y:
					intersect.point.z * this.location.pixelsPerFoot +
					this.location.mapImage.height / 2,
				_id: uuidv4(),
			};
			currentPath.push(newPoint);
			this.pathBeingPainted.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.brushType,
					color: this.brushColor,
					fill: this.brushFill,
					size: this.brushSize,
					_id: this.strokeId,
				},
				false
			);
		}
	};

	stopPaintingWithBrush = () => {
		this.renderRoot.removeEventListener("mousemove", this.paintWithBrush);
		this.renderRoot.removeEventListener("mouseup", this.stopPaintingWithBrush);
		this.renderRoot.removeEventListener(
			"mouseleave",
			this.stopPaintingWithBrush
		);
		if (this.strokeId) {
			const stroke = {
				path: this.pathBeingPainted,
				type: this.brushType,
				color: this.brushColor,
				size: this.brushSize,
				fill: this.brushFill,
				_id: this.strokeId,
				strokeId: this.strokeId,
			};
			this.strokesAlreadyDrawn.push(stroke);
			// using await with this method caused freezing
			this.strokeCallback(stroke);
			this.pathBeingPainted = [];
			this.strokeId = null;
		}
	};

	updateBrushPosition = () => {
		if (!this.mapMesh || !this.paintBrushMesh) {
			return;
		}
		const intersects = this.raycaster.intersectObject(this.mapMesh);
		if (intersects.length === 0) {
			return;
		}
		const intersect = intersects[0];
		this.paintBrushMesh.position.set(intersect.point.x, 0, intersect.point.z);
	};

	paintMouseDownEvent = () => {
		this.strokeId = uuidv4();
		this.paintWithBrush();
		this.renderRoot.addEventListener("mousemove", this.paintWithBrush);
		this.renderRoot.addEventListener("mouseup", this.stopPaintingWithBrush);
		this.renderRoot.addEventListener("mouseleave", this.stopPaintingWithBrush);
	};

	getSaveState = () => {
		return {
			brushType: this.brushType,
			brushColor: this.brushColor,
			brushSize: this.brushSize,
			brushFill: this.brushFill,
			drawMeshOpacity: this.drawMeshOpacity,
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
		this.renderRoot.addEventListener("mousedown", this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.paintBrushMesh.visible = true;
		this.renderRoot.addEventListener("mousemove", this.updateBrushPosition);
	};

	disable = () => {
		this.renderRoot.removeEventListener("mousedown", this.paintMouseDownEvent);
		this.paintBrushMesh.visible = false;
	};

	tearDown = () => {
		this.disable();
		this.renderRoot.removeEventListener("mousemove", this.updateBrushPosition);
		this.scene.remove(this.drawMesh);
		this.scene.remove(this.paintBrushMesh);
	};
}
