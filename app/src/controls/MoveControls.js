

export class MoveControls {

	constructor(renderRoot, mouseCoords, raycaster, mapMesh, models, moveCallback) {
		this.renderRoot = renderRoot;
		this.mouseCoords = mouseCoords;
		this.raycaster = raycaster;
		this.mapMesh = mapMesh;
		this.models = models;
		this.moveCallback = moveCallback;
	}

	selectObject = () => {

	}

	moveObject = () => {

	}

	moveDone = () => {

	}

	enable = () => {
		this.renderRoot.addEventListener('mousedown', this.selectObject);
		this.renderRoot.addEventListener('mousemove', this.moveObject);
		this.renderRoot.addEventListener('mouseup', this.moveDone);
	}

	disable = () => {
		this.tearDown();
	}

	tearDown = () => {
		this.renderRoot.removeEventListener('mousedown', this.selectObject);
		this.renderRoot.removeEventListener('mousemove', this.moveObject);
		this.renderRoot.removeEventListener('mouseup', this.moveDone);
	}

}