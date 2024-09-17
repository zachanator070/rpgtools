import React, { useEffect, useState } from "react";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants.js";
import useGrantUserPermission from "../../hooks/authorization/useGrantUserPermisison.js";
import useGrantRolePermission from "../../hooks/authorization/useGrantRolePermission.js";
import useRevokeUserPermission from "../../hooks/authorization/useRevokeUserPermission.js";
import useRevokeRolePermission from "../../hooks/authorization/useRevokeRolePermission.js";
import SelectUser from "../select/SelectUser.js";
import SelectRole from "../select/SelectRole.js";
import {PermissionControlled, Role, User} from "../../types.js";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton.js";
import PrimaryButton from "../widgets/PrimaryButton.js";
import ItemList from "../widgets/ItemList.js";
import TabCollection from "../widgets/TabCollection.js";
import RadioButtonGroup from "../widgets/RadioButtonGroup.js";
import RadioButton from "../widgets/RadioButton.js";
import DeleteIcon from "../widgets/icons/DeleteIcon.js";
import {ROLE, USER} from "@rpgtools/common/src/type-constants.js";

interface PermissionEditorProps {
	subject: PermissionControlled;
	subjectType: string;
	refetch: () => Promise<void>;
}

export default function PermissionEditor({ subject, subjectType, refetch }: PermissionEditorProps) {
	const [principalType, setPrincipalType] = useState<string>(USER);
	const { grantUserPermission } = useGrantUserPermission({callback: refetch});
	const { grantRolePermission } = useGrantRolePermission({callback: refetch});
	const { revokeUserPermission } = useRevokeUserPermission({callback: refetch});
	const { revokeRolePermission } = useRevokeRolePermission({callback: refetch});
	const [permissionAssigneeId, setPermissionAssigneeId] = useState<string>(null);
	const possiblePermissions = getPermissionsBySubjectType(subjectType);
	const [selectedPermission, setSelectedPermission] = useState<string>(
		possiblePermissions.length > 0 ? possiblePermissions[0] : null
	);
	const [selectedPermissionPrincipals, setSelectedPermissionPrincipals] = useState([]);

	useEffect(() => {
		setSelectedPermission(selectedPermission ?? possiblePermissions[0]);
	}, [subject]);

	useEffect(() => {
		if (selectedPermission) {
			setSelectedPermissionPrincipals(
				subject.accessControlList
					.filter(entry => entry.permission === selectedPermission && entry.principalType === principalType)
					.map(entry => entry.principal)
			);
		}
	}, [selectedPermission, principalType, subject])

	if (subject === null || subjectType === null) {
		return <></>;
	}

	return (
		<div style={{width: '55em'}}>
			<div style={{ textAlign: "center" }}>
				<RadioButtonGroup
					onChange={async (e: string) => {
						await setPrincipalType(e);
					}}
					defaultValue={USER}
				>
					<RadioButton value={USER}>Users</RadioButton>
					<RadioButton id="rolesPermissionTab" value={ROLE}>Roles</RadioButton>
				</RadioButtonGroup>
			</div>
			<div className="margin-md-top">
				<TabCollection
					style={{ height: "100%" }}
					onChange={async (tab) => {
						await setSelectedPermission(tab);
					}}
					tabPosition={'left'}
					tabs={possiblePermissions.map((permission) => (
						{
							title:permission,
							children: <ItemList>
								{selectedPermissionPrincipals.map(principal => {
									if(principalType === USER) {
										principal = principal as User;
									} else {
										principal = principal as Role;
									}
									return (
										<div key={`${permission}.${principal._id}`}>
											{principal.name}
											{subject.canAdmin && (
												<PrimaryDangerButton
													className="margin-md-left"
													onClick={async () => {
														if (principalType === USER) {
															await revokeUserPermission({
																userId: principal._id,
																permission: selectedPermission,
																subjectId: subject._id,
																subjectType
															});
														} else {
															await revokeRolePermission({
																roleId: principal._id,
																permission: selectedPermission,
																subjectId: subject._id,
																subjectType
															});
														}
													}}
													id={'removeRole'}
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
						{principalType === USER ? (
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
								if (principalType === USER) {
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
							Add {principalType === USER ? "user" : "role"}
						</PrimaryButton>
					</div>
				</div>
			)}
		</div>
	);
};
