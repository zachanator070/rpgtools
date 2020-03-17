import React, {useState} from 'react';
import {Button, Col, Input, List, Row, Select, Table, Tabs} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import useCurrentUser from "../../hooks/useCurrentUser";
import {LoadingView} from "../LoadingView";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCreateRole from "../../hooks/useCreateRole";
import useDeleteRole from "../../hooks/useDeleteRole";
import {
	ROLE,
} from "../../../../common/type-constants";
import {useRevokeRolePermission} from "../../hooks/useRevokeRolePermission";
import useRemoveUserRole from "../../hooks/useRemoveUserRole";
import SelectUser from "../select/SelectUser";
import useAddUserRole from "../../hooks/useAddUserRole";
import {ROLE_ADMIN} from "../../../../common/permission-constants";
import {useRevokeUserPermission} from "../../hooks/useRevokeUserPermission";
import {useGrantUserPermission} from "../../hooks/useGrantUserPermisison";
import AddRolePermission from "./AddRolePermission";

export default () => {

	const {currentUser, loading} = useCurrentUser();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {createRole, loading: createRoleLoading} = useCreateRole();
	const {revokeRolePermission} = useRevokeRolePermission();
	const {deleteRole} = useDeleteRole();
	const {removeUserRole} = useRemoveUserRole();
	const [newRoleName, setNewRoleName] = useState();
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [userIdToAdd, setUserIdToAdd] = useState(null);
	const [adminUserIdToAdd, setAdminUserIdToAdd] = useState(null);
	const {addUserRole} = useAddUserRole();
	const {revokeUserPermission} = useRevokeUserPermission();
	const {grantUserPermission} = useGrantUserPermission();

	if (loading || currentWorldLoading) {
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
				<Col span={4}></Col>
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
				<Col span={4}></Col>
			</Row>
		}
		<Row className={'margin-xlg-top'}>
			<Col span={4}></Col>

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
							<Tabs.TabPane tab="Role admins" key="4">
								<List
									dataSource={selectedRole.usersWithPermissions.filter(
										user => user.permissions.filter(
											permission => permission.permission === ROLE_ADMIN && permission.subject._id === selectedRole._id
										).length > 0
									)}
									renderItem={(item) =>
										<List.Item>
											{item.username}
											<Button
												className={'margin-md-left'}
												type={'primary'}
												onClick={async () => {
													await revokeUserPermission(item._id, item.permissions.filter(
														permission => permission.permission === ROLE_ADMIN && permission.subject._id === selectedRole._id
													)[0]._id);
												}}
												danger
											>
												<DeleteOutlined/>
											</Button>
										</List.Item>
									}
								/>
								<SelectUser onChange={setAdminUserIdToAdd}/>
								<Button
									className={'margin-md-left'}
									type={'primary'}
									onClick={async () => {
										await grantUserPermission(adminUserIdToAdd, ROLE_ADMIN, selectedRole._id, ROLE);
									}}
									disabled={adminUserIdToAdd === null}
								>
									Add Admin
								</Button>
							</Tabs.TabPane>
						}
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
			<Col span={4}></Col>
		</Row>

	</div>;
};