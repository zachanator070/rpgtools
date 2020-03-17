import {Col, Row, Table} from "antd";
import React from "react";
import {ALL_WIKI_TYPES, ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "../../../../common/type-constants";
import {EVERYONE} from "../../../../common/role-constants";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentUser from "../../hooks/useCurrentUser";

export default () => {
	const {currentWorld} = useCurrentWorld();
	const {currentUser} = useCurrentUser();

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

		for(let role of currentWorld.roles){
			if(role.members.findIndex(user => user._id === currentUser._id) >= 0){
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

	return <div className={'margin-md'}>
		<h1>My Permissions on {currentWorld.name}</h1>
		<hr/>
		<Row className={'margin-xlg-top'}>
			<Col span={4}></Col>
			<Col span={16}>
				<h2 className={'margin-lg-bottom'}>My Permissions</h2>
				<Table
					dataSource={permissionAssignments}
					columns={columns}
					pagination={false}
					scroll={{y: 500}}
				/>
			</Col>
			<Col span={4}></Col>
		</Row>
	</div>;
};