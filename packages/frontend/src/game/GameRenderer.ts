import * as THREE from "three";
import {Mesh, MeshBasicMaterial, Vector2, Vector3} from "three";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {
	DEFAULT_MAP_SIZE,
} from "./controls/PaintControls";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {Game, Image, PositionedModel} from "../types";
import {MutationMethod} from "../hooks/useGQLMutation";
import {AddStrokeVariables} from "../hooks/game/useAddStroke";
import {SetModelPositionVariables} from "../hooks/game/useSetModelPosition";
import {AddFogVariables} from "../hooks/game/useAddFogStroke";
import {Object3D} from "three/src/core/Object3D";

export const CAMERA_CONTROLS = "Camera Controls";
export const PAINT_CONTROLS = "Paint Controls";
export const MOVE_MODEL_CONTROLS = "Move Model Controls";
export const ROTATE_MODEL_CONTROLS = "Rotate Model Controls";
export const DELETE_CONTROLS = "Delete Controls";
export const FOG_CONTROLS = "Fog Controls";
export const SELECT_MODEL_CONTROLS = "Select Model Controls";
export const SELECT_LOCATION_CONTROLS = "Game Location";
export const ADD_MODEL_CONTROLS = "Add Model";

export const MAP_Y_POSITION = 0;
export const DRAW_Y_POSITION = 0.05;
export const FOG_Y_POSITION = 0.1;
export const GROUND_Y_POSITION = -0.01;

export interface MeshedModel {
	positionedModel: PositionedModel;
	mesh: any;
}

export class GameRenderer {

	public addStroke: MutationMethod<Game, AddStrokeVariables>;
	public setModelPosition: MutationMethod<Game, SetModelPositionVariables>;
	public deleteModel: (model: PositionedModel) => void;
	public addFogStroke: MutationMethod<Game, AddFogVariables>;

	private loader: THREE.LoadingManager;

	constructor(
		renderRoot: HTMLCanvasElement,
		mapImage: Image,
		addStroke: MutationMethod<Game, AddStrokeVariables>,
		onProgress = (message: string, current: number, max: number) => {},
		setModelPosition: MutationMethod<Game, SetModelPositionVariables>,
		deleteModel: (model: PositionedModel) => void,
		addFogStroke: MutationMethod<Game, AddStrokeVariables>,
		pixelsPerFoot: number
	) {
		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;
		this.setModelPosition = setModelPosition;
		this.deleteModel = deleteModel;
		this.addFogStroke = addFogStroke;

		this.mouseCoords = new Vector2();

		this.loader = new THREE.LoadingManager();
		this.loader.onProgress = onProgress;
		this.loader.onStart = async () => {
			onProgress("", 0, 1);
		};

		if(pixelsPerFoot) {
			this.pixelsPerFoot = pixelsPerFoot;
		}

		this.setupRaycaster();
		this.setupScene();

		const animate = () => {
			requestAnimationFrame(animate);
			if (this.mouseCoords) {
				this.raycaster.setFromCamera(this.mouseCoords, this.camera);
			}
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	resize = (width: number, height: number) => {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	};

	setupScene() {
		let renderHeight = this.renderRoot.clientHeight;
		let renderWidth = this.renderRoot.clientWidth;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x656970);

		this.scene.add(new THREE.AmbientLight(0xffffff, 1));

		// setup camera
		this.camera = new THREE.PerspectiveCamera(
			75,
			renderWidth / renderHeight,
			1,
			700
		);
		let cameraZ = DEFAULT_MAP_SIZE;
		let cameraY = DEFAULT_MAP_SIZE;

		this.camera.position.z = cameraZ;
		this.camera.position.y = cameraY;

		this.camera.lookAt(new Vector3(0, 0, 0));

		this.setupMap();

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.renderRoot,
			antialias: true,
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
	}

	setupLight = () => {
		if (this.light) {
			this.scene.remove(this.light);
			this.scene.remove(this.light.target);
		}
		this.light = new THREE.DirectionalLight(0xffffff, 0.25);
		this.light.position.set(100, 100, 100);
		this.light.castShadow = true;
		this.light.shadow.camera.near = 0.01;
		this.light.shadow.camera.far = 1000;
		const frustrum = 50;
		this.light.shadow.camera.left = -frustrum;
		this.light.shadow.camera.bottom = -frustrum;
		this.light.shadow.camera.right = frustrum;
		this.light.shadow.camera.top = frustrum;

		// const helper = new THREE.DirectionalLightHelper( this.light, 5 );
		// this.scene.add( helper );

		this.scene.add(this.light);
		this.scene.add(this.light.target);
	};

	setupSkyBox() {
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load("/tavern.jpg", (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			this.scene.background = texture;
		});
	}

	setupRaycaster() {
		this.raycaster = new THREE.Raycaster();

		this.renderRoot.addEventListener(
			"mousemove",
			(event) => {
				// calculate mouse position in normalized device coordinates
				// (-1 to +1) for both components

				this.mouseCoords.x =
					(event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
				this.mouseCoords.y =
					-(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
			},
			false
		);
	}
}
