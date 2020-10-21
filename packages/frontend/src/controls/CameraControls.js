import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class CameraControls {
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
