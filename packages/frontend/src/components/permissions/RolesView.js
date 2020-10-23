import React, {useState} from 'react';
import {Button, Col, Input, List, Row, Select, Table, Tabs} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {LoadingView} from "../LoadingView";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateRole from "../../hooks/authorization/useCreateRole";
import useDeleteRole from "../../hooks/authorization/useDeleteRole";
import {useRevokeRolePermission} from "../../hooks/authorization/useRevokeRolePermission";
import useRemoveUserRole from "../../hooks/authorization/useRemoveUserRole";
import {SelectUser} from "../select/SelectUser";
import useAddUserRole from "../../hooks/authorization/useAddUserRole";
import {AddRolePermission} from "./AddRolePermission";

export const RolesView = () => {

	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {createRole, loading: createRoleLoading} = useCreateRole();
	const {revokeRolePermission} = useRevokeRolePermission();
	const {deleteRole} = useDeleteRole();
	const {removeUserRole} = useRemoveUserRole();
	const [newRoleName, setNewRoleName] = useState();
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [userIdToAdd, setUserIdToAdd] = useState(null);
	const {addUserRole} = useAddUserRole();

	if (currentWorldLoading) {
		return <LoadingView/>;
	}

	let selectedRole = null;
	if(selectedRoleId){
		for(let role of currentWorld.roles){
			if(role._id === selectedRoleId){
				selectedRole = role;
			}
		}
	}

	return <div className={'margin-md'}>
		<h1>Roles</h1>
		<hr/>
		{currentWorld.canAddRoles &&
			<Row className={'margin-xlg-top'}>
				<Col span={4}/>
				<Col span={16}>
					<h2>
						Add New Role
					</h2>
					<div className={'flex margin-lg-top'}>
						<span>Role Name:</span>
						<div className={'margin-lg-left'}><Input value={newRoleName} onChange={async (e) => {
							await setNewRoleName(e.target.value)
						}}/></div>
						<Button className={'margin-lg-left'} disabled={createRoleLoading} onClick={async () => {
							await createRole(currentWorld._id, newRoleName);
						}} type={'primary'}>Create</Button>
					</div>
				</Col>
				<Col span={4}/>
			</Row>
		}
		<Row className={'margin-xlg-top'}>
			<Col span={4}/>

			<Col span={16}>
				<h2 className={'margin-lg-bottom'}>
					Manage Roles
				</h2>
				<span className={'margin-lg-right'}>Role:</span>
				<Select
					showSearch
					style={{width: 200}}
					placeholder="Select a role"
					optionFilterProp="children"
					value={selectedRoleId}
					onChange={setSelectedRoleId}

				>
					{currentWorld.roles.map(role =>
						<Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>)}
				</Select>
				{selectedRole ?
					<Tabs defaultActiveKey="1">
						<Tabs.TabPane tab="Permissions in this role" key="1">
							<Table
								columns={[
									{
										title: 'Permission',
										dataIndex: 'permission',
										key: 'permission'
									},
									{
										title: 'Subject Type',
										dataIndex: 'subjectType',
										key: 'subjectType'
									},
									{
										title: 'Subject Name',
										dataIndex: 'subjectName',
										key: 'subjectName'
									},
									{
										title: 'Remove Permission',
										dataIndex: '_id',
										key: '_id',
										render: (text, assignment) => {
											return assignment.canWrite ?
												<Button
													className={'margin-md-left'} type={'primary'}
													onClick={async () => {
														await revokeRolePermission(selectedRole._id, assignment.key);
													}}
													danger
												>
													<DeleteOutlined/>
												</Button>
												:
												<></>;
										}
									}
								]}
								dataSource={selectedRole.permissions.map(permission => {
									return {
										key: permission._id,
										permission: permission.permission,
										subjectType: permission.subjectType,
										subjectName: permission.subject.name,
										canWrite: permission.canWrite
									};
								})}
								pagination={false}
								scroll={{y: 250}}
							/>
							<AddRolePermission role={selectedRole}/>
						</Tabs.TabPane>
						<Tabs.TabPane tab="Users with this role" key="2">
							<List
								dataSource={selectedRole.members}
								renderItem={(item) =>
									<List.Item>
										{item.username}
										{selectedRole.canWrite &&
											<Button
												className={'margin-md-left'}
												type={'primary'}
												onClick={async () => {
													await removeUserRole(item._id, selectedRole._id);
												}}
												danger
											>
												<DeleteOutlined/>
											</Button>
										}
									</List.Item>
								}
							/>
							{selectedRole.canWrite && <>
								<SelectUser onChange={setUserIdToAdd}/>
								<Button
									className={'margin-md-left'}
									type={'primary'}
									onClick={async () => {
										await addUserRole(userIdToAdd, selectedRole._id);
									}}
									disabled={userIdToAdd === null}
								>
									Add User
								</Button>
							</>}
						</Tabs.TabPane>
						{selectedRole.canWrite &&
						<Tabs.TabPane tab="Delete this role" key="3">
							<Button
								disabled={!selectedRole.canWrite}
								className={'margin-md-left'}
								type={'primary'}
								onClick={async () => {
									await deleteRole(selectedRole._id);
									await setSelectedRoleId(null);
								}}
								danger
							>
								Delete this role
								<DeleteOutlined/>
							</Button>
						</Tabs.TabPane>
						}
					</Tabs>
					:
					<div className={'margin-md-top'}>Please select a role</div>
				}

			</Col>
			<Col span={4}/>
		</Row>

	</div>;
};