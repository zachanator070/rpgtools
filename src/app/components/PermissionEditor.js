import React, {useEffect, useState} from 'react';
import {Button, Col, Icon, Input, List, Modal, Radio, Row, Tabs} from "antd";
import {WIKI_PERMISSIONS, WORLD_PERMISSIONS} from "../../permission-constants";
import useCurrentWorld from "../hooks/useCurrentWorld";
import useCurrentWiki from "../hooks/useCurrentWiki";
import useCurrentUser from "../hooks/useCurrentUser";
import {useSearchUsers} from "../hooks/useSearchUsers";
import {useSearchRoles} from "../hooks/useSearchRoles";
import {useGrantUserPermission} from "../hooks/useGrantUserPermisison";
import {useGrantRolePermission} from "../hooks/useGrantRolePermission";
import {useRevokeUserPermission} from "../hooks/useRevokeUserPermission";
import {useRevokeRolePermission} from "../hooks/useRevokeRolePermission";

export default () => {

	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentWiki, loading: currentWikiLoading} = useCurrentWiki();
	const {refetch} = useCurrentUser();
	const [searchText, setSearchText] = useState('');
	const [showResults, setShowResults] = useState(false);
	const [permissionGroup, setPermissionGroup] = useState('users');
	const {grantUserPermission} = useGrantUserPermission();
	const {grantRolePermission} = useGrantRolePermission();
	const {revokeUserPermission} = useRevokeUserPermission();
	const {revokeRolePermission} = useRevokeRolePermission();
	const {searchUsers, users} = useSearchUsers();
	const {searchRoles, roles} = useSearchRoles();
	const [permissionAssigneeId, setPermissionAssigneeId] = useState(null);
	const [selectedPermission, setSelectedPermission] = useState(null);

	const hideDropdown = (event) => {
		if (!event.target.matches('.searchResult') && !event.target.matches('.ant-input') && !event.target.matches('.ant-list-item-content')) {
			setShowResults(false);
		}
	};

	useEffect(() => {
		window.addEventListener('mousedown', hideDropdown);
		return () => {
			window.removeEventListener('mousedown', hideDropdown);
		}
	});

	const updateAssigneeId = async () => {
		if(permissionGroup === 'users'){
			for(let user of users){
				if(user.username === searchText){
					await setPermissionAssigneeId(user._id);
					return;
				}
			}
		}
		else {
			for(let role of roles){
				if(role.name === searchText){
					await setPermissionAssigneeId(role._id);
					return;
				}
			}
		}
		await setPermissionAssigneeId(null);
	};

	useEffect(() => {
		(async () => {
			await updateAssigneeId();
		})();

	}, [users, roles, permissionGroup]);

	useEffect(() => {
		(async () => {
			if(permissionGroup === 'users'){
				await searchUsers(searchText);
			}
			else {
				await searchRoles(searchText);
			}
		})();
	}, [searchText]);

	useEffect(() => {
		(async () => {
			await setSearchText('');
		})();
	}, [permissionGroup]);

	let userAssignments = [];
	let roleAssignments = [];
	let permissions = [];
	let subjectId = null;
	if(currentWiki){
		permissions = WIKI_PERMISSIONS;
		subjectId = currentWiki._id;
		userAssignments = currentWiki.userPermissionAssignments;
		roleAssignments = currentWiki.rolePermissionAssignments;
	} else if(currentWorld){
		permissions = WORLD_PERMISSIONS;
		subjectId = currentWorld._id;
		userAssignments = currentWorld.userPermissionAssignments;
		roleAssignments = currentWorld.rolePermissionAssignments;
	}

	if(currentWorldLoading || currentWikiLoading){
		return <></>;
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
									userAssignments.filter((assignment) => {
										return assignment.permission === permission
									}) : roleAssignments.filter((assignment) => {
										return assignment.permission === permission
									})
								}
								locale={{emptyText: <div>No Users</div>}}
								renderItem={(item) => {
									if(permissionGroup === 'users'){
										return (
											<List.Item key={item.permission + '.' + item.user._id}>
												{item.user.username}
												<Button className='margin-md-left' type='primary' danger='true' onClick={async () => {
													await revokeUserPermission(item.user._id, item.permission, subjectId);
													await refetch();
												}}>
													<Icon type='delete' theme='outlined'/>
												</Button>
											</List.Item>
										);
									}
									else{
										return (
											<List.Item key={item.permission + '.' + item.role._id}>
												{item.role.name}
												<Button className='margin-md-left' type='primary' danger='true' onClick={async () => {
													await revokeRolePermission(item.role._id, item.permission, subjectId);
													await refetch();
												}}>
													<Icon type='delete' theme='outlined'/>
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
			<Col span={20}>
				<Input.Search
					placeholder="input search text"
					onChange={async (event) => {
						await setSearchText(event.target.value);
						await setShowResults(true);
					}}
					onSearch={() => {}}
					onClick={async () => {await setShowResults(true);}}
					value={searchText}
					style={{width: '80%', position: 'absolute', right: '0px'}}
					type='text'
				/>
			</Col>
			<Col span={4}>
				<Button disabled={permissionAssigneeId === null} className='margin-md-left' onClick={async () => {
					let permission = selectedPermission;
					if(!permission){
						permission = permissions[0];
					}
					if(permissionGroup === 'users'){
						await grantUserPermission(permissionAssigneeId, permission, subjectId);
						await refetch();
					}
					else{
						await grantRolePermission(permissionAssigneeId, permission, subjectId);
						await refetch();
					}
				}}>Add {permissionGroup === 'users' ? 'user' : 'role'}</Button>
			</Col>
		</Row>
		<Row className='margin-md-top'>
			<Col span={4}></Col>
			<Col span={16} style={{display: showResults ? null : 'none'}}>
				<div
					style={{position: 'relative', width: '100%', zIndex: 2}}
					className='searchResult'
				>
					<List
						bordered
						className='search-results shadow-sm'
						style={{position: 'absolute', width: 'inherit'}}
						dataSource={permissionGroup === 'users' ? users : roles}
						locale={{emptyText: <div>No results :(</div>}}
						renderItem={item => (
							<a href='#' onClick={() => {
							}}>
								<List.Item
									className='searchResult'
									onClick={async () => {
										await setSearchText(item.name || item.username);
										await setShowResults(false);
									}}
								>
									<div className='searchResult'>
										{item.name || item.username}
									</div>
								</List.Item>
							</a>
						)}
					>
					</List>
				</div>
			</Col>
			<Col span={4}></Col>
		</Row>
	</>;
};