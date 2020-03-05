import React from 'react';
import {Col, List, Row, Table} from "antd";
import useCurrentUser from "../hooks/useCurrentUser";
import {LoadingView} from "./LoadingView";
import {
	ROLE_PERMISSIONS,
	WIKI_FOLDER_PERMISSIONS,
	WIKI_PERMISSIONS,
	WORLD_PERMISSIONS
} from "../../permission-constants";
import useCurrentWorld from "../hooks/useCurrentWorld";
import {EVERYONE} from "../../role-constants";

export default () => {

	const {currentUser, loading} = useCurrentUser();
	const {currentWorld} = useCurrentWorld();
	if(loading){
		return <LoadingView/>;
	}

	const getPermissionSubjectName = (permission, subjectId) => {
		if(WORLD_PERMISSIONS.includes(permission) && subjectId === currentWorld._id){
			return `World: ${currentWorld.name}`;
		}
		else if(WIKI_PERMISSIONS.includes(permission)){
			for(let folder of currentWorld.folders){
				for(let page of folder.pages){
					if(page._id === subjectId){
						return `Wiki Page: ${page.name}`;
					}
				}
			}
		}
		else if(WIKI_FOLDER_PERMISSIONS.includes(permission)){
			for(let folder of currentWorld.folders){
				if(folder._id === subjectId){
					return `Wiki Folder: ${folder.name}`;
				}
			}
		}
		else if(ROLE_PERMISSIONS.includes(permission)){
			for(let role of currentWorld.roles){
				if(role._id === subjectId){
					return `Role: ${role.name}`;
				}
			}
		}
		return null;
	};

	const permissionAssignments = [];
	if(currentUser){
		for(let assignment of currentUser.permissions){
			const subjectName = getPermissionSubjectName(assignment.permission, assignment.subjectId);
			if(!subjectName){
				continue;
			}
			permissionAssignments.push({permission: assignment.permission, subject: subjectName, key:`${assignment._id}${subjectName}Direct Assignment`, source: 'Direct Assignment'});
		}

		for(let role of currentUser.roles){
			for(let assignment of role.permissions){
				const subjectName = getPermissionSubjectName(assignment.permission, assignment.subjectId);
				if(!subjectName){
					continue;
				}
				const sourceName = `Role: ${role.name}`;
				permissionAssignments.push({permission: assignment.permission, subject: subjectName, key:`${assignment._id}${subjectName}${sourceName}`, source: sourceName});
			}
		}
	}

	let everyoneRole = null;
	for(let role of currentWorld.roles){
		if(role.name === EVERYONE){
			everyoneRole = role;
			break;
		}
	}

	if(everyoneRole){
		for(let assignment of everyoneRole.permissions){
			const subjectName = getPermissionSubjectName(assignment.permission, assignment.subjectId);
			const sourceName = `Role: ${everyoneRole.name}`;
			permissionAssignments.push({permission: assignment.permission, subject: subjectName, key:`${assignment._id}${subjectName}${sourceName}`, source: sourceName});
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
			filters: allPermissionNames.map(permission => {return {text: permission, value: permission};}),
			onFilter: (value, record) => record.permission === value,
			filterMultiple: false,
			sorter: (a, b) => a.name < b.name,
			sortDirections: ['descend', 'ascend'],
		},
		{
			title: 'Subject',
			dataIndex: 'subject',
			filters: allSubjectNames.map(subject => {return {text: subject, value: subject};}),
			onFilter: (value, record) => record.subject === value,
			filterMultiple: false,
			sorter: (a, b) => a.subject < b.subject,
			sortDirections: ['descend', 'ascend'],
		},
		{
			title: 'Source',
			dataIndex: 'source',
			filters: allSources.map(source => {return {text: source, value: source};}),
			onFilter: (value, record) => record.source === value,
			filterMultiple: false,
			sorter: (a, b) => a.source < b.source,
			sortDirections: ['descend', 'ascend'],
		},
	];

	return <div className={'margin-lg'}>
		<h1>Permissions</h1>
		<hr/>
		<h2>My Permissions</h2>
		<Row>
			<Col span={4}></Col>
			<Col span={16}>
				<Table
					dataSource={permissionAssignments}
					columns={columns}
					pagination={{pageSize: 10}}
				/>
			</Col>
			<Col span={4}></Col>
		</Row>

	</div>;
};