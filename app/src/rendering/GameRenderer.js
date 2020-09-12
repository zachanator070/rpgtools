import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import { v4 as uuidv4 } from 'uuid';

export const BRUSH_CIRCLE = 'circle';
export const BRUSH_SQUARE = 'square';
export const BRUSH_ERASE = 'erase';
export const BRUSH_LINE = 'line'

export const DEFAULT_BRUSH_COLOR = '#FFFFFF';
export const DEFAULT_BRUSH_TYPE = BRUSH_LINE;
export const DEFAULT_BRUSH_FILL = true;
export const DEFAULT_BRUSH_SIZE = 5;

const DEFAULT_MAP_SIZE = 50;

export class GameRenderer{

	constructor(renderRoot, mapImage, addStroke, onProgress=() => {}, setCameraMode, setModelPosition) {

		this.setCameraMode = setCameraMode;

		this.stroke = this.stroke.bind(this);
		this.paintWithBrush = this.paintWithBrush.bind(this);
		this.stopPaintingWithBrush = this.stopPaintingWithBrush.bind(this);
		this.paintMouseDownEvent = this.paintMouseDownEvent.bind(this);
		this.tearDownPaintControls = this.tearDownPaintControls.bind(this);
		this.setupControls = this.setupControls.bind(this);

		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;
		this.setModelPosition = setModelPosition;

		this.orbitControls = null;
		this.transformControls = null;
		this.paintControlsListener = null;

		this.renderer = null;
		this.camera = null;
		this.scene = null;

		this.raycaster = null;
		this.mouseCoords = new Vector2();

		this.loader = new THREE.LoadingManager(onProgress);

		this.mapCanvas = null;
		this.mapMesh = null;
		this.mapTexture = null;

		this.drawCanvas = null;
		this.drawMesh = null;
		this.drawTexture = null;

		this.pixelsPerFoot = mapImage ? mapImage.pixelsPerFoot : 1;

		this.pathBeingPainted = [];
		this.strokeId = null;
		this.brushType = DEFAULT_BRUSH_TYPE;
		this.brushColor = DEFAULT_BRUSH_COLOR;
		this.brushFill = DEFAULT_BRUSH_FILL;
		this.brushSize = DEFAULT_BRUSH_SIZE;

		this.strokesAlreadyDrawn = [];

		this.paintBrushMesh = null;
		this.paintBrushMaterial = null;

		this.models = [];

		this.setupScene();
		this.setupControls();
		this.setupRaycaster();

		const animate = () => {
			requestAnimationFrame( animate );
			// this.orbitControls.update();
			if(this.mouseCoords){
				this.raycaster.setFromCamera( this.mouseCoords, this.camera );
			}
			this.renderer.render( this.scene, this.camera );
		}
		animate();
	}

	setBrushType(type){
		this.brushType = type;
		this.scene.remove(this.paintBrushMesh);
		this.createPaintBrushMesh(type);
		this.paintBrushMaterial.needsUpdate = true;
		this.scene.add(this.paintBrushMesh);
		this.updateBrushPosition();
	}
	setBrushColor(color){
		this.brushColor = color;
		this.paintBrushMaterial.color.setHex(parseInt('0x' + color.substr(1)));
		this.paintBrushMaterial.needsUpdate = true;
	}
	setBrushFill(fill){
		this.brushFill = fill;

		this.paintBrushMaterial.wireframe = !fill;
		this.paintBrushMaterial.needsUpdate = true;
	}
	setBrushSize(size){
		this.brushSize = size;
		this.createPaintBrushMesh();
	}

	createPaintBrushMesh(){
		if(this.paintBrushMesh){
			this.scene.remove(this.paintBrushMesh);
		}
		if(!this.paintBrushMaterial){
			this.paintBrushMaterial = new THREE.MeshBasicMaterial({color: this.brushColor});
		}
		let geometry = null;
		if(this.brushType === BRUSH_CIRCLE || this.brushType === BRUSH_LINE){
			geometry = new THREE.CylinderGeometry(this.brushSize/2, this.brushSize/2, 1, 32);
		}
		else{
			geometry = new THREE.BoxGeometry(this.brushSize, 1, this.brushSize);
		}
		this.paintBrushMesh = new THREE.Mesh(geometry, this.paintBrushMaterial);
		this.scene.add(this.paintBrushMesh);
	}

	setupScene(){

		let renderHeight = this.renderRoot.clientHeight;
		let renderWidth = this.renderRoot.clientWidth;

		this.renderRoot.addEventListener('resize', () => {
			renderHeight = this.renderRoot.clientHeight;
			renderWidth = this.renderRoot.clientWidth;
			this.camera.aspectRatio = renderWidth/renderHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( renderWidth, renderHeight );
		});

		this.scene = new THREE.Scene();

		this.scene.add(new THREE.AmbientLight(0xffffff, 1))

		// setup camera
		this.camera = new THREE.PerspectiveCamera( 75, renderWidth / renderHeight, 0.1, 10000 );
		let cameraZ = DEFAULT_MAP_SIZE;
		let cameraY = DEFAULT_MAP_SIZE;

		this.camera.position.z = cameraZ;
		this.camera.position.y = cameraY;

		this.camera.lookAt(new Vector3(0,0,0));

		this.setupMap();

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({canvas: this.renderRoot, antialias: true});
		console.log(`rendering size ${renderWidth} x ${renderHeight}`);
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );

		// setup controls
		this.orbitControls = new OrbitControls( this.camera, this.renderRoot );
		this.transformControls = new TransformControls(this.camera, this.renderRoot);
		this.transformControls.enabled = false;
		this.transformControls.addEventListener('mouseUp', async (event) => {
			const object = event.target.object;
			let modelObject = null;
			for(let model of this.models){
				if(model.mesh === object){
					modelObject = model;
				}
			}
			if(!modelObject){
				console.warn('Trying to move an object that doesnt exist!');
			}
			modelObject.positionedModel.x = object.position.x;
			modelObject.positionedModel.y = object.position.y;
			await this.setModelPosition({
				positionedModelId: modelObject.positionedModel._id,
				x: object.position.x,
				z: object.position.z,
				rotation: 0
			});
		});

	}

	setupSkyBox(){
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load( '/tavern.jpg' , (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.scene.background = texture;
		});
	}

	setupMap(){

		if(!(this.mapImage && this.pixelsPerFoot)){
			return;
		}

		if(this.mapMesh){
			this.scene.remove(this.mapMesh);
		}

		if(this.drawMesh){
			this.scene.remove(this.drawMesh);
		}

		const mapHeight = this.mapImage && this.pixelsPerFoot ? (this.mapImage.height / this.pixelsPerFoot) : DEFAULT_MAP_SIZE;
		const mapWidth = this.mapImage && this.pixelsPerFoot ? (this.mapImage.width / this.pixelsPerFoot): DEFAULT_MAP_SIZE;

		this.mapCanvas = document.createElement("canvas");
		this.mapCanvas.height = this.mapImage.height;
		this.mapCanvas.width = this.mapImage.width;

		this.drawCanvas = document.createElement("canvas");
		this.drawCanvas.height = this.mapImage.height;
		this.drawCanvas.width = this.mapImage.width;

		this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
		this.mapTexture.generateMipmaps = false;
		this.mapTexture.wrapS = this.mapTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.mapTexture.minFilter = THREE.LinearFilter;

		this.drawTexture = new THREE.CanvasTexture(this.drawCanvas);
		this.drawTexture.generateMipmaps = false;
		this.drawTexture.wrapS = this.mapTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.drawTexture.minFilter = THREE.LinearFilter;

		const mapContext = this.mapCanvas.getContext('2d');

		for(let chunk of this.mapImage.chunks){
			const base_image = new Image();
			base_image.src = `/images/${chunk.fileId}`;
			base_image.onload = () => {
				mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
				this.mapTexture.needsUpdate = true;
			}
		}

		const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
		mapGeometry.rotateX(-Math.PI/2);

		const drawGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
		drawGeometry.rotateX(-Math.PI/2);
		this.mapMesh = new THREE.Mesh( mapGeometry, new THREE.MeshStandardMaterial( { map: this.mapTexture } ));

		this.drawMesh = new THREE.Mesh( drawGeometry, new THREE.MeshStandardMaterial( { map: this.drawTexture, transparent: true } ));
		this.mapMesh.receiveShadow = true;
		this.drawMesh.receiveShadow = true;
		this.drawMesh.position.set(0, .01, 0);
		this.scene.add(this.mapMesh);
		this.scene.add(this.drawMesh);

		this.setupBrush();
	}

	setupBrush(){

		this.createPaintBrushMesh();
		this.paintBrushMesh.visible = false;

		this.renderRoot.addEventListener('mousemove', () => {
			this.updateBrushPosition();
		});
	}

	updateBrushPosition(){
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

	setupRaycaster(){

		this.raycaster = new THREE.Raycaster();

		this.renderRoot.addEventListener('mousemove', (event) => {

			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components

			this.mouseCoords.x = ( (event.offsetX) / this.renderer.domElement.width ) * 2 - 1;
			this.mouseCoords.y = -( (event.offsetY) / this.renderer.domElement.height ) * 2 + 1;


		}, false);
	}

	stroke(stroke, useCache=true){
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

	paintWithBrush(){
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
				x: intersect.point.x * this.pixelsPerFoot + this.mapImage.width / 2,
				y: intersect.point.z * this.pixelsPerFoot + this.mapImage.height / 2,
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
					size: this.brushSize * this.pixelsPerFoot,
					_id: this.strokeId
				},
				false
			);
		}
	}

	stopPaintingWithBrush(){
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

	paintMouseDownEvent(){
		this.strokeId = uuidv4();
		this.paintWithBrush();
		this.renderRoot.addEventListener('mousemove', this.paintWithBrush);
		this.renderRoot.addEventListener('mouseup', this.stopPaintingWithBrush);
		this.renderRoot.addEventListener('mouseleave', this.stopPaintingWithBrush);
	}

	setupPaintControls(){
		this.renderRoot.addEventListener('mousedown', this.paintMouseDownEvent);
		this.updateBrushPosition();
		this.paintBrushMesh.visible = true;
	}

	tearDownPaintControls(){
		this.renderRoot.removeEventListener('mousedown', this.paintMouseDownEvent);
		this.paintBrushMesh.visible = false;
	}

	tearDownOrbitControls(){
		if(this.orbitControls){
			this.orbitControls.enabled = false;
		}
	}

	setupMoveControls(){
		this.transformControls.enabled = true;
		this.transformControls.setMode('translate');
		this.transformControls.showY = false;
		this.scene.add(this.transformControls);

	}

	tearDownMoveControls(){
		this.transformControls.enabled = false;
		this.scene.remove(this.transformControls);
	}

	setupControls() {
		this.renderRoot.addEventListener('keydown', ({code}) => {
			if(!["KeyP", "KeyC", 'KeyM'].includes(code)){
				return;
			}

			this.tearDownOrbitControls();
			this.tearDownPaintControls();
			this.tearDownMoveControls();

			switch(code){
				case "KeyP":
					this.setupPaintControls();
					this.setCameraMode('painting');
					break;
				case "KeyC":
					this.orbitControls.enabled = true;
					this.setCameraMode('camera');
					break;
				case 'KeyM':
					this.setupMoveControls();
					this.setCameraMode('move model');
					break;
			}
		});
	}

	addModel(positionedModel){
		for(let model of this.models){
			if(model.positionedModel._id === positionedModel._id){
				return;
			}
		}
		const model = positionedModel.model;
		const loader = new GLTFLoader(this.loader);
		loader.load( `/models/${model.fileId}`, ( gltf ) => {

			// get bounding box and scale to match board size
			const bbox = new THREE.Box3().setFromObject(gltf.scene);
			const depthScale = model.depth / bbox.getSize().z;
			const widthScale = model.width / bbox.getSize().x;
			const heightScale = model.height / bbox.getSize().y;
			const mesh = gltf.scene;
			mesh.scale.set(widthScale, heightScale, depthScale);
			mesh.position.set(positionedModel.x, 0, positionedModel.z);
			mesh.rotation.set(0, positionedModel.rotation, 0);
			mesh.traverse((object) => {object.castShadow = true});
			this.models.push({
				positionedModel,
				mesh
			});
			this.transformControls.attach(mesh);
			this.scene.add(mesh);

		}, undefined, ( error ) => {

			console.error( error );

		} );
	}

	updateModel(positionedModel){
		let targetModel = null;
		for(let model of this.models){
			if(model.positionedModel._id === positionedModel._id){
				targetModel = model;
				break;
			}
		}
		if(!targetModel){
			console.warn('Model not added!');
			return;
		}
		targetModel.positionedModel = positionedModel;
		targetModel.mesh.position.set(positionedModel.x, 0, positionedModel.z);
		targetModel.mesh.rotation.set(0, positionedModel.rotation, 0);
	}
}
