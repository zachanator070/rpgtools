import {ObjectLoader, Vector3} from "three";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

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

		this.loader = new THREE.LoadingManager(() => onProgress(false));
		this.loader.onStart = () => onProgress(true);

		this.modelMesh = null;
		this.originalModelMesh = null;
		this.modelColor = null;

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

	// calculate distance to get everything in view
	positionCamera() {

		const verticalFOV = CAMERA_FOV * Math.PI / 180;
		const horizontalFOV = (2 * Math.atan( Math.tan( verticalFOV / 2 ) * this.aspect ));
		let cameraZ = Math.max(
			((this.modelHeight*1.1)/2)/Math.tan(verticalFOV/2),
			((this.modelWidth*1.1)/2)/Math.tan(horizontalFOV/2),
		);
		let cameraY = this.modelHeight * .7;

		this.camera.position.set(0, cameraY, cameraZ);
		this.orbitControls.target = new Vector3(0, this.modelHeight / 2, 0);
		this.orbitControls.update();
	}

	setupScene(){

		let renderHeight = this.renderRoot.clientHeight;
		let renderWidth = this.renderRoot.clientWidth;

		this.renderRoot.addEventListener('resize', () => {
			renderHeight = this.renderRoot.clientHeight;
			renderWidth = this.renderRoot.clientWidth;
			this.aspect = renderWidth/renderHeight
			this.camera.aspectRatio = this.aspect;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( renderWidth, renderHeight );
		});

		this.scene = new THREE.Scene();

		this.scene.add(new THREE.AmbientLight(0xffffff, 1))

		// setup camera
		this.aspect = renderWidth / renderHeight
		this.camera = new THREE.PerspectiveCamera( CAMERA_FOV, this.aspect, 0.1, 10000 );

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({canvas: this.renderRoot, antialias: true});
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.shadowMap.enabled = true;

		// setup controls
		this.orbitControls = new OrbitControls( this.camera, this.renderRoot );
		this.orbitControls.target = new Vector3(0, this.modelHeight / 2, 0);
		this.orbitControls.update();

		this.positionCamera();

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
		groundMesh.material.side = THREE.DoubleSide;
		this.scene.add(groundMesh);


	}

	setModel(modelUrl){
		if(this.modelMesh){
			this.scene.remove(this.modelMesh);
			this.modelMesh = null;
		}
		this.positionCamera();

		const extension = modelUrl.split('.').pop();

		const loader = extension === 'glb' ? new GLTFLoader(this.loader) : new OBJLoader(this.loader);
		loader.load( modelUrl, ( model ) => {

			// we have switched pages and the load from the last page has finished
			if(this.modelMesh){
				return;
			}

			const loadedModel = extension === 'glb' ? model.scene : model;

			// get bounding box and scale to match board size
			const bbox = new THREE.Box3().setFromObject(loadedModel);
			const depthScale = this.modelDepth / bbox.getSize().z;
			const widthScale = this.modelWidth / bbox.getSize().x;
			const heightScale = this.modelHeight / bbox.getSize().y;
			loadedModel.scale.set(widthScale, heightScale, depthScale);
			loadedModel.traverse( function( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
				}
			});

			this.modelMesh = loadedModel;
			this.scene.add(this.modelMesh);
			// give obj a mesh with gray color
			if(extension === 'obj'){
				this.modelMesh.traverse( function( child ) {
					if ( child.isMesh ) {
						child.material.color.setHex( parseInt('0x787878') );
					}
				});
			}

			this.originalModelMesh = this.modelMesh.clone();
			this.originalModelMesh.traverse((node) => {
				if (node.isMesh) {
					node.material = node.material.clone();
				}
			});

			if(this.modelColor){
				this.setModelColor(this.modelColor);
			}

		}, undefined, ( error ) => {

			console.error( error );

		} );
	}

	setModelColor(color){
		this.modelColor = color;
		if(!this.modelMesh){
			return;
		}
		if(color){
			this.modelMesh.traverse( function( child ) {
				if ( child.isMesh ) {
					child.material.color.setHex( parseInt('0x' + color.substr(1)) );
				}
			});
		}
		else {
			this.scene.remove(this.modelMesh);
			this.modelMesh = this.originalModelMesh.clone();
			this.modelMesh.traverse((node) => {
				if (node.isMesh) {
					node.material = node.material.clone();
				}
			});
			this.scene.add(this.modelMesh);
		}

	}
}
