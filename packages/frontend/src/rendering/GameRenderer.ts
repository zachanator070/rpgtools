import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CameraControls } from "../controls/CameraControls";
import {
	BRUSH_FOG,
	DEFAULT_BRUSH_SIZE,
	DEFAULT_MAP_SIZE,
	PaintControls,
} from "../controls/PaintControls";
import { MoveControls } from "../controls/MoveControls";
import { SelectControls } from "../controls/SelectControls";
import { RotateControls } from "../controls/RotateControls";
import { DeleteControls } from "../controls/DeleteControls";
import { SelectModelControls } from "../controls/SelectModelControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import EventEmitter from "events";
import {Game, Image, PositionedModel} from "../types";
import {MutationMethod} from "../hooks/useGQLMutation";
import {AddStrokeVariables} from "../hooks/game/useAddStroke";
import {SetModelPositionVariables} from "../hooks/game/useSetModelPosition";
import {AddFogVariables} from "../hooks/game/useAddFogStroke";

export const CAMERA_CONTROLS = "Camera Controls";
export const PAINT_CONTROLS = "Paint Controls";
export const MOVE_MODEL_CONTROLS = "Move Model Controls";
export const ROTATE_MODEL_CONTROLS = "Rotate Model Controls";
export const DELETE_CONTROLS = "Delete Controls";
export const FOG_CONTROLS = "Fog Controls";
export const SELECT_MODEL_CONTROLS = "Select Model Controls";
export const SELECT_LOCATION_CONTROLS = "Game Location";
export const ADD_MODEL_CONTROLS = "Add Model";

export const CONTROLS_SETUP_EVENT = "controls setup";

export const MAP_Y_POSITION = 0;
export const DRAW_Y_POSITION = 0.05;
export const FOG_Y_POSITION = 0.1;
export const GROUND_Y_POSITION = -0.01;

export interface MeshedModel {
	positionedModel: PositionedModel;
	mesh: any;
}

export class GameRenderer extends EventEmitter {

	private renderer;
	private camera;
	private scene;
	private light;
	private raycaster;
	private selectControls: SelectControls;
	public selectModelControls: SelectModelControls;
	private moveControls: MoveControls;
	private rotateControls: RotateControls;
	private paintControls: PaintControls;
	private deleteControls: DeleteControls;
	private fogControls: PaintControls;
	private meshedModels: MeshedModel[] = [];
	private originalMeshedModels = [];
	private mapMesh;
	private groundMesh;
	private mapCanvas;
	private mapTexture;
	private cameraControls: CameraControls;

	private renderRoot: HTMLCanvasElement;
	private mapImage: Image;
	private addStroke: MutationMethod<Game, AddStrokeVariables>;
	private setModelPosition: MutationMethod<Game, SetModelPositionVariables>;
	private deleteModel: (model: PositionedModel) => void;
	private addFogStroke: MutationMethod<Game, AddFogVariables>;

	private mouseCoords: Vector2;

	private currentControls = CAMERA_CONTROLS;

	private loader: THREE.LoadingManager;
	private pixelsPerFoot: number;

	private drawGrid: boolean = false;

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
		super();
		this.renderRoot = renderRoot;
		this.mapImage = mapImage;
		this.addStroke = addStroke;
		this.setModelPosition = setModelPosition;
		this.deleteModel = deleteModel;
		this.addFogStroke = addFogStroke;

		this.mouseCoords = new Vector2();
		this.currentControls = CAMERA_CONTROLS;

		this.loader = new THREE.LoadingManager();
		this.loader.onProgress = onProgress;
		this.loader.onStart = async () => {
			await onProgress("", 0, 1);
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

	resize = (width, height) => {
		this.camera.aspectRatio = width / height;
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

	setupMap() {
		if (!(this.mapImage && this.pixelsPerFoot)) {
			return;
		}

		if (this.mapMesh) {
			this.scene.remove(this.mapMesh);
		}

		if (this.groundMesh) {
			this.scene.remove(this.groundMesh);
		}

		const mapHeight =
			this.mapImage && this.pixelsPerFoot
				? this.mapImage.height / this.pixelsPerFoot
				: DEFAULT_MAP_SIZE;
		const mapWidth =
			this.mapImage && this.pixelsPerFoot
				? this.mapImage.width / this.pixelsPerFoot
				: DEFAULT_MAP_SIZE;

		this.mapCanvas = document.createElement("canvas");
		this.mapCanvas.height = this.mapImage.height;
		this.mapCanvas.width = this.mapImage.width;

		this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
		this.mapTexture.generateMipmaps = false;
		this.mapTexture.wrapS = this.mapTexture.wrapT = THREE.ClampToEdgeWrapping;
		this.mapTexture.minFilter = THREE.LinearFilter;

		this.paintMap();

		const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
		mapGeometry.rotateX(-Math.PI / 2);
		this.mapMesh = new THREE.Mesh(
			mapGeometry,
			new THREE.MeshPhongMaterial({ map: this.mapTexture })
		);

		this.mapMesh.position.set(0, MAP_Y_POSITION, 0);
		this.mapMesh.receiveShadow = true;
		this.scene.add(this.mapMesh);

		const groundGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
		groundGeometry.rotateX(Math.PI / 2);
		this.groundMesh = new THREE.Mesh(
			groundGeometry,
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);
		this.groundMesh.position.set(0, GROUND_Y_POSITION, 0);
		this.scene.add(this.groundMesh);

		this.setupControls();
		this.setupLight();
	}

	paintMap() {
		const mapContext = this.mapCanvas.getContext("2d");

		const imagesLoading: Promise<void>[] = [];

		for (let chunk of this.mapImage.chunks) {
			const base_image = new Image();
			base_image.src = `/images/${chunk.fileId}`;
			const imagePromise = new Promise<void>((resolve, reject) => {
				base_image.onload = () => {
					mapContext.drawImage(base_image, chunk.x * 250, chunk.y * 250);
					this.mapTexture.needsUpdate = true;
					resolve();
				};
			});
			imagesLoading.push(imagePromise);
		}

		Promise.all(imagesLoading).then(() => {
			if (this.drawGrid) {
				this.paintGrid();
			}
		});

		this.mapTexture.needsUpdate = true;
	}

	private paintGrid() {
		const squareSize = this.pixelsPerFoot * 5;
		const context = this.mapCanvas.getContext("2d");
		context.lineWidth = 3;
		context.strokeStyle = "#000000";
		context.beginPath();
		for (let x = 0; x < this.mapImage.width; x += squareSize) {
			context.moveTo(x, 0);
			context.lineTo(x, this.mapImage.height);
		}
		for (let y = 0; y < this.mapImage.height; y += squareSize) {
			context.moveTo(0, y);
			context.lineTo(this.mapImage.width, y);
		}
		context.stroke();

		this.mapTexture.needsUpdate = true;
	}

	setupRaycaster() {
		this.raycaster = new THREE.Raycaster();

		this.renderRoot.addEventListener(
			"mousemove",
			(event) => {
				// calculate mouse position in normalized device coordinates
				// (-1 to +1) for both components

				this.mouseCoords.x =
					(event.offsetX / this.renderer.domElement.width) * 2 - 1;
				this.mouseCoords.y =
					-(event.offsetY / this.renderer.domElement.height) * 2 + 1;
			},
			false
		);
	}

	changeControls = (mode) => {
		if (!this.mapMesh) {
			return;
		}

		this.currentControls = mode;

		this.cameraControls.disable();
		this.paintControls.disable();
		this.fogControls.disable();
		this.moveControls.disable();
		this.selectControls.disable();
		this.rotateControls.disable();
		this.deleteControls.disable();
		this.selectModelControls.disable();

		switch (mode) {
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
			case SELECT_MODEL_CONTROLS:
				this.selectModelControls.enable();
				break;
		}
	};

	setupControls() {
		if (this.cameraControls) {
			this.cameraControls.tearDown();
		}
		this.cameraControls = new CameraControls(this.renderRoot, this.camera);

		let paintControlsSaveState = null;
		if (this.paintControls) {
			paintControlsSaveState = this.paintControls.getSaveState();
			this.paintControls.tearDown();
		}
		this.paintControls = new PaintControls(
			this.renderRoot,
			this.raycaster,
			this.scene,
			this.mapMesh,
			{ pixelsPerFoot: this.pixelsPerFoot, mapImage: this.mapImage },
			async (stroke) => await this.addStroke({
				fill: stroke.fill,
				path: stroke.path,
				size: stroke.size,
				strokeId: stroke._id,
				type: stroke.type,
				color: stroke.color
			}),
			DRAW_Y_POSITION
		);
		if (paintControlsSaveState) {
			this.paintControls.loadSaveState(paintControlsSaveState);
		}

		let fogControlsSaveState = null;
		if (this.fogControls) {
			fogControlsSaveState = this.fogControls.getSaveState();
			this.fogControls.tearDown();
		}
		this.fogControls = new PaintControls(
			this.renderRoot,
			this.raycaster,
			this.scene,
			this.mapMesh,
			{ pixelsPerFoot: this.pixelsPerFoot, mapImage: this.mapImage },
			async (fogStroke) => {
				await this.addFogStroke({
					path: fogStroke.path,
					size: fogStroke.size,
					strokeId: fogStroke._id,
					type: fogStroke.type
				});
			},
			FOG_Y_POSITION
		);

		if (fogControlsSaveState) {
			this.fogControls.loadSaveState(fogControlsSaveState);
		} else {
			// load default state
			this.fogControls.setBrushFill(true);
			this.fogControls.setBrushColor("#000000");
			this.fogControls.setBrushType(BRUSH_FOG);
			this.fogControls.setBrushSize(DEFAULT_BRUSH_SIZE);
		}
		this.fogControls.setupBrush();

		if (this.selectControls) {
			this.selectControls.tearDown();
		}
		this.selectControls = new SelectControls(
			this.renderRoot,
			this.raycaster,
			this
		);

		if (this.selectModelControls) {
			this.selectModelControls.tearDown();
		}
		this.selectModelControls = new SelectModelControls(
			this.renderRoot,
			this.camera,
			this.scene,
			this.selectControls
		);

		if (this.moveControls) {
			this.moveControls.tearDown();
		}
		this.moveControls = new MoveControls(
			this.renderRoot,
			this.raycaster,
			this.mapMesh,
			this.selectControls,
			async (meshedModel) => {
				await this.setModelPosition({
					positionedModelId: meshedModel.positionedModel._id,
					x: meshedModel.positionedModel.x,
					z: meshedModel.positionedModel.z,
					lookAtX: meshedModel.positionedModel.lookAtX,
					lookAtZ: meshedModel.positionedModel.lookAtZ,
				});
			}
		);

		if (this.rotateControls) {
			this.rotateControls.tearDown();
		}
		this.rotateControls = new RotateControls(
			this.renderRoot,
			this.raycaster,
			this.mapMesh,
			this.selectControls,
			async (meshedModel) => {
				await this.setModelPosition({
					positionedModelId: meshedModel.positionedModel._id,
					x: meshedModel.positionedModel.x,
					z: meshedModel.positionedModel.z,
					lookAtX: meshedModel.positionedModel.lookAtX,
					lookAtZ: meshedModel.positionedModel.lookAtZ,
				});
			}
		);

		if (this.deleteControls) {
			this.deleteControls.tearDown();
		}
		this.deleteControls = new DeleteControls(
			this.renderRoot,
			this.selectControls,
			this.deleteModel
		);

		this.changeControls(this.currentControls);

		this.emit(CONTROLS_SETUP_EVENT);
	}

	addModel(positionedModel: PositionedModel) {
		for (let model of this.meshedModels) {
			if (model.positionedModel._id === positionedModel._id) {
				return;
			}
		}
		const model = positionedModel.model;
		// push onto cache before loading to prevent race condition from model subscription
		this.meshedModels.push({
			positionedModel: {...positionedModel},
			mesh: null,
		});

		const extension = model.fileName.split(".").pop();

		const loader =
			extension === "glb"
				? new GLTFLoader(this.loader)
				: new OBJLoader(this.loader);

		loader.load(
			`/models/${model.fileId}`,
			(loadedModel) => {
				const loadedMesh =
					extension === "glb" ? loadedModel.scene : loadedModel;

				// get bounding box and scale to match board size
				const bbox = new THREE.Box3().setFromObject(loadedMesh);
				const depthScale = model.depth / bbox.getSize().z;
				const widthScale = model.width / bbox.getSize().x;
				const heightScale = model.height / bbox.getSize().y;

				loadedMesh.scale.set(widthScale, heightScale, depthScale);
				loadedMesh.position.set(positionedModel.x, 0, positionedModel.z);
				loadedMesh.lookAt(
					new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
				);
				loadedMesh.traverse(function (child) {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});
				for (let meshedModel of this.meshedModels) {
					if (meshedModel.positionedModel._id === positionedModel._id) {
						meshedModel.mesh = loadedMesh;
						if (extension === "obj") {
							this.setModelColor(meshedModel, "#787878");
						}
						const meshedModelClone = {
							positionedModel: meshedModel.positionedModel,
							mesh: loadedMesh.clone(),
						};
						meshedModelClone.mesh.traverse((node) => {
							if (node.isMesh) {
								node.material = node.material.clone();
							}
						});
						this.originalMeshedModels.push(meshedModelClone);
						if (meshedModel.positionedModel.color) {
							this.setModelColor(
								meshedModel,
								meshedModel.positionedModel.color
							);
						}
						break;
					}
				}
				this.scene.add(loadedMesh);
			},
			undefined,
			(error) => {
				console.error(error);
			}
		);
	}

	removeModel = (positionedModel) => {
		if (
			this.selectModelControls.selectControls.selectedMeshedModel &&
			this.selectModelControls.selectControls.selectedMeshedModel
				.positionedModel._id === positionedModel._id
		) {
			this.selectModelControls.selectControls.clearSelection();
			this.selectModelControls.constructGlow();
		}
		let meshedModelToRemove = null;
		for (let meshedModel of this.meshedModels) {
			if (meshedModel.positionedModel._id === positionedModel._id) {
				meshedModelToRemove = meshedModel;
			}
		}
		if (!meshedModelToRemove) {
			console.warn("Could not find meshed model to delete");
			return;
		}
		this.meshedModels = this.meshedModels.filter(
			(meshedModel) =>
				meshedModel.positionedModel._id !==
				meshedModelToRemove.positionedModel._id
		);
		this.scene.remove(meshedModelToRemove.mesh);
	};

	updateModel(positionedModel) {
		let targetModel = null;
		let targetOriginal = null;
		for (let meshedModel of this.meshedModels) {
			if (meshedModel.positionedModel._id === positionedModel._id) {
				targetModel = meshedModel;
				break;
			}
		}
		for (let meshedModel of this.originalMeshedModels) {
			if (meshedModel.positionedModel._id === positionedModel._id) {
				targetOriginal = meshedModel;
				break;
			}
		}
		if (!targetModel || !targetOriginal) {
			console.warn("Model not added!");
			return;
		}

		targetModel.mesh.position.set(positionedModel.x, 0, positionedModel.z);
		targetModel.mesh.lookAt(
			new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
		);

		targetOriginal.mesh.position.set(positionedModel.x, 0, positionedModel.z);
		targetOriginal.mesh.lookAt(
			new Vector3(positionedModel.lookAtX, 0, positionedModel.lookAtZ)
		);

		if (targetModel.positionedModel.color !== positionedModel.color) {
			this.setModelColor(targetModel, positionedModel.color);
		}

		targetModel.positionedModel = positionedModel;

		if (
			this.selectModelControls.selectControls.selectedMeshedModel &&
			this.selectModelControls.selectControls.selectedMeshedModel
				.positionedModel._id === positionedModel._id
		) {
			this.selectModelControls.constructGlow();
		}
	}

	setModelColor = (meshedModel, color) => {
		if (color) {
			meshedModel.mesh.traverse(function (child) {
				if (child.isMesh) {
					child.material.color.setHex(parseInt("0x" + color.substr(1)));
				}
			});
		} else {
			this.scene.remove(meshedModel.mesh);
			let clonedModel = null;
			for (let model of this.originalMeshedModels) {
				if (model.positionedModel._id === meshedModel.positionedModel._id) {
					clonedModel = model;
				}
			}
			if (!clonedModel) {
				console.warn("Could not find original model");
				return;
			}
			meshedModel.mesh = clonedModel.mesh.clone();
			meshedModel.mesh.traverse((node) => {
				if (node.isMesh) {
					node.material = node.material.clone();
				}
			});
			this.scene.add(meshedModel.mesh);
		}
	};

	getPaintControls(): PaintControls {
		return this.paintControls;
	}

	getMeshedModels(): MeshedModel[] {
		return this.meshedModels;
	}

	getFogControls(): PaintControls {
		return this.fogControls;
	}

	getPixelsPerFoot(): number {
		return this.pixelsPerFoot;
	}

	setPixelsPerFoot(pixelsPerFoot: number): void {
		this.pixelsPerFoot = pixelsPerFoot;
	}

	getMapImage(): Image {
		return this.mapImage;
	}

	setMapImage(image: Image): void {
		this.mapImage = image;
	}

	setDrawGrid(drawGrid: boolean) {
		this.drawGrid = drawGrid;
		if (this.drawGrid) {
			this.paintGrid();
		} else {
			this.paintMap();
		}
	}

	getDrawGrid(): boolean {
		return this.drawGrid;
	}
}
