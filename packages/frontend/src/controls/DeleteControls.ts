import React from "react";
import {SelectControls} from "./SelectControls";
import {PositionedModel} from "../types";
import {GameControls} from "./GameControls";

export class DeleteControls implements GameControls {

	private renderRoot: any
	private selectControls: SelectControls;
	private deleteModel: (positionedModel: PositionedModel) => void;

	constructor(renderRoot, selectControls, deleteModel) {
		this.renderRoot = renderRoot;
		this.selectControls = selectControls;
		this.deleteModel = deleteModel;
	}

	deleteModelEvent = () => {
		const meshedModel = this.selectControls.getSelectedMeshedModel();
		if (this.selectControls && meshedModel) {
			this.deleteModel(meshedModel.positionedModel);
			this.selectControls.clearSelection();
		}
	};

	enable = () => {
		this.selectControls.enable();
		this.renderRoot.addEventListener("mousedown", this.deleteModelEvent);
	};

	disable = () => {
		this.selectControls.disable();
		this.tearDown();
	};

	tearDown = () => {
		this.selectControls.tearDown();
		this.renderRoot.removeEventListener("mousedown", this.deleteModelEvent);
	};
}
