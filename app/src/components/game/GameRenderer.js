import React, {useEffect, useRef} from 'react';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentGame from "../../hooks/useCurrentGame";
import {LoadingView} from "../LoadingView";
import * as THREE from "three";
import {Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

function setupScene(root, mapImage) {

	const pixelsPerFoot = 60;

	let renderHeight = root.clientHeight;
	let renderWidth = root.clientWidth;

	const mapHeight = mapImage.height / pixelsPerFoot;
	const mapWidth = mapImage.width / pixelsPerFoot;

	root.addEventListener('resize', () => {
		renderHeight = root.clientHeight;
		renderWidth = root.clientWidth;
		camera.aspectRatio = renderWidth/renderHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( renderWidth, renderHeight );
	});

	let scene = new THREE.Scene();

	// setup lights, one placed every lightDensity feet
	// const lightDensity = 50;
	// const lightY = 10;
	// for(let i = 0; i < (mapWidth / lightDensity); i++){
	// 	const lightX = (-mapWidth/2 + lightDensity / 2) + (i * lightDensity);
	// 	for(let j = 0; j < (mapHeight / lightDensity); j++){
	// 		const lightZ = (-mapHeight/2 + lightDensity / 2) + (j * lightDensity);
	// 		const light = new THREE.DirectionalLight(0xffffff, 1)
	// 		light.position.set(lightX,lightY,lightZ)
	// 		const target = new THREE.Object3D()
	// 		target.position.set(lightX,0,lightZ)
	// 		light.target = target
	// 		scene.add(light.target)
	//
	// 		light.shadow.camera.left = -lightDensity/2
	// 		light.shadow.camera.right = lightDensity/2
	// 		light.shadow.camera.top = lightDensity/2
	// 		light.shadow.camera.bottom = -lightDensity/2
	// 		light.shadow.camera.near = 0
	// 		light.shadow.camera.far = lightY + 10
	// 		light.shadow.mapSize.width = 1024
	// 		light.shadow.mapSize.height = 1024
	//
	// 		light.castShadow = true
	// 		scene.add(light);
	//
	// 		//Create a helper for the shadow camera (optional)
	// 		scene.add(new THREE.CameraHelper( light.shadow.camera ));
	// 	}
	// }

	scene.add(new THREE.AmbientLight(0xffffff, 1))

	// setup camera
	let camera = new THREE.PerspectiveCamera( 75, renderWidth / renderHeight, 0.1, 10000 );
	let cameraZ = Math.max(mapWidth, mapHeight);
	let cameraY = Math.min(mapWidth, mapHeight);

	camera.position.z = cameraZ;
	camera.position.y = cameraY;

	camera.lookAt(new Vector3(0,0,0));

	// setup map
	const mapCanvas = document.createElement("canvas");
	mapCanvas.height = mapImage.height;
	mapCanvas.width = mapImage.width;

	const mapContext = mapCanvas.getContext('2d');
	const mapTexture = new THREE.CanvasTexture(mapCanvas);

	for(let chunk of mapImage.chunks){
		const base_image = new Image();
		base_image.src = `/images/${chunk.fileId}`;
		base_image.onload = function(){
			mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
			mapTexture.needsUpdate = true;
		}
	}

	let mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
	mapGeometry.rotateX(-Math.PI/2);

	let mapMesh = new THREE.Mesh( mapGeometry, new THREE.MeshStandardMaterial( { map: mapTexture } ));
	mapMesh.receiveShadow = true;
	scene.add( mapMesh );

	// skybox
	const textureLoader = new THREE.TextureLoader();
	textureLoader.load( '/tavern_orig.jpg' , (texture) => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		scene.background = texture;
	});

	// setup model
	// minis take up a square of 5ft x 5ft
	// const miniWidth = 5;
	// const loader = new GLTFLoader();
	// loader.load( '/gundam.glb', function ( gltf ) {
	//
	// 	// get bounding box and scale to match board size
	// 	const bbox = new THREE.Box3().setFromObject(gltf.scene);
	// 	const newScale = miniWidth / Math.max(bbox.getSize().x, bbox.getSize().z);
	// 	gltf.scene.scale.set(newScale, newScale, newScale);
	// 	gltf.scene.traverse((object) => {object.castShadow = true});
	// 	scene.add( gltf.scene );
	//
	// }, undefined, function ( error ) {
	//
	// 	console.error( error );
	//
	// } );

	// setup renderer
	let renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(renderWidth, renderHeight);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	const renderElement = renderer.domElement;

	// setup controls
	const controls = new OrbitControls( camera, renderElement );

	root.appendChild( renderElement );

	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
	}
	animate();
}

function setupTestScene(root) {

	let height = root.clientHeight;
	let width = root.clientWidth;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 1000 );

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize( width, height );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	root.appendChild( renderer.domElement );

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.y = 5;
	cube.castShadow = true;
	scene.add( cube );

	const planeGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
	const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
	const plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.receiveShadow = true;
	plane.rotateX(-Math.PI/2);
	scene.add( plane );

	const light = new THREE.PointLight(0xffffff, 10, 10000);
	light.position.set(0,20,0);
	light.castShadow = true;
	scene.add( light );

	camera.position.z = 5;
	camera.position.y = 10;
	camera.lookAt(new Vector3(0,0,0));

	const controls = new OrbitControls( camera, renderer.domElement );

	// 	// skybox
	const textureLoader = new THREE.TextureLoader();
	//https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg
	textureLoader.load( '/skybox.jpg' , (texture) => {

		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.encoding = THREE.sRGBEncoding;

		scene.background = texture;

	});

	var animate = function () {
		requestAnimationFrame( animate );

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		renderer.render( scene, camera );
	};

	animate();
}

export const GameRenderer = ({children}) => {
	const webGLRoot = useRef();
	const {currentWorld, loading} = useCurrentWorld();
	const {currentGame} = useCurrentGame();

	useEffect(() => {
		setupScene(webGLRoot.current, currentWorld.wikiPage.mapImage);
		// setupTestScene(webGLRoot.current);
	}, []);

	if(loading){
		return <LoadingView/>;
	}

	return <>
		<div
			ref={webGLRoot}
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			{children}
		</div>
	</>;
};