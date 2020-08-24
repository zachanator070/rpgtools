import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import useCurrentWorld from "../../hooks/useCurrentWorld";

function setupScene(root, mapImage) {

	const height = root.clientHeight;
	const width = root.clientWidth;

	const mapCanvas = document.createElement("canvas");
	// const mapCanvas = document.getElementById('mapCanvas');
	mapCanvas.height = mapImage.height;
	mapCanvas.width = mapImage.width;
	// document.body.appendChild(mapCanvas);

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

	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

	let geometry = new THREE.BoxGeometry(1, .666, 1);

	// let texture = new THREE.TextureLoader().load( `/images/${mapId}` );

	const materials = [
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
		new THREE.MeshBasicMaterial({map: texture}),
		new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
	];

	let cube = new THREE.Mesh( geometry, materials );

	// const loader = THREE.
	// loader.load( 'path/to/model.glb', function ( gltf ) {
	//
	// 	scene.add( gltf.scene );
	//
	// }, undefined, function ( error ) {
	//
	// 	console.error( error );
	//
	// } );

	scene.add( cube );

	let cameraZ = 5;

	camera.position.z = cameraZ;

	let renderer = new THREE.WebGLRenderer();
	renderer.setSize( width, height );

	const renderElement = renderer.domElement;

	renderElement.onwheel = function(event) {
		event.preventDefault();

		const scale = .02 * cameraZ;

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

		raycaster.setFromCamera( mouse, camera );
		const intersections = raycaster.intersectObjects( scene.children );
		for(let intersection of intersections){
			if(mouseDown){
				intersection.object.position.x = intersection.point.x;
				intersection.object.position.y = intersection.point.y;
			}

		}
		const cameraSpeed = .05;
		const marginOfError = .1;
		if(camera.position.z + marginOfError < cameraZ){
			camera.position.z += cameraSpeed;
		}
		else if (camera.position.z - marginOfError > cameraZ){
			camera.position.z -= cameraSpeed;
		}
		renderer.render( scene, camera );
	}
	animate();
}

export const GameView = () => {

	const webGLRoot = useRef();
	const {currentWorld} = useCurrentWorld();

	useEffect(() => {
		setupScene(webGLRoot.current, currentWorld.wikiPage.mapImage);
	}, []);

	return <>
			{/*<canvas*/}
			{/*	id='mapCanvas'*/}
			{/*	height={currentWorld.wikiPage.mapImage.height}*/}
			{/*	width={currentWorld.wikiPage.mapImage.width}*/}
			{/*/>*/}
			<div
			ref={webGLRoot}
			style={{height: '100%', width: '100%'}}
		/>
	</>;

};