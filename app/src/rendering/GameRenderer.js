import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {CameraControls} from "../controls/CameraControls";
import {BRUSH_FOG, DEFAULT_MAP_SIZE, PaintControls} from "../controls/PaintControls";
import {MoveControls} from "../controls/MoveControls";
import {SelectControls} from "../controls/SelectControls";
import {RotateControls} from "../controls/RotateControls";
import {DeleteControls} from "../controls/DeleteControls";

export const CAMERA_CONTROLS = 'CAMERA_CONTROLS';
export const PAINT_CONTROLS = 'PAINT_CONTROLS';
export const MOVE_MODEL_CONTROLS = 'MOVE_MODEL_CONTROLS';
export const ROTATE_MODEL_CONTROLS = 'ROTATE_MODEL_CONTROLS';
export const DELETE_CONTROLS = 'DELETE_CONTROLS';
export const FOG_CONTROLS = 'FOG_CONTROLS';

export class GameRenderer{

	constructor(renderRoot, mapImage, addStroke, onProgress=() => {}, setModelPosition, deleteModel, addFogStroke) {

		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;
		this.setModelPosition = setModelPosition;
		this.deleteModel = deleteModel;
		this.addFogStroke = addFogStroke;

		this.renderer = null;
		this.camera = null;
		this.scene = null;

		this.raycaster = null;
		this.mouseCoords = new Vector2();

		this.selectControls = null;
		this.moveControls = null;
		this.rotateControls = null;
		this.paintControls = null;
		this.deleteControls = null;
		this.fogControls = null;

		this.currentControls = CAMERA_CONTROLS;

		this.loader = new THREE.LoadingManager();
		this.loader.onProgress = onProgress;
		this.loader.onStart = async () => { await onProgress('', 0, 1)};

		this.pixelsPerFoot = mapImage ? mapImage.pixelsPerFoot : 1;

		this.meshedModels = [];

		this.setupScene();
		this.setupRaycaster();

		const animate = () => {
			requestAnimationFrame( animate );
			if(this.mouseCoords){
				this.raycaster.setFromCamera( this.mouseCoords, this.camera );
			}
			this.renderer.render( this.scene, this.camera );
		}
		animate();
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

		const mapHeight = this.mapImage && this.pixelsPerFoot ? (this.mapImage.height / this.pixelsPerFoot) : DEFAULT_MAP_SIZE;
		const mapWidth = this.mapImage && this.pixelsPerFoot ? (this.mapImage.width / this.pixelsPerFoot): DEFAULT_MAP_SIZE;

		this.mapCanvas = document.createElement("canvas");
		this.mapCanvas.height = this.mapImage.height;
		this.mapCanvas.width = this.mapImage.width;

		this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
		this.mapTexture.generateMipmaps = false;
		this.mapTexture.wrapS = this.mapTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.mapTexture.minFilter = THREE.LinearFilter;

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

		this.mapMesh = new THREE.Mesh( mapGeometry, new THREE.MeshStandardMaterial( { map: this.mapTexture } ));

		this.scene.add(this.mapMesh);

		this.setupControls();

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

	changeControls = (mode) => {

		if(!this.mapMesh){
			return;
		}

		this.currentControls = mode;

		this.cameraControls.disable();
		this.paintControls.disable();
		this.moveControls.disable();
		this.selectControls.disable();
		this.rotateControls.disable();
		this.deleteControls.disable();
		this.fogControls.disable();

		switch(mode){
			case PAINT_CONTROLS:
				this.paintControls.enable();
				break;
			case CAMERA_CONTROLS:
				this.cameraControls.enable();
				break;
			case MOVE_MODEL_CONTROLS:
				this.moveControls.enable();
				break;
			case ROTATE_MODEL_CONTROLS:
				this.rotateControls.enable();
				break;
			case DELETE_CONTROLS:
				this.deleteControls.enable();
				break;
			case FOG_CONTROLS:
				this.fogControls.enable();
				break;
		}
	}

	setupControls() {
		if(this.cameraControls){
			this.cameraControls.tearDown();
		}
		this.cameraControls = new CameraControls(this.renderRoot, this.camera);

		if(this.paintControls){
			this.paintControls.teardown();
		}
		this.paintControls = new PaintControls(
			this.renderRoot,
			this.raycaster,
			this.scene,
			this.mapMesh,
			{pixelsPerFoot: this.pixelsPerFoot, mapImage: this.mapImage},
			this.addStroke
		);

		if(this.fogControls){
			this.fogControls.teardown();
		}
		this.fogControls = new PaintControls(
			this.renderRoot,
			this.raycaster,
			this.scene,
			this.mapMesh,
			{pixelsPerFoot: this.pixelsPerFoot, mapImage: this.mapImage},
			this.addFogStroke,
			.02
		);
		this.fogControls.brushType = BRUSH_FOG;
		this.fogControls.brushColor = '#000000';
		this.fogControls.setupBrush();

		if(this.selectControls){
			this.selectControls.tearDown();
		}
		this.selectControls = new SelectControls(this.renderRoot, this.raycaster, this.meshedModels);

		if(this.moveControls){
			this.moveControls.tearDown();
		}
		this.moveControls = new MoveControls(this.renderRoot, this.raycaster, this.mapMesh, this.selectControls, async (meshedModel) => {
			await this.setModelPosition(meshedModel.positionedModel);
		});

		if(this.rotateControls){
			this.rotateControls.tearDown();
		}
		this.rotateControls = new RotateControls(this.renderRoot, this.raycaster, this.mapMesh, this.selectControls, async (meshedModel) => {
			await this.setModelPosition(meshedModel.positionedModel);
		});

		if(this.deleteControls){
			this.deleteControls.tearDown();
		}
		this.deleteControls = new DeleteControls(this.renderRoot, this.selectControls, this.deleteModel);

		this.changeControls(this.currentControls);
	}

	addModel(positionedModel){
		for(let model of this.meshedModels){
			if(model.positionedModel._id === positionedModel._id){
				return;
			}
		}
		const model = positionedModel.model;
		const loader = new GLTFLoader(this.loader);
		// push onto cache before loading to prevent race condition from model subscription
		this.meshedModels.push({
			positionedModel,
			mesh: null
		});
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
			for(let meshedModel of this.meshedModels){
				if(meshedModel.positionedModel._id === positionedModel._id){
					meshedModel.mesh = mesh;
					break;
				}
			}
			this.scene.add(mesh);

		}, undefined, ( error ) => {

			console.error( error );

		} );
	}

	removeModel = (positionedModel) => {
		for(let meshedModel of this.meshedModels){
			if(meshedModel.positionedModel._id === positionedModel._id){
				this.scene.remove(meshedModel.mesh);
			}
		}
	}

	updateModel(positionedModel){
		let targetModel = null;
		for(let model of this.meshedModels){
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
