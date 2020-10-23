import * as THREE from "three";

export class MoveControls {
  constructor(renderRoot, raycaster, mapMesh, selectControls, moveCallback) {
    this.renderRoot = renderRoot;
    this.raycaster = raycaster;
    this.mapMesh = mapMesh;
    this.selectControls = selectControls;
    this.moveCallback = moveCallback;
  }

  moveModel = () => {
    if (!this.selectControls.selectedMeshedModel) {
      return;
    }
    const mapIntersects = this.raycaster.intersectObject(this.mapMesh);
    if (mapIntersects.length === 0) {
      return;
    }
    const mapIntersect = mapIntersects[0].point;
    const origin = this.raycaster.camera.position;
    const hypotenuse = origin.distanceTo(mapIntersect);
    const theta = Math.asin(origin.y / hypotenuse);
    const newHypotenuseLength =
      this.selectControls.intersectionPoint.y / Math.sin(theta);
    const hypotenuseRatio = newHypotenuseLength / hypotenuse;
    const newHypotenuse = new THREE.Line3(
      mapIntersect,
      this.raycaster.camera.position
    );
    const newModelIntersection = new THREE.Vector3();
    newHypotenuse.at(hypotenuseRatio, newModelIntersection);
    const newModelPosition = new THREE.Vector3();
    const mapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    mapPlane.projectPoint(newModelIntersection, newModelPosition);
    this.selectControls.selectedMeshedModel.mesh.position.copy(
      newModelPosition
    );
  };

  moveDone = () => {
    if (this.selectControls.selectedMeshedModel) {
      this.selectControls.selectedMeshedModel.positionedModel.lookAtX +=
        this.selectControls.selectedMeshedModel.mesh.position.x -
        this.selectControls.selectedMeshedModel.positionedModel.x;
      this.selectControls.selectedMeshedModel.positionedModel.lookAtZ +=
        this.selectControls.selectedMeshedModel.mesh.position.z -
        this.selectControls.selectedMeshedModel.positionedModel.z;

      this.selectControls.selectedMeshedModel.positionedModel.x = this.selectControls.selectedMeshedModel.mesh.position.x;
      this.selectControls.selectedMeshedModel.positionedModel.z = this.selectControls.selectedMeshedModel.mesh.position.z;

      this.moveCallback(this.selectControls.selectedMeshedModel);
    }
    this.selectControls.clearSelection();
  };

  enable = () => {
    this.selectControls.enable();
    this.renderRoot.addEventListener("mousemove", this.moveModel);
    this.renderRoot.addEventListener("mouseup", this.moveDone);
  };

  disable = () => {
    this.selectControls.disable();
    this.tearDown();
  };

  tearDown = () => {
    this.selectControls.tearDown();
    this.renderRoot.removeEventListener("mousemove", this.moveModel);
    this.renderRoot.removeEventListener("mouseup", this.moveDone);
  };
}
