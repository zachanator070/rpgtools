import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {CameraControls} from "../controls/CameraControls";
import {DEFAULT_MAP_SIZE, PaintControls} from "../controls/PaintControls";

export class GameRenderer{

	constructor(renderRoot, mapImage, addStroke, onProgress=() => {}, setCameraMode, setModelPosition) {

		this.setCameraMode = setCameraMode;

		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;
		this.setModelPosition = setModelPosition;

		this.renderer = null;
		this.camera = null;
		this.scene = null;

		this.raycaster = null;
		this.mouseCoords = new Vector2();

		this.loader = new THREE.LoadingManager(onProgress);

		this.pixelsPerFoot = mapImage ? mapImage.pixelsPerFoot : 1;

		this.models = [];

		this.setupScene();
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

	changeControls = ({code}) => {
		if(!["KeyP", "KeyC", 'KeyM'].includes(code)){
			return;
		}

		this.cameraControls.disable();
		this.paintControls.disable();

		switch(code){
			case "KeyP":
				this.paintControls.enable();
				this.setCameraMode('painting');
				break;
			case "KeyC":
				this.cameraControls.enable();
				this.setCameraMode('camera');
				break;
			case 'KeyM':
				this.setCameraMode('move model');
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

		this.renderRoot.removeEventListener('keydown', this.changeControls);
		this.renderRoot.addEventListener('keydown', this.changeControls);
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
