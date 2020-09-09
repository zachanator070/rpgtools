import {Vector3} from "three";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const CAMERA_FOV = 50;

export class ModelRenderer{

	constructor(renderRoot, modelDepth, modelWidth, modelHeight, onProgress=() => {}) {

		this.renderRoot = renderRoot;

		this.orbitControls = null;

		this.renderer = null;
		this.camera = null;
		this.scene = null;

		this.modelDepth = modelDepth;
		this.modelWidth = modelWidth;
		this.modelHeight = modelHeight;

		this.loader = new THREE.LoadingManager(onProgress);

		this.modelMesh = null;

		this.setupScene();

		const animate = () => {
			requestAnimationFrame( animate );
			this.renderer.render( this.scene, this.camera );
		}
		animate();
	}

	distance(x1, y1, z1, x2, y2, z2){
		return Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2), .5);
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
		const aspect = renderWidth / renderHeight
		this.camera = new THREE.PerspectiveCamera( CAMERA_FOV, aspect, 0.1, 10000 );
		// calculate distance to get everything in view
		const horizontalFOV = 2 * Math.atan( Math.tan( CAMERA_FOV / 2 ) * aspect );
		let cameraZ = Math.max(
			(this.modelHeight/2)/Math.tan(CAMERA_FOV/2),
			(this.modelWidth/2)/Math.tan(horizontalFOV/2),
		);
		let cameraY = this.modelHeight * 1.5;

		this.camera.position.z = cameraZ;
		this.camera.position.y = cameraY;

		this.camera.lookAt(new Vector3(0,0,0));

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({canvas: this.renderRoot, antialias: true});
		console.log(`rendering size ${renderWidth} x ${renderHeight}`);
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );

		// setup controls
		this.orbitControls = new OrbitControls( this.camera, this.renderRoot );

		// setup ground


	}

	setModel(modelUrl){
		if(this.modelMesh){
			this.scene.remove(this.modelMesh);
			this.modelMesh = null;
		}
		const loader = new GLTFLoader(this.loader);
		loader.load( modelUrl, ( gltf ) => {

			// get bounding box and scale to match board size
			const bbox = new THREE.Box3().setFromObject(gltf.scene);
			const depthScale = this.modelDepth / bbox.getSize().z;
			const widthScale = this.modelWidth / bbox.getSize().x;
			const heightScale = this.modelHeight / bbox.getSize().y;
			gltf.scene.scale.set(widthScale, heightScale, depthScale);
			gltf.scene.traverse((object) => {object.castShadow = true});
			this.modelMesh = gltf.scene;
			this.scene.add(this.modelMesh);

		}, undefined, ( error ) => {

			console.error( error );

		} );
	}
}
