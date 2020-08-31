import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { v4 as uuidv4 } from 'uuid';

export const BRUSH_CIRCLE = 'circle';
export const BRUSH_SQUARE = 'square';
export const BRUSH_ERASE = 'erase';
export const BRUSH_LINE = 'line'

export const DEFAULT_BRUSH_COLOR = '#FFFFFF';
export const DEFAULT_BRUSH_TYPE = BRUSH_LINE;
export const DEFAULT_BRUSH_FILL = false;
export const DEFAULT_BRUSH_SIZE = 5;


export class GameRenderer{

	constructor(renderRoot, mapImage, addStroke) {
		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;

		this.orbitControls = null;
		this.paintControlsListener = null;

		this.renderer = null;
		this.camera = null;
		this.scene = null;

		this.raycaster = null;
		this.mouseCoords = new Vector2();
		this.mapCanvas = null;
		this.mapMesh = null;
		this.mapTexture = null;

		this.pathBeingPainted = [];
		this.strokeId = null;
		this.brushType = DEFAULT_BRUSH_TYPE;
		this.brushColor = DEFAULT_BRUSH_COLOR;
		this.fillBrush = DEFAULT_BRUSH_FILL;
		this.brushSize = DEFAULT_BRUSH_SIZE;

		this.strokesAlreadyDrawn = [];

		this.setupScene();
		this.setupControls();
		this.setupRaycaster();

		const animate = () => {
			requestAnimationFrame( animate );
			this.orbitControls.update();
			this.raycaster.setFromCamera( this.mouseCoords, this.camera );
			this.renderer.render( this.scene, this.camera );
		}
		animate();
	}

	setupScene(){
		const pixelsPerFoot = 60;

		let renderHeight = this.renderRoot.clientHeight;
		let renderWidth = this.renderRoot.clientWidth;

		const mapHeight = this.mapImage.height / pixelsPerFoot;
		const mapWidth = this.mapImage.width / pixelsPerFoot;

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
		let cameraZ = Math.max(mapWidth, mapHeight);
		let cameraY = Math.min(mapWidth, mapHeight);

		this.camera.position.z = cameraZ;
		this.camera.position.y = cameraY;

		this.camera.lookAt(new Vector3(0,0,0));

		// setup map
		this.mapCanvas = document.createElement("canvas");
		this.mapCanvas.height = this.mapImage.height;
		this.mapCanvas.width = this.mapImage.width;

		const mapContext = this.mapCanvas.getContext('2d');
		this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);

		for(let chunk of this.mapImage.chunks){
			const base_image = new Image();
			base_image.src = `/images/${chunk.fileId}`;
			base_image.onload = function(){
				mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
				this.mapTexture.needsUpdate = true;
			}
		}

		const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
		mapGeometry.rotateX(-Math.PI/2);

		const mapMesh = new THREE.Mesh( mapGeometry, new THREE.MeshStandardMaterial( { map: this.mapTexture } ));
		mapMesh.receiveShadow = true;
		this.mapMesh = mapMesh;
		this.scene.add( mapMesh );

		// skybox
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load( '/tavern.jpg' , (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.scene.background = texture;
		});

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({canvas: this.renderRoot, antialias: true});
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );

		// setup controls
		this.orbitControls = new OrbitControls( this.camera, this.renderRoot );
	}

	setupRaycaster(){
		this.renderRoot.addEventListener('mousemove', (event) => {

			this.raycaster = new THREE.Raycaster();

			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components

			this.mouseCoords.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.mouseCoords.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}, false)
	}

	stroke(stroke, useCache=true){
		const {path, type, color, fill, size, id} = stroke;
		if(useCache){
			for(let stroke of this.strokesAlreadyDrawn){
				if(stroke.id === id){
					return;
				}
			}
		}
		if(path.length === 0) {
			console.warn('Trying to stroke a path with zero length path!');
			return;
		}
		const ctx = this.renderRoot.getContext('2d');
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
						ctx.fillRect(part.x ,part.y, size, size);
					}
					else {
						ctx.lineWidth = DEFAULT_BRUSH_SIZE;
						ctx.strokeStyle = color;
						ctx.strokeRect(part.x ,part.y, size, size);
					}
				}

				break;
			case BRUSH_CIRCLE:
				for(let part of path){
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
					ctx.clearRect(part.x ,part.y, size, size);
				}
				break;
		}
		if(useCache){
			this.strokesAlreadyDrawn.push(stroke);
		}
		this.mapTexture.needsUpdate = true;
	}

	paintWithBrush(){
		const intersects = this.raycaster.intersectObjects( this.mapMesh );

		for ( let intersect of intersects ) {
			const currentPath = [];
			if(this.pathBeingPainted.path.length > 0 && this.brushType === BRUSH_LINE){
				currentPath.push(this.pathBeingPainted.path[this.pathBeingPainted.path.length - 1]);
			}
			const newPoint = {x: intersect.point.x, y: intersect.point.y};
			currentPath.push(newPoint);
			this.pathBeingPainted.path.push(newPoint);

			this.stroke(
				{
					path: currentPath,
					type: this.brushType,
					color: this.brushColor,
					fill: this.fillBrush,
					size: this.brushSize
				},
				false
			);
		}
	}

	async stopPaintingWithBrush(){
		await this.addStroke({
			path: this.pathBeingPainted,
			type: this.brushType,
			size: this.brushSize,
			color: this.brushColor,
			fill: this.fillBrush,
			id: this.strokeId
		});
		this.pathBeingPainted.path = [];
		this.strokeId = null;
	}

	setupPaintControls(){
		this.paintControlsListener = this.renderRoot.addEventListener('mousedown', () => {
			this.strokeId = uuidv4();
			this.paintWithBrush();
			const movePaintingListener = this.renderRoot.addEventListener('mousemove', () => {
				this.paintWithBrush();
			});
			const stopPaintingListener = this.renderRoot.addEventListener('mouseup', async () => {
				this.renderRoot.removeEventListener(stopPaintingListener);
				this.renderRoot.removeEventListener(movePaintingListener);
				await this.stopPaintingWithBrush();
			});

			const leavePaintingAreaListener = this.renderRoot.addEventListener('mouseleave', async () => {
				this.renderRoot.removeEventListener(leavePaintingAreaListener);
				this.renderRoot.removeEventListener(movePaintingListener);
				await this.stopPaintingWithBrush();
			});
		});
	}

	tearDownPaintControls(){
		if(this.paintControlsListener){
			this.renderRoot.removeEventListener(this.paintControlsListener);
		}
	}

	setupControls() {
		this.renderRoot.addEventListener('keydown', ({code}) => {
			if(code === 'KeyP'){
				this.setupPaintControls();
			}
			else{
				this.tearDownPaintControls();
			}
			if(code === 'KeyC'){
				if(this.orbitControls){
					this.orbitControls.enabled = true;
				}
			}
			else {
				this.orbitControls.enabled = false;
			}
		});
	}

	addModel(modelUrl){
		// setup model
		// minis take up a square of 5ft x 5ft
		const miniWidth = 5;
		const loader = new GLTFLoader();
		loader.load( modelUrl, function ( gltf ) {

			// get bounding box and scale to match board size
			const bbox = new THREE.Box3().setFromObject(gltf.scene);
			const newScale = miniWidth / Math.max(bbox.getSize().x, bbox.getSize().z);
			gltf.scene.scale.set(newScale, newScale, newScale);
			gltf.scene.traverse((object) => {object.castShadow = true});
			this.scene.add( gltf.scene );

		}, undefined, function ( error ) {

			console.error( error );

		} );
	}
}
