import React, {Component} from 'react';
import {Button, Checkbox, Modal, Select, Table} from "antd";

class WorldPermissionsModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			userToAdd: null
		};
	}

	addReadUser = (userId) => {
		const world = Object.assign({}, this.props.currentWorld);
		world.readUsers = world.readUsers.map(user => user._id);
		world.writeUsers = world.writeUsers.map(user => user._id);
		world.readUsers.push(userId);
		this.props.updateWorld(world);
	};

	removeReadUser = (userId) => {
		const world = Object.assign({}, this.props.currentWorld);
		world.readUsers = world.readUsers.map(user => user._id);
		world.writeUsers = world.writeUsers.map(user => user._id);
		world.readUsers = world.readUsers.filter(id => id !== userId);
		this.props.updateWorld(world);
	};

	addWriteUser = (userId) => {
		const world = Object.assign({}, this.props.currentWorld);
		world.readUsers = world.readUsers.map(user => user._id);
		world.writeUsers = world.writeUsers.map(user => user._id);
		world.writeUsers.push(userId);
		this.props.updateWorld(world);
	};

	removeWriteUser = (userId) => {
		const world = Object.assign({}, this.props.currentWorld);
		world.readUsers = world.readUsers.map(user => user._id);
		world.writeUsers = world.writeUsers.map(user => user._id);
		world.writeUsers = world.writeUsers.filter(id => id !== userId);
		this.props.updateWorld(world);
	};

	render() {
		if (!this.props.currentWorld) {
			return (<div></div>);
		}

		const currentUserIsOwner = this.props.currentUser && this.props.currentUser._id === this.props.currentWorld.owner._id;

		const userData = [];

		for (let user of this.props.currentWorld.readUsers) {
			user.canRead = true;
			userData.push(user);
		}

		for (let user of this.props.currentWorld.writeUsers) {
			let currentUser = userData.find(otherUser => otherUser._id === user._id);
			if (!currentUser) {
				currentUser = Object.assign({}, user);
				currentUser.canWrite = true;
				userData.push(currentUser);
			} else {
				currentUser.canWrite = true;
			}
		}

		const columns = [
			{
				title: 'Display Name',
				dataIndex: 'displayName',
				key: 'displayName',
			},
			{
				title: 'Read Permission',
				key: 'readPermission',
				render: user => {
					const attributes = {
						checked: false
					};
					if (user.canRead) {
						attributes.checked = true;
					}
					if (!this.props.currentWorld.canWrite || user.canWrite) {
						attributes.disabled = true;
					}
					return <Checkbox {...attributes} onChange={(event) => {
						if (event.target.checked) {
							this.addReadUser(user._id);
						} else {
							this.removeReadUser(user._id);
						}
					}}/>
				}
			},
			{
				title: 'Write Permission',
				key: 'writePermission',
				render: user => {
					const attributes = {
						checked: false
					};
					if (user.canWrite) {
						attributes.checked = true;
					}
					if (!this.props.currentWorld.canWrite) {
						attributes.disabled = true;
					}
					return <Checkbox {...attributes} onChange={(event) => {
						if (event.target.checked) {
							this.addWriteUser(user._id);
						} else {
							this.removeWriteUser(user._id);
						}
					}}/>
				}
			},
		];

		const publicWorldAttributes = {
			checked: this.props.currentWorld.public,
			disabled: !currentUserIsOwner
		};

		const userAddOptions = [];
		for (let user of this.props.userSearchResults) {
			userAddOptions.push(
				<Select.Option key={user._id} value={user._id}>
					{user.displayName}
				</Select.Option>
			);
		}

		return (
			<Modal
				visible={this.props.showWorldPermissionModal}
				title="World Permissions"
				onCancel={() => {
					this.props.setShowWorldPermissionModal(false)
				}}
				footer={[]}
			>
				{
					this.props.currentWorld.canWrite ?
						<div className='padding-md'>
							Add User:
							<span className='margin-md'>
								<Select
									showSearch
									style={{width: 200}}
									placeholder="Select a user"
									optionFilterProp="children"
									onSearch={this.props.userSearch}
									defaultActiveFirstOption={false}
									showArrow={false}
									onChange={(value) => {
										this.setState({userToAdd: value})
									}}
								>
									{userAddOptions}
								</Select>
							</span>
							<Button disabled={this.state.userToAdd === null} onClick={() => {
								this.addReadUser(this.state.userToAdd)
							}} type='primary'>Add User</Button>
						</div>
						: null
				}
				<Table className='padding-md' pagination={{pageSize: 25}} columns={columns} dataSource={userData}
				       rowKey={user => user._id}/>
				<div>
					<Checkbox {...publicWorldAttributes} onChange={(event) => {
						const world = Object.assign({}, this.props.currentWorld);
						world.public = event.target.checked;
						this.props.updateWorld(world);
					}}>Public World</Checkbox>
				</div>
			</Modal>
		);
	}
}

export default WorldPermissionsModal;