import React, {Component} from 'react';
import {Button, Form, Modal, Select} from "antd";

class EditPinModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			page: this.props.pin && this.props.pin.page ? this.props.page : null,
		};
	}

	save = () => {
		const newPin = {
			page: this.state.page,
			_id: this.props.pin._id
		};
		this.props.updatePin(newPin);
		this.props.showEditPinModal(false);
	};

	handleChange = (value) => {
		this.setState({
			page: value
		});
	};

	render() {
		const formItemLayout = {
			labelCol: {span: 4},
			wrapperCol: {span: 14},
		};
		const noLabelItem = {
			wrapperCol: {span: 10, offset: 4}
		};

		const options = [];
		for (let result of this.props.allWikis) {
			options.push(<Select.Option value={result._id} key={result._id}>{result.name}</Select.Option>);
		}

		return (
			<div>
				<Modal
					title="Edit Pin"
					visible={this.props.show}
					centered
					onCancel={() => {
						this.props.showEditPinModal(false);
					}}
					footer={null}
				>
					<Form layout='horizontal'>
						<Form.Item label="Page" {...formItemLayout}>
							<Select
								showSearch
								style={{width: 200}}
								placeholder="Select a Wiki Page"
								defaultValue={this.props.pinBeingEdited ? this.props.pinBeingEdited._id : null}
								optionFilterProp="children"
								onChange={this.handleChange}
								filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
							>
								{options}
							</Select>
						</Form.Item>
						<Form.Item
							{...noLabelItem}>
							<Button type="primary" htmlType="button" onClick={() => {
								this.save();
							}}>Save</Button>
							<Button className='margin-md-left' type="danger" onClick={() => {
								this.props.deletePin({_id: this.props.pin._id});
								this.props.showEditPinModal(false);
							}}>Delete</Button>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		);
	}
}

export default EditPinModal;