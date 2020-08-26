import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {LoadingView} from "../LoadingView";
import {Vector3} from "three";

function setupScene(root, mapImage) {

	let height = root.clientHeight;
	let width = root.clientWidth;

	root.addEventListener('resize', () => {
		height = root.clientHeight;
		width = root.clientWidth;
		camera.aspectRatio = width/height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	});

	const miniWidth = 100;

	let scene = new THREE.Scene();

	// setup lights, one at each corner and one at center

	const lightHeight = Math.max(mapImage.width, mapImage.height) / 2;

	const centerLight = new THREE.PointLight();
	centerLight.position.set( 0, lightHeight, 0);
	scene.add( centerLight );

	const topRightLight = new THREE.PointLight();
	topRightLight.position.set(mapImage.width, lightHeight, -mapImage.height);
	scene.add( topRightLight );

	const bottomRightLight = new THREE.PointLight();
	bottomRightLight.position.set( mapImage.width, lightHeight, mapImage.height);
	scene.add( bottomRightLight );

	const topLeftLight = new THREE.PointLight();
	topLeftLight.position.set( -mapImage.width, lightHeight, -mapImage.height);
	scene.add( topLeftLight );

	const bottomLeftLight = new THREE.PointLight();
	bottomLeftLight.position.set( -mapImage.width, lightHeight, mapImage.height);
	scene.add( bottomLeftLight );

	// setup camera
	let camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 10000 );
	let cameraZ = Math.max(mapImage.width, mapImage.height);
	let cameraY = Math.min(mapImage.width, mapImage.height);

	camera.position.z = cameraZ;
	camera.position.y = cameraY;

	camera.lookAt(new Vector3(0,0,0));

	// setup map
	const mapCanvas = document.createElement("canvas");
	mapCanvas.height = mapImage.height;
	mapCanvas.width = mapImage.width;

	const mapContext = mapCanvas.getContext('2d');
	const texture = new THREE.CanvasTexture(mapCanvas);

	for(let chunk of mapImage.chunks){
		const base_image = new Image();
		base_image.src = `/images/${chunk.fileId}`;
		base_image.onload = function(){
			mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
			texture.needsUpdate = true;
		}
	}

	let mapGeometry = new THREE.PlaneGeometry(mapImage.width, mapImage.height);
	mapGeometry.rotateX(-Math.PI/2);

	let mapMesh = new THREE.Mesh( mapGeometry, new THREE.MeshBasicMaterial({map: texture}), );
	scene.add( mapMesh );

	// setup model
	const loader = new GLTFLoader();
	loader.load( '/models/gundam', function ( gltf ) {

		// get bounding box and scale to match board size
		const bbox = new THREE.Box3().setFromObject(gltf.scene);
		const newScale = miniWidth / Math.max(bbox.getSize().x, bbox.getSize().z);
		gltf.scene.scale.set(newScale, newScale, newScale);
		scene.add( gltf.scene );
		// const bboxMesh = new THREE.Mesh(new THREE.BoxGeometry(bbox.getSize().x, bbox.getSize().y, bbox.getSize().z), new THREE.MeshBasicMaterial(0xff0000));

	}, undefined, function ( error ) {

		console.error( error );

	} );

	// setup renderer
	let renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height, false);

	const renderElement = renderer.domElement;

	// setup controls
	const controls = new OrbitControls( camera, renderElement );

	renderElement.onwheel = function(event) {
		event.preventDefault();

		// const scale = .02 * cameraZ;
		const scale = mapImage.width / 10;

		if (event.deltaY < 0) {
			// Zoom in
			cameraZ -= scale;
		}
		else {
			// Zoom out
			cameraZ += scale;
		}

	};

	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();

	function onMouseMove( event ) {

		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components

		mouse.x = ( event.clientX / width ) * 2 - 1;
		mouse.y = - ( event.clientY / height ) * 2 + 1;

	}

	renderElement.addEventListener('mousemove', onMouseMove);

	let mouseDown = false;
	renderElement.addEventListener('mousedown', (event) => {
		mouseDown = true;
	});

	renderElement.addEventListener('mouseup', (event) => {
		mouseDown = false;
	});

	root.appendChild( renderElement );

	function animate() {
		requestAnimationFrame( animate );

		// raycaster.setFromCamera( mouse, camera );
		// const intersections = raycaster.intersectObjects( scene.children );
		// for(let intersection of intersections){
		// 	if(mouseDown){
		// 		intersection.object.position.x = intersection.point.x;
		// 		intersection.object.position.y = intersection.point.y;
		// 	}
		//
		// }

		// controls.update();

		// const cameraSpeed = mapImage.width / 100;
		// const marginOfError = .1;
		// if(camera.position.z + marginOfError < cameraZ){
		// 	camera.position.z += cameraSpeed;
		// }
		// else if (camera.position.z - marginOfError > cameraZ){
		// 	camera.position.z -= cameraSpeed;
		// }
		renderer.render( scene, camera );
	}
	animate();
}

function setupTestScene(root) {

	console.log(`${root.clientWidth} x ${root.clientHeight}`);

	root.addEventListener('resize', () => {
		console.log(`${root.clientWidth} x ${root.clientHeight}`);
	});

	const dpi = window.devicePixelRatio;

	let height = root.clientHeight * dpi;
	let width = root.clientWidth * dpi;

	let camera = new THREE.PerspectiveCamera(75, height/width, 0, 1000);

	let scene = new THREE.Scene();

	// setup renderer
	let renderer = new THREE.WebGLRenderer({canvas: root});
	renderer.setSize(width, height, false);

	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
	}
	animate();
}

export const GameView = () => {

	const webGLRoot = useRef();
	const webGLCanvas = useRef();
	const {currentWorld, loading} = useCurrentWorld();

	useEffect(() => {
		setupScene(webGLRoot.current, currentWorld.wikiPage.mapImage);
		// setupTestScene(webGLCanvas.current);
	}, []);

	if(loading){
		return <LoadingView/>;
	}

	return <>
			<div
				ref={webGLRoot}
				style={{flexGrow:1, display: 'flex', flexDirection: 'column'}}
			>
				{/*<canvas ref={webGLCanvas} style={{flexGrow: 1}}/>*/}
			</div>
	</>;

};