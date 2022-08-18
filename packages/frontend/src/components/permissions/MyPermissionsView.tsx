import { Table } from "antd";
import React from "react";
import { ALL_WIKI_TYPES, ROLE, WIKI_FOLDER, WORLD } from "@rpgtools/common/src/type-constants";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useServerConfig from "../../hooks/server/useServerConfig";
import LoadingView from "../LoadingView";
import useMyPermissions from "../../hooks/authorization/useMyPermissions";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";
import ColumnedContent from "../widgets/ColumnedContent";

export default function MyPermissionsView() {
	const { currentWorld, loading } = useCurrentWorld();
	const {roles, loading: rolesLoading} = useSearchRoles({});
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();
	const { myPermissions, loading: permissionsLoading } = useMyPermissions();

	if (loading || serverConfigLoading || permissionsLoading || rolesLoading) {
		return <LoadingView />;
	}

	const getPermissionSubjectName = (assignment) => {
		let name = assignment.subject._id;

		if ([WORLD, WIKI_FOLDER, ROLE].concat(ALL_WIKI_TYPES).includes(assignment.subjectType)) {
			name = assignment.subject.name;
		}

		return `${assignment.subjectType}: ${name}`;
	};

	const permissionAssignments = [];

	for (let assignment of myPermissions) {
		let source = "Direct Assignment";
		for (let role of roles.docs.concat(serverConfig.roles)) {
			for (let permission of role.permissions) {
				if (permission._id === assignment._id) {
					source = `Role: ${role.name}`;
				}
			}
		}
		const subjectName = getPermissionSubjectName(assignment);
		permissionAssignments.push({
			permission: assignment.permission,
			subject: subjectName,
			key: `${assignment._id}${subjectName}${source}`,
			source,
		});
	}

	let allPermissionNames = permissionAssignments.map((assignment) => assignment.permission);
	allPermissionNames = [...new Set(allPermissionNames)];
	let allSubjectNames = permissionAssignments.map((assignment) => assignment.subject);
	allSubjectNames = [...new Set(allSubjectNames)];
	let allSources = permissionAssignments.map((assignment) => assignment.source);
	allSources = [...new Set(allSources)];

	const columns = [
		{
			title: "Permission",
			dataIndex: "permission",
			filters: allPermissionNames.map((permission) => {
				return { text: permission, value: permission };
			}),
			onFilter: (value, record) => record.permission === value,
			filterMultiple: false,
			sorter: (a, b) => a.name < b.name ? -1 : 1,
		},
		{
			title: "Subject",
			dataIndex: "subject",
			filters: allSubjectNames.map((subject) => {
				return { text: subject, value: subject };
			}),
			onFilter: (value, record) => record.subject === value,
			filterMultiple: false,
			sorter: (a, b) => a.subject < b.subject ? -1 : 1,
		},
		{
			title: "Source",
			dataIndex: "source",
			filters: allSources.map((source) => {
				return { text: source, value: source };
			}),
			onFilter: (value, record) => record.source === value,
			filterMultiple: false,
			sorter: (a, b) => a.source < b.source ? -1 : 1,
		},
	];

	return (
		<div className={"margin-md"}>
			<h1>My Permissions on {currentWorld.name}</h1>
			<hr />
			<ColumnedContent>
				<>
					<h2 className={"margin-lg-bottom"}>My Permissions</h2>
					<Table
						dataSource={permissionAssignments}
						columns={columns}
						pagination={false}
						scroll={{ y: 500 }}
					/>
				</>
			</ColumnedContent>
		</div>
	);
};
