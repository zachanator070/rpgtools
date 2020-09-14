

export class RotateControls {

	constructor(renderRoot, raycaster, mapMesh, selectControls, rotateCallback) {
		this.renderRoot = renderRoot;
		this.selectControls = selectControls;
		this.raycaster = raycaster;
		this.mapMesh = mapMesh;
		this.rotateCallback = rotateCallback;
	}

	rotateModel = () => {
		if(!this.selectControls.selectedMeshedModel){
			return;
		}
		const intersects = this.raycaster.intersectObject(this.mapMesh);
		if(intersects.length === 0){
			return;
		}
		const mapIntersect = intersects[0].point;
		this.selectControls.selectedMeshedModel.mesh.lookAt(mapIntersect);
		this.selectControls.selectedMeshedModel.positionedModel.rotation = this.selectControls.selectedMeshedModel.mesh.rotation.y;
	}

	rotateDone = () => {
		if(this.selectControls.selectedMeshedModel){
			this.rotateCallback(this.selectControls.selectedMeshedModel);
		}
		this.selectControls.clearSelection();
	}

	enable = () => {
		this.selectControls.enable();
		this.renderRoot.addEventListener('mousemove', this.rotateModel);
		this.renderRoot.addEventListener('mouseup', this.rotateDone);
	}

	disable = () => {
		this.tearDown();
		this.selectControls.disable();
	}

	tearDown = () => {
		this.selectControls.tearDown();
		this.renderRoot.removeEventListener('mousemove', this.rotateModel);
		this.renderRoot.removeEventListener('mouseup', this.rotateDone);
	}
}