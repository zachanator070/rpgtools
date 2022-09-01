import React, { useEffect, useState } from "react";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants";
import useGrantUserPermission from "../../hooks/authorization/useGrantUserPermisison";
import useGrantRolePermission from "../../hooks/authorization/useGrantRolePermission";
import useRevokeUserPermission from "../../hooks/authorization/useRevokeUserPermission";
import useRevokeRolePermission from "../../hooks/authorization/useRevokeRolePermission";
import SelectUser from "../select/SelectUser";
import SelectRole from "../select/SelectRole";
import {PermissionAssignment, Role, User} from "../../types";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import PrimaryButton from "../widgets/PrimaryButton";
import ItemList from "../widgets/ItemList";
import TabCollection from "../widgets/TabCollection";
import TabPane from "../widgets/TabPane";
import RadioButtonGroup from "../widgets/RadioButtonGroup";
import RadioButton from "../widgets/RadioButton";
import DeleteIcon from "../widgets/icons/DeleteIcon";

interface PermissionEditorProps {
	subject: any;
	subjectType: string;
	refetch: () => Promise<void>;
}

export default function PermissionEditor({ subject, subjectType, refetch }: PermissionEditorProps) {
	const [principalType, setPrincipalType] = useState<string>("users");
	const { grantUserPermission } = useGrantUserPermission();
	const { grantRolePermission } = useGrantRolePermission({callback: refetch});
	const { revokeUserPermission } = useRevokeUserPermission();
	const { revokeRolePermission } = useRevokeRolePermission({callback: refetch});
	const [permissionAssigneeId, setPermissionAssigneeId] = useState<string>(null);
	const possiblePermissions = getPermissionsBySubjectType(subjectType);
	const [selectedPermission, setSelectedPermission] = useState<string>(
		possiblePermissions.length > 0 ? possiblePermissions[0] : null
	);
	const [selectedPermissionAssignment, setSelectedPermissionAssignment] = useState<PermissionAssignment>(null);
	const [selectedPermissionPrincipals, setSelectedPermissionPrincipals] = useState([]);

	const updateSelectedPermission = (permission) => {
		for (let assignment of subject.accessControlList) {
			if (assignment.permission === permission) {
				setSelectedPermissionAssignment(assignment);
				return;
			}
		}
		setSelectedPermissionAssignment(null);
	};

	useEffect(() => {
		updateSelectedPermission(selectedPermission ?? possiblePermissions[0]);
	}, [subject]);

	useEffect(() => {
		if (selectedPermissionAssignment) {
			setSelectedPermissionPrincipals(
				principalType === "users"
				? selectedPermissionAssignment.users
				: selectedPermissionAssignment.roles
			);
		}
	}, [selectedPermissionAssignment])

	if (subject === null || subjectType === null) {
		return <></>;
	}

	return (
		<>
			<div style={{ textAlign: "center" }}>
				<RadioButtonGroup
					onChange={async (e: string) => {
						await setPrincipalType(e);
					}}
					defaultValue="users"
				>
					<RadioButton value="users">Users</RadioButton>
					<RadioButton id="rolesPermissionTab" value="roles">Roles</RadioButton>
				</RadioButtonGroup>
			</div>
			<div className="margin-md-top">
				<TabCollection
					style={{ height: "100%" }}
					onChange={async (tab) => {
						await setSelectedPermission(tab);
						await updateSelectedPermission(tab);
					}}
					tabPosition={'left'}
					tabs={possiblePermissions.map((permission) => (
						{
							title:permission,
							children: <ItemList>
								{selectedPermissionPrincipals.map(principal => {
									if(principalType === "users") {
										principal = principal as User;
									} else {
										principal = principal as Role;
									}
									return (
										<div key={selectedPermissionAssignment._id + "." + principal._id}>
											{principalType === "users" ? principal.username : principal.name}
											{subject.canAdmin && (
												<PrimaryDangerButton
													className="margin-md-left"
													onClick={async () => {
														if (principalType === "users") {
															await revokeUserPermission({
																userId: principal._id,
																permission: selectedPermissionAssignment.permission,
																subjectId: selectedPermissionAssignment.subject._id

															});
														} else {
															await revokeRolePermission({
																roleId: principal._id,
																permission: selectedPermissionAssignment.permission,
																subjectId: selectedPermissionAssignment.subject._id
															});
														}
													}}
												>
													<DeleteIcon />
												</PrimaryDangerButton>
											)}
										</div>
									);
								})}
							</ItemList>
						}
					))}
				/>
			</div>

			{subject.canAdmin && (
				<div className="margin-md-top">
					<div style={{ textAlign: "center" }}>
						{principalType === "users" ? (
							<SelectUser
								onChange={async (value) => {
									await setPermissionAssigneeId(value);
								}}
							/>
						) : (
							<SelectRole
								onChange={async (value) => {
									await setPermissionAssigneeId(value);
								}}
							/>
						)}
						<PrimaryButton
							disabled={permissionAssigneeId === null}
							className="margin-md-left"
							onClick={async () => {
								let permission = selectedPermission;
								if (!permission) {
									permission = possiblePermissions[0];
								}
								if (principalType === "users") {
									await grantUserPermission({
										userId: permissionAssigneeId,
										permission,
										subjectId: subject._id,
										subjectType
									});
								} else {
									await grantRolePermission({
										roleId: permissionAssigneeId,
										permission,
										subjectId: subject._id,
										subjectType
									});
								}
							}}
						>
							Add {principalType === "users" ? "user" : "role"}
						</PrimaryButton>
					</div>
				</div>
			)}
		</>
	);
};
