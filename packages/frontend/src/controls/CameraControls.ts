import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GameControls } from "./GameControls";
import THREE from "three";

export class CameraControls implements GameControls {
	private enabled: boolean;
	private controls: OrbitControls;
	private renderRoot: HTMLCanvasElement;
	private camera: THREE.PerspectiveCamera;

	constructor(renderRoot, camera) {
		this.renderRoot = renderRoot;
		this.camera = camera;
		this.controls = new OrbitControls(this.camera, this.renderRoot);
	}

	enable = () => {
		this.controls.enabled = true;
	};

	disable = () => {
		this.controls.enabled = false;
	};

	tearDown = () => {
		this.controls.dispose();
	};
}
