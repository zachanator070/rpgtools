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
		const verticalFOV = CAMERA_FOV * Math.PI / 180;
		const horizontalFOV = (2 * Math.atan( Math.tan( verticalFOV / 2 ) * aspect ));
		let cameraZ = Math.max(
			((this.modelHeight*1.1)/2)/Math.tan(verticalFOV/2),
			((this.modelWidth*1.1)/2)/Math.tan(horizontalFOV/2),
		);
		let cameraY = this.modelHeight * .7;

		this.camera.position.set(0, cameraY, cameraZ);

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({canvas: this.renderRoot, antialias: true});
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.shadowMap.enabled = true;

		// setup controls
		this.orbitControls = new OrbitControls( this.camera, this.renderRoot );
		this.orbitControls.target = new Vector3(0, this.modelHeight / 2, 0);
		this.orbitControls.update();

		// setup light
		const directionalLight = new THREE.DirectionalLight( 0xffffff, .25 );
		directionalLight.position.set( 100, 100, 100);
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.near = .01;
		directionalLight.shadow.camera.far = 1000;
		directionalLight.shadow.camera.left = -15;
		directionalLight.shadow.camera.bottom = -15;
		directionalLight.shadow.camera.right = 15;
		directionalLight.shadow.camera.top	= 15;
		this.scene.add( directionalLight );
		this.scene.add( directionalLight.target );

		// setup ground
		const groundGeometry = new THREE.PlaneGeometry(5, 5);
		const groundMaterial = new THREE.MeshPhongMaterial({color: 0x386636});
		const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
		groundMesh.rotateX(-Math.PI/2);
		groundMesh.position.set(0, -.01, 0);
		groundMesh.receiveShadow = true;
		this.scene.add(groundMesh);


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
			gltf.scene.traverse( function( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					// child.receiveShadow = true;
				}
			});
			this.modelMesh = gltf.scene;
			this.scene.add(this.modelMesh);

		}, undefined, ( error ) => {

			console.error( error );

		} );
	}
}
