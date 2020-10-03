
export class SelectModelControls {

    constructor(renderRoot, selectControls, selectCallback) {
        this.renderRoot = renderRoot;
        this.selectControls = selectControls;
        this.callback = selectCallback;
    }

    select = async () => {
        if(!this.selectControls.selectedMeshedModel){
            return;
        }
        await this.callback(this.selectControls.selectedMeshedModel.positionedModel);
        this.selectControls.clearSelection();
    }

    enable = () => {
        this.selectControls.enable();
        this.renderRoot.addEventListener('mousedown', this.select);
    }

    disable = () => {
        this.selectControls.disable();
        this.tearDown();
    }

    tearDown = () => {
        this.selectControls.tearDown();
        this.renderRoot.removeEventListener('mousedown', this.select);
    }

}