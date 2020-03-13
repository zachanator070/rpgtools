import React, {useEffect, useState} from 'react';
import {Button, Col, Input, List, Modal, Radio, Row, Select, Tabs} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {WIKI_PERMISSIONS, WORLD_PERMISSIONS} from "../../../permission-constants";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import useCurrentUser from "../../hooks/useCurrentUser";
import {useGrantUserPermission} from "../../hooks/useGrantUserPermisison";
import {useGrantRolePermission} from "../../hooks/useGrantRolePermission";
import {useRevokeUserPermission} from "../../hooks/useRevokeUserPermission";
import {useRevokeRolePermission} from "../../hooks/useRevokeRolePermission";
import {WIKI_PAGE, WORLD} from "../../../type-constants";
import SelectUser from "../SelectUser";
import SelectRole from "../SelectRole";

export default () => {

	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentWiki, loading: currentWikiLoading} = useCurrentWiki();
	const {refetch} = useCurrentUser();
	const [permissionGroup, setPermissionGroup] = useState('users');
	const {grantUserPermission} = useGrantUserPermission();
	const {grantRolePermission} = useGrantRolePermission();
	const {revokeUserPermission} = useRevokeUserPermission();
	const {revokeRolePermission} = useRevokeRolePermission();
	const [permissionAssigneeId, setPermissionAssigneeId] = useState(null);
	const [selectedPermission, setSelectedPermission] = useState(null);

	let permissions = [];
	let subject = null;
	let subjectType = null;
	if(currentWiki){
		permissions = WIKI_PERMISSIONS;
		subject = currentWiki;
		subjectType = currentWiki.type;
	} else if(currentWorld){
		permissions = WORLD_PERMISSIONS;
		subject = currentWorld;
		subjectType = WORLD;
	} else {
		return <>Unknown Subject Type</>;
	}

	if(currentWorldLoading || currentWikiLoading){
		return <></>;
	}

	let userPermissions = [];
	for(let user of subject.usersWithPermissions){
		for(let permission of user.permissions){
			if(permission.subject._id === subject._id){
				userPermissions.push({user: user, permission: permission});
			}
		}
	}

	let rolePermissions = [];
	for(let role of currentWorld.roles){
		for(let permission of role.permissions){
			if(permission.subject._id === subject._id){
				rolePermissions.push({role: role, permission: permission});
			}
		}
	}

	return <>
		<Row>
			<Col span={4}></Col>
			<Col span={16} style={{textAlign: 'center'}}>
				<Radio.Group onChange={async (e) => { await setPermissionGroup(e.target.value)}} defaultValue="users">
					<Radio.Button value="users">Users</Radio.Button>
					<Radio.Button value="roles">Roles</Radio.Button>
				</Radio.Group>
			</Col>
			<Col span={4}></Col>
		</Row>
		<Row className='margin-md-top'>
			<Col span={24}>
				<Tabs defaultActiveKey="1" tabPosition='left' style={{ height: '100%'}} onChange={async (tab) => { await setSelectedPermission(tab)}}>
					{permissions.map(permission =>
						<Tabs.TabPane
							tab={permission}
							key={permission}
						>
							<List
								bordered
								dataSource={permissionGroup === 'users' ?
									userPermissions.filter(
										rolePermission => rolePermission.permission.permission === permission
									).map(
										userPermission => userPermission.user
									).filter(
										(user, currentIndex, self) => self.findIndex(otherUser => otherUser._id === user._id) === currentIndex)
									:
									rolePermissions.filter(
										rolePermission => rolePermission.permission.permission === permission
									).map(
										rolePermission => rolePermission.role
									).filter(
										(role, currentIndex, self) => self.findIndex(otherRole => otherRole._id === role._id) === currentIndex)
								}
								locale={{emptyText: <div>No Users</div>}}
								renderItem={(item) => {
									if(permissionGroup === 'users'){
										return (
											<List.Item key={permission + '.' + item._id}>
												{item.username}
												<Button className='margin-md-left' type='primary' danger='true' onClick={async () => {
													await revokeUserPermission(item._id, item.permissions.filter(userPermission => userPermission.permission === permission)[0]._id);
													await refetch();
												}}>
													<DeleteOutlined />
												</Button>
											</List.Item>
										);
									}
									else{
										return (
											<List.Item key={permission + '.' + item._id}>
												{item.name}
												<Button className='margin-md-left' type='primary' danger='true' onClick={async () => {
													await revokeRolePermission(item._id, item.permissions.filter(userPermission => userPermission.permission === permission)[0]._id);
													await refetch();
												}}>
													<DeleteOutlined />
												</Button>
											</List.Item>
										);

									}
								}}
							/>
						</Tabs.TabPane>
					)}
				</Tabs>
			</Col>
		</Row>

		<Row className='margin-md-top'>
			<Col span={20} style={{textAlign: 'right'}}>
				{permissionGroup === 'users' ?
					<SelectUser
						onChange={async (value) => {
							await setPermissionAssigneeId(value);
						}}
					/>
					:
					<SelectRole
						onChange={async (value) => {
							await setPermissionAssigneeId(value);
						}}
					/>
				}
			</Col>
			<Col span={4}>
				<Button disabled={permissionAssigneeId === null} className='margin-md-left' onClick={async () => {
					let permission = selectedPermission;
					if(!permission){
						permission = permissions[0];
					}
					if(permissionGroup === 'users'){
						await grantUserPermission(permissionAssigneeId, permission, subject._id, subjectType);
						await refetch();
					}
					else{
						await grantRolePermission(permissionAssigneeId, permission, subject._id, subjectType);
						await refetch();
					}
				}}>Add {permissionGroup === 'users' ? 'user' : 'role'}</Button>
			</Col>
		</Row>
	</>;
};