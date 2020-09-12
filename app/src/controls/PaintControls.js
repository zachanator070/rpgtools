import {v4 as uuidv4} from "uuid";
import {BRUSH_CIRCLE, BRUSH_ERASE, BRUSH_LINE, BRUSH_SQUARE, DEFAULT_BRUSH_SIZE} from "../rendering/GameRenderer";

export class PaintControls {

	constructor(renderRoot, raycaster, scene, mapMesh, location) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.scene = scene;
		this.mapMesh = mapMesh;
		this.drawCanvas = drawCanvas;
		this.drawTexture = drawTexture;
		this.location = location;



		this.strokesAlreadyDrawn = [];
	}

	stroke = (stroke, useCache=true) => {
		const {path, type, color, fill, size, _id} = stroke;
		if(useCache){
			for(let stroke of this.strokesAlreadyDrawn){
				if(stroke._id === _id){
					return;
				}
			}
		}
		if(path.length === 0) {
			console.warn('Trying to stroke a path with zero length path!');
			return;
		}
		const ctx = this.drawCanvas.getContext('2d');
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		switch(type){
			case BRUSH_LINE:
				ctx.strokeStyle = color;
				ctx.lineWidth = size;
				ctx.beginPath();
				if(path.length > 0){
					ctx.moveTo(path[0].x, path[0].y);
				}
				for(let part of path){
					ctx.lineTo(part.x, part.y);
				}
				ctx.stroke();
				break;
			case BRUSH_SQUARE:
				for(let part of path){
					if(fill){
						ctx.fillStyle = color;
						ctx.fillRect(part.x - size / 2 ,part.y - size / 2, size, size);
					}
					else {
						ctx.lineWidth = DEFAULT_BRUSH_SIZE;
						ctx.strokeStyle = color;
						ctx.strokeRect(part.x - size / 2, part.y - size / 2, size, size);
					}
				}

				break;
			case BRUSH_CIRCLE:
				for(let part of path){
					ctx.beginPath();
					ctx.arc(part.x, part.y, size/2, 0, Math.PI * 2);
					if(fill){
						ctx.fillStyle = color;
						ctx.fill();
					}
					else {
						ctx.lineWidth = DEFAULT_BRUSH_SIZE;
						ctx.strokeStyle = color;
						ctx.stroke();
					}
				}
				break;
			case BRUSH_ERASE:
				for(let part of path){
					ctx.clearRect(part.x - size / 2, part.y - size / 2, size, size);
				}
				break;
		}
		if(useCache){
			this.strokesAlreadyDrawn.push(stroke);
		}
		this.drawTexture.needsUpdate = true;
	}

	paintWithBrush = () => {
		if(!this.mapMesh){
			return;
		}
		const intersects = this.raycaster.intersectObject( this.mapMesh );

		for ( let intersect of intersects ) {
			const currentPath = [];
			if(this.pathBeingPainted.length > 0 && this.brushType === BRUSH_LINE){
				currentPath.push(this.pathBeingPainted[this.pathBeingPainted.length - 1]);
			}
			const newPoint = {
				x: intersect.point.x * this.location.pixelsPerFoot + this.location.mapImage.width / 2,
				y: intersect.point.z * this.location.pixelsPerFoot + this.location.mapImage.height / 2,
				_id: uuidv4()
			};
			currentPath.push(newPoint);
			this.pathBeingPainted.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.brushType,
					color: this.brushColor,
					fill: this.brushFill,
					size: this.brushSize * this.location.pixelsPerFoot,
					_id: this.strokeId
				},
				false
			);
		}
	}

	stopPaintingWithBrush = () => {
		this.renderRoot.removeEventListener('mousemove', this.paintWithBrush);
		this.renderRoot.removeEventListener('mouseup', this.stopPaintingWithBrush);
		this.renderRoot.removeEventListener('mouseleave', this.stopPaintingWithBrush);
		if(this.strokeId){
			this.strokesAlreadyDrawn.push({
				path: this.pathBeingPainted,
				type: this.brushType,
				color: this.brushColor,
				size: this.brushSize,
				fill: this.brushFill,
				_id: this.strokeId
			});
			// using await with this method caused freezing
			this.addStroke(
				this.pathBeingPainted,
				this.brushType,
				this.brushSize,
				this.brushColor,
				this.brushFill,
				this.strokeId
			);
			this.pathBeingPainted = [];
			this.strokeId = null;
		}

	}

	updateBrushPosition = () => {
		if(!this.mapMesh || !this.paintBrushMesh){
			return;
		}
		const intersects = this.raycaster.intersectObject( this.mapMesh );
		if(intersects.length === 0){
			return;
		}
		const intersect = intersects[0];
		this.paintBrushMesh.position.set(intersect.point.x, 0, intersect.point.z );
	}

	paintMouseDownEvent = () => {
		this.strokeId = uuidv4();
		this.paintWithBrush();
		this.renderRoot.addEventListener('mousemove', this.paintWithBrush);
		this.renderRoot.addEventListener('mouseup', this.stopPaintingWithBrush);
		this.renderRoot.addEventListener('mouseleave', this.stopPaintingWithBrush);
	}

	setupPaintControls = () => {
		this.renderRoot.addEventListener('mousedown', this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.paintBrushMesh.visible = true;
	}

	tearDownPaintControls = () => {
		this.renderRoot.removeEventListener('mousedown', this.paintMouseDownEvent);
		this.paintBrushMesh.visible = false;
	}
}