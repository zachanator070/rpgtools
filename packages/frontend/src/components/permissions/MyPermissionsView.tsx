import React from "react";
import { ALL_WIKI_TYPES, ROLE, WIKI_FOLDER, WORLD } from "@rpgtools/common/src/type-constants";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useServerConfig from "../../hooks/server/useServerConfig";
import LoadingView from "../LoadingView";
import useMyPermissions from "../../hooks/authorization/useMyPermissions";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";
import ColumnedContent from "../widgets/ColumnedContent";
import FormattedTable from "../widgets/FormattedTable";

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

	return (
		<div className={"margin-md"}>
			<h1>My Permissions on {currentWorld.name}</h1>
			<hr />
			<div style={{justifyContent: 'center', display: 'flex'}}>
				<FormattedTable
					data={permissionAssignments.map((assignment) => {
						return [
							assignment.permission,
							assignment.subject,
							assignment.subject
						];
					})}
					headers={["Permission", "Subject", "Source"]}
					filters={true}
					sorting={true}
					style={{width: '100em'}}
				/>
			</div>
		</div>
	);
};
