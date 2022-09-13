import React, { useEffect, useState } from "react";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants";
import useGrantUserPermission from "../../hooks/authorization/useGrantUserPermisison";
import useGrantRolePermission from "../../hooks/authorization/useGrantRolePermission";
import useRevokeUserPermission from "../../hooks/authorization/useRevokeUserPermission";
import useRevokeRolePermission from "../../hooks/authorization/useRevokeRolePermission";
import SelectUser from "../select/SelectUser";
import SelectRole from "../select/SelectRole";
import {PermissionControlled, Role, User} from "../../types";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import PrimaryButton from "../widgets/PrimaryButton";
import ItemList from "../widgets/ItemList";
import TabCollection from "../widgets/TabCollection";
import RadioButtonGroup from "../widgets/RadioButtonGroup";
import RadioButton from "../widgets/RadioButton";
import DeleteIcon from "../widgets/icons/DeleteIcon";
import {USER} from "@rpgtools/common/src/type-constants";

interface PermissionEditorProps {
	subject: PermissionControlled;
	subjectType: string;
	refetch: () => Promise<void>;
}

export default function PermissionEditor({ subject, subjectType, refetch }: PermissionEditorProps) {
	const [principalType, setPrincipalType] = useState<string>(USER);
	const { grantUserPermission } = useGrantUserPermission();
	const { grantRolePermission } = useGrantRolePermission({callback: refetch});
	const { revokeUserPermission } = useRevokeUserPermission();
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
				subject.accessControlList.map(entry => entry.permission === selectedPermission && entry.principalType === principalType)
			);
		}
	}, [selectedPermission, principalType])

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
					<RadioButton id="rolesPermissionTab" value="roles">Roles</RadioButton>
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
											{principalType === USER ? principal.username : principal.name}
											{subject.canAdmin && (
												<PrimaryDangerButton
													className="margin-md-left"
													onClick={async () => {
														if (principalType === USER) {
															await revokeUserPermission({
																userId: principal._id,
																permission: selectedPermission,
																subjectId: subject._id

															});
														} else {
															await revokeRolePermission({
																roleId: principal._id,
																permission: selectedPermission,
																subjectId: subject._id
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
