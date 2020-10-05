

export class SelectControls {

	constructor(renderRoot, raycaster, renderer) {
		this.renderRoot = renderRoot;
		this.raycaster = raycaster;
		this.renderer = renderer;

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
		const allObjects = [];
		for(let model of this.renderer.meshedModels){
			allObjects.push(...this.getAllChildren(model.mesh));
			allObjects.push(model.mesh);
		}
		const intersects = this.raycaster.intersectObjects(allObjects);
		if(intersects.length === 0){
			this.clearSelection();
			return;
		}
		let selectedMesh = intersects[0].object;
		while(selectedMesh.parent){
			if(selectedMesh.parent.type === 'Scene'){
				break;
			}
			selectedMesh = selectedMesh.parent;
		}
		for(let meshedModel of this.renderer.meshedModels){
			if(meshedModel.mesh.id === selectedMesh.id){
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