

export class SelectControls {

	constructor(renderRoot, raycaster, meshedModels) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.meshedModels = meshedModels;

		this.selectedMeshedModel = null;
		this.intersectionPoint = null;
	}

	getAllChildren = (object) => {
		const children = [...object.children] || [];
		const returnChildren = [...children];
		for(let child of children){
			returnChildren.push(...this.getAllChildren(child));
		}
		return returnChildren;
	}

	selectModel = () => {
		if(this.selectedMeshedModel){
			return;
		}
		const allObjects = [];
		for(let model of this.meshedModels){
			allObjects.push(...this.getAllChildren(model.mesh));
			allObjects.push(model.mesh);
		}
		const intersects = this.raycaster.intersectObjects(allObjects);
		if(intersects.length === 0){
			return;
		}
		let selectedMesh = intersects[0].object;
		while(selectedMesh.parent){
			if(selectedMesh.parent.type === 'Scene'){
				break;
			}
			selectedMesh = selectedMesh.parent;
		}
		for(let meshedModel of this.meshedModels){
			if(meshedModel.mesh === selectedMesh){
				this.selectedMeshedModel = meshedModel;
				break;
			}
		}
		this.intersectionPoint = intersects[0].point;
	}

	clearSelection = () => {
		this.selectedMeshedModel = null;
		this.intersectionPoint = null;
	}

	enable = () => {
		this.renderRoot.addEventListener('mousedown', this.selectModel);
	}

	disable = () => {
		this.tearDown();
	}

	tearDown = () => {
		this.renderRoot.removeEventListener('mousedown', this.selectModel);
	}
}