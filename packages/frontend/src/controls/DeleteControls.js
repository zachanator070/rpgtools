import React from "react";

export class DeleteControls {
  constructor(renderRoot, selectControls, deleteModel) {
    this.renderRoot = renderRoot;
    this.selectControls = selectControls;
    this.deleteModel = deleteModel;
  }

  deleteModelEvent = () => {
    if (this.selectControls.selectedMeshedModel) {
      this.deleteModel(this.selectControls.selectedMeshedModel.positionedModel);
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
