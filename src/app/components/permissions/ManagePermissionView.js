import React, {useState} from 'react';
import {Button, Col, Input, List, Row, Select, Table, Tabs} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import useCurrentUser from "../../hooks/useCurrentUser";
import {LoadingView} from "../LoadingView";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {EVERYONE} from "../../../role-constants";
import useCreateRole from "../../hooks/useCreateRole";
import useDeleteRole from "../../hooks/useDeleteRole";
import {ALL_WIKI_TYPES, ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "../../../type-constants";
import {useRevokeRolePermission} from "../../hooks/useRevokeRolePermission";
import useRemoveUserRole from "../../hooks/useRemoveUserRole";
import SelectUser from "../SelectUser";
import useAddUserRole from "../../hooks/useAddUserRole";
import {ROLE_ADMIN, ROLE_ADMIN_ALL} from "../../../permission-constants";
import {useRevokeUserPermission} from "../../hooks/useRevokeUserPermission";

export default () => {

	const {currentUser, loading, refetch} = useCurrentUser();
	const {currentWorld} = useCurrentWorld();
	const {createRole, loading: createRoleLoading} = useCreateRole();
	const {revokeRolePermission} = useRevokeRolePermission();
	const {deleteRole} = useDeleteRole();
	const {removeUserRole} = useRemoveUserRole();
	const [newRoleName, setNewRoleName] = useState();
	const [selectedRoleId, setSelectedRoleId] = useState(null);
	const [userIdToAdd, setUserIdToAdd] = useState(null);
	const {addUserRole} = useAddUserRole();
	const {revokeUserPermission} = useRevokeUserPermission();

	if (loading) {
		return <LoadingView/>;
	}

	const getPermissionSubjectName = (assignment) => {

		if (assignment.subjectType === WORLD) {
			return `World: ${assignment.subject.name}`;
		} else if (ALL_WIKI_TYPES.includes(assignment.subjectType) || assignment.subjectType === WIKI_PAGE) {
			return `Wiki Page: ${assignment.subject.name}`;
		} else if (assignment.subjectType === WIKI_FOLDER) {
			return `Wiki Folder: ${assignment.subject.name}`;
		} else if (assignment.subjectType === ROLE) {
			return `Role: ${assignment.subject.name}`;
		}
		return null;
	};

	const permissionAssignments = [];
	if (currentUser) {
		for (let assignment of currentUser.permissions) {
			const subjectName = getPermissionSubjectName(assignment);
			if (!subjectName) {
				continue;
			}
			permissionAssignments.push({
				permission: assignment.permission,
				subject: subjectName,
				key: `${assignment._id}${subjectName}Direct Assignment`,
				source: 'Direct Assignment'
			});
		}

		for (let role of currentUser.roles) {
			for (let assignment of role.permissions) {
				const subjectName = getPermissionSubjectName(assignment);
				if (!subjectName) {
					continue;
				}
				const sourceName = `Role: ${role.name}`;
				permissionAssignments.push({
					permission: assignment.permission,
					subject: subjectName,
					key: `${assignment._id}${subjectName}${sourceName}`,
					source: sourceName
				});
			}
		}
	}

	let everyoneRole = null;
	for (let role of currentWorld.roles) {
		if (role.name === EVERYONE) {
			everyoneRole = role;
			break;
		}
	}

	if (everyoneRole) {
		for (let assignment of everyoneRole.permissions) {
			const subjectName = getPermissionSubjectName(assignment);
			const sourceName = `Role: ${everyoneRole.name}`;
			permissionAssignments.push({
				permission: assignment.permission,
				subject: subjectName,
				key: `${assignment._id}${subjectName}${sourceName}`,
				source: sourceName
			});
		}
	}

	let allPermissionNames = permissionAssignments.map(assignment => assignment.permission);
	allPermissionNames = [...new Set(allPermissionNames)];
	let allSubjectNames = permissionAssignments.map(assignment => assignment.subject);
	allSubjectNames = [...new Set(allSubjectNames)];
	let allSources = permissionAssignments.map(assignment => assignment.source);
	allSources = [...new Set(allSources)];

	const columns = [
		{
			title: 'Permission',
			dataIndex: 'permission',
			filters: allPermissionNames.map(permission => {
				return {text: permission, value: permission};
			}),
			onFilter: (value, record) => record.permission === value,
			filterMultiple: false,
			sorter: (a, b) => a.name < b.name,
			sortDirections: ['descend', 'ascend'],
		},
		{
			title: 'Subject',
			dataIndex: 'subject',
			filters: allSubjectNames.map(subject => {
				return {text: subject, value: subject};
			}),
			onFilter: (value, record) => record.subject === value,
			filterMultiple: false,
			sorter: (a, b) => a.subject < b.subject,
			sortDirections: ['descend', 'ascend'],
		},
		{
			title: 'Source',
			dataIndex: 'source',
			filters: allSources.map(source => {
				return {text: source, value: source};
			}),
			onFilter: (value, record) => record.source === value,
			filterMultiple: false,
			sorter: (a, b) => a.source < b.source,
			sortDirections: ['descend', 'ascend'],
		},
	];

	let selectedRole = null;
	if(selectedRoleId){
		for(let role of currentWorld.roles){
			if(role._id === selectedRoleId){
				selectedRole = role;
			}
		}
	}

	return <div className={'margin-md'}>
		<h1>Permissions</h1>
		<hr/>
		<Row className={'margin-xlg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<h2 className={'margin-lg-bottom'}>My Permissions</h2>
				<Table
					dataSource={permissionAssignments}
					columns={columns}
					pagination={false}
					scroll={{y: 250}}
				/>
			</Col>
			<Col span={4}></Col>
		</Row>

		<Row className={'margin-xlg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<h2>Add New Role</h2>
				{currentWorld.canAddRoles &&
				<div className={'flex margin-lg-top'}>
					<span>Role Name:</span>
					<div className={'margin-lg-left'}><Input value={newRoleName} onChange={async (e) => {
						await setNewRoleName(e.target.value)
					}}/></div>
					<Button className={'margin-lg-left'} disabled={createRoleLoading} onClick={async () => {
						await createRole(currentWorld._id, newRoleName);
						await refetch();
					}} type={'primary'}>Create</Button>
				</div>
				}
			</Col>
			<Col span={4}></Col>
		</Row>

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
					onChange={async value => {
						for (let role of currentWorld.roles) {
							if (role._id === value) {
								await setSelectedRoleId(role._id);
							}
						}
					}}
					filterOption={(input, option) =>
						option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
					}
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
										render: (_id, assignment) =>
											<Button
												className={'margin-md-left'} type={'primary'}
												onClick={async () => {
									               await revokeRolePermission(selectedRole._id, item._id);
												}}
											>
												<DeleteOutlined/>
											</Button>
									}
								]}
								dataSource={selectedRole.permissions.map(permission => {
									return {
										key: permission._id,
										permission: permission.permission,
										subjectType: permission.subjectType,
										subjectName: permission.subject.name
									};
								})}
								pagination={false}
								scroll={{y: 250}}
							/>
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
								>
									<DeleteOutlined/>
								</Button>
							</Tabs.TabPane>
						}
						{selectedRole.canWrite &&
							<Tabs.TabPane tab="Role admins" key="4">
								<List
									dataSource={currentWorld.usersWithPermissions.filter(
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
											>
												<DeleteOutlined/>
											</Button>
										</List.Item>
									}
								/>
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