import React, {Component} from 'react';
import {Button, Modal} from "antd";
import WorldSelect from "../worldselect";

class SelectWorldModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedWorld: props.currentWorld
		};
	}

	setSelectedWorld = (world) => {
		this.setState({
			selectedWorld: world
		});
	};

	render() {
		return (
			<Modal
				title="Select a World"
				visible={this.props.show}
				onCancel={() => {
					this.props.showSelectWorldModal(false)
				}}
				footer={[
					<Button
						type={'primary'}
						key='select button'
						onClick={() => {
							this.props.submitSelectWorldModal(this.state.selectedWorld._id);
						}}
						disabled={this.state.selectedWorld === null}
					>
						Select
					</Button>
				]}
			>
				<WorldSelect
					setSelectedWorld={this.setSelectedWorld}
					selectedWorld={this.state.selectedWorld}
					availableWorlds={this.props.availableWorlds}
				/>
			</Modal>
		);
	}
}

export default SelectWorldModal;