import { Vector3 } from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {STLLoader} from "three/examples/jsm/loaders/STLLoader";

const CAMERA_FOV = 50;

export class ModelRenderer {

	private renderRoot: any;
	private orbitControls = null;
	private renderer = null;
	private camera = null;
	private scene = null;

	private modelDepth: number;
	private modelWidth: number;
	private modelHeight: number;

	private loader = null;
	private modelMesh = null;
	private originalModelMesh = null;
	private modelColor: string = null;

	private aspect: number = 1;

	private resizeObservable: ResizeObserver;

	constructor(
		renderRoot: any,
		modelDepth: number,
		modelWidth: number,
		modelHeight: number,
		onProgress = (started: boolean) => {}
	) {
		this.renderRoot = renderRoot;
		this.resizeObservable = new ResizeObserver(() => this.resize());
		this.resizeObservable.observe(this.renderRoot);

		this.modelDepth = modelDepth;
		this.modelWidth = modelWidth;
		this.modelHeight = modelHeight;

		this.loader = new THREE.LoadingManager(() => onProgress(false));
		this.loader.onStart = () => onProgress(true);

		this.setupScene();

		const animate = () => {
			requestAnimationFrame(animate);
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	distance(x1, y1, z1, x2, y2, z2) {
		return Math.pow(
			Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2),
			0.5
		);
	}

	// calculate distance to get everything in view
	positionCamera() {
		const verticalFOV = (CAMERA_FOV * Math.PI) / 180;
		const horizontalFOV =
			2 * Math.atan(Math.tan(verticalFOV / 2) * this.aspect);
		const cameraZ = Math.max(
			(this.modelHeight * 1.1) / 2 / Math.tan(verticalFOV / 2),
			(this.modelWidth * 1.1) / 2 / Math.tan(horizontalFOV / 2)
		);
		const cameraY = this.modelHeight * 0.7;

		this.camera.position.set(0, cameraY, cameraZ);
		this.orbitControls.target = new Vector3(0, this.modelHeight / 2, 0);
		this.orbitControls.update();
	}

	resize() {
		if (this.renderRoot.parentElement.clientWidth === this.renderRoot.clientWidth) {
			return;
		}
		const renderHeight = this.renderRoot.parentElement.clientHeight;
		const renderWidth = this.renderRoot.parentElement.clientWidth;

		this.aspect = renderWidth / renderHeight;
		this.camera.aspectRatio = this.aspect;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(renderWidth, renderHeight);
	}

	resizeDimensionWithinError(oldDimension: number, newDimension: number) {
		return newDimension > (oldDimension - oldDimension * .05) && newDimension < (oldDimension + oldDimension * .05)
	}

	setupScene() {
		const renderHeight = this.renderRoot.clientHeight;
		const renderWidth = this.renderRoot.clientWidth;

		this.scene = new THREE.Scene();

		this.scene.add(new THREE.AmbientLight(0xffffff, 1));

		// setup camera
		this.aspect = renderWidth / renderHeight;
		this.camera = new THREE.PerspectiveCamera(
			CAMERA_FOV,
			this.aspect,
			0.1,
			10000
		);

		// setup renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.renderRoot,
			antialias: true,
		});
		this.renderer.setSize(renderWidth, renderHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;

		// setup controls
		this.orbitControls = new OrbitControls(this.camera, this.renderRoot);
		this.orbitControls.target = new Vector3(0, this.modelHeight / 2, 0);
		this.orbitControls.update();

		this.positionCamera();

		// setup light
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
		directionalLight.position.set(100, 100, 100);
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.near = 0.01;
		directionalLight.shadow.camera.far = 1000;
		directionalLight.shadow.camera.left = -15;
		directionalLight.shadow.camera.bottom = -15;
		directionalLight.shadow.camera.right = 15;
		directionalLight.shadow.camera.top = 15;
		this.scene.add(directionalLight);
		this.scene.add(directionalLight.target);

		// setup ground
		const groundGeometry = new THREE.PlaneGeometry(5, 5);
		const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x386636 });
		const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
		groundMesh.rotateX(-Math.PI / 2);
		groundMesh.position.set(0, -0.01, 0);
		groundMesh.receiveShadow = true;
		groundMesh.material.side = THREE.DoubleSide;
		this.scene.add(groundMesh);
	}

	setModel(modelEntity) {
		if (this.modelMesh) {
			this.scene.remove(this.modelMesh);
			this.modelMesh = null;
		}
		this.positionCamera();

		const extension = modelEntity.fileName.split(".").pop();

		let loader = null;
		if (extension === "glb") {
			loader = new GLTFLoader(this.loader)
		} else if (extension === 'stl') {
			loader = new STLLoader(this.loader);
		} else if (extension === 'obj') {
			loader = new OBJLoader(this.loader);
		} else {
			throw new Error(`Unsupported model file type ${extension}`);
		}

		loader.load(
			`/models/${modelEntity.fileId}`,
			(model) => {
				// we have switched pages and the load from the last page has finished
				if (this.modelMesh) {
					return;
				}

				let loadedModel = null;
				if (extension === "glb" ) {
					loadedModel = model.scene;
				} else if (extension === 'stl') {
					loadedModel = new THREE.Mesh(model, new THREE.MeshPhongMaterial({ color: 0x787878 }));
					loadedModel.rotateX(-Math.PI / 2);
				} else if (extension === 'obj') {
					loadedModel = model;
				}

				// get bounding box and scale to match board size
				const bbox = new THREE.Box3().setFromObject(loadedModel);
				const depthScale = this.modelDepth / bbox.getSize().z;
				const widthScale = this.modelWidth / bbox.getSize().x;
				const heightScale = this.modelHeight / bbox.getSize().y;
				loadedModel.scale.set(widthScale, heightScale, depthScale);
				loadedModel.traverse(function (child) {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});

				this.modelMesh = loadedModel;
				this.scene.add(this.modelMesh);
				// give obj a mesh with gray color
				if (extension === "obj") {
					this.modelMesh.traverse(function (child) {
						if (child.isMesh) {
							child.material.color.setHex(parseInt("0x787878"));
						}
					});
				}

				this.originalModelMesh = this.modelMesh.clone();
				this.originalModelMesh.traverse((node) => {
					if (node.isMesh) {
						node.material = node.material.clone();
					}
				});

				if (this.modelColor) {
					this.setModelColor(this.modelColor);
				}
			},
			undefined,
			(error) => {
				console.error(error);
			}
		);
	}

	setModelColor(color) {
		this.modelColor = color;
		if (!this.modelMesh) {
			return;
		}
		if (color) {
			this.modelMesh.traverse(function (child) {
				if (child.isMesh) {
					child.material.color.setHex(parseInt("0x" + color.substr(1)));
				}
			});
		} else {
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

	getModelDepth(): number {
		return this.modelDepth;
	}

	getModelHeight(): number {
		return this.modelHeight;
	}

	getModelWidth(): number {
		return this.modelWidth;
	}

	setModelDepth(depth: number) {
		this.modelDepth = depth;
	}

	setModelHeight(height: number) {
		this.modelHeight = height;
	}

	setModelWidth(width: number) {
		this.modelWidth = width;
	}
}
