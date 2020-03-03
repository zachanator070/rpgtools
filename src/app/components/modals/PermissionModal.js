import React, {useState} from 'react';
import {Radio, Modal, Tabs, List} from "antd";
import usePermissionModalVisibility from "../../hooks/usePermissionModalVisibility";
import useSetPermissionModalVisibility from "../../hooks/useSetPermissionModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {
	WIKI_PERMISSIONS,
	WORLD_PERMISSIONS,
} from "../../../permission-constants";

export const PermissionModal = () => {

	const {permissionModalVisibility} = usePermissionModalVisibility();
	const {setPermissionModalVisibility} = useSetPermissionModalVisibility();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const allCurrentWiki = useCurrentWiki();
	const {currentWiki, loading: currentWikiLoading} = allCurrentWiki;

	let userAssignments = [];
	let roleAssignments = [];
	let permissions = [];
	let subjectName = null;
	if(currentWiki){
		permissions = WIKI_PERMISSIONS;
		subjectName = currentWiki.name;
		userAssignments = currentWiki.userPermissionAssignments;
		roleAssignments = currentWiki.rolePermissionAssignments;
	} else if(currentWorld){
		permissions = WORLD_PERMISSIONS;
		subjectName = currentWorld.name;
		userAssignments = currentWorld.userPermissionAssignments;
		roleAssignments = currentWorld.rolePermissionAssignments;
	}

	const [permissionGroup, setPermissionGroup] = useState('users');

	if(currentWorldLoading || currentWikiLoading){
		return <></>;
	}

	return (
		<Modal
			visible={permissionModalVisibility}
			title={`Permissions for ${subjectName}`}
			onCancel={async () => {
				await setPermissionModalVisibility(false);
			}}
			footer={[]}
			width={'750px'}
		>
			<Radio.Group onChange={async (e) => { await setPermissionGroup(e.target.value)}} defaultValue="users">
				<Radio.Button value="users">Users</Radio.Button>
				<Radio.Button value="roles">Roles</Radio.Button>
			</Radio.Group>
			<Tabs defaultActiveKey="1" tabPosition='left' style={{ height: '100%' }}>
				{permissions.map(permission =>
					<Tabs.TabPane
						tab={permission}
						key={permission + '.' + permissionGroup}
					>
						{permissionGroup === 'users' ?
							<List
								bordered
								dataSource={userAssignments.filter((assignment) => {
									return assignment.permission === permission
								})}
								locale={{emptyText: <div>No Users</div>}}
								renderItem={assignment => <List.Item>{assignment.user.username}</List.Item>}
							/>
							:
							<List
								bordered
								dataSource={roleAssignments.filter((assignment) => {
									return assignment.permission === permission
								})}
								locale={{emptyText: <div>No Roles</div>}}
								renderItem={assignment => <List.Item>{assignment.role.name}</List.Item>}
							/>
						}
					</Tabs.TabPane>
				)}
			</Tabs>
		</Modal>
	);
};

