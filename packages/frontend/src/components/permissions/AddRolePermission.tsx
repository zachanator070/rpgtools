import React, {useEffect, useState} from "react";
import {ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants";
import SelectRole from "../select/SelectRole";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import SelectWiki from "../select/SelectWiki";
import useGrantRolePermission from "../../hooks/authorization/useGrantRolePermission";
import Errors from "../Errors";
import SelectFolder from "../select/SelectFolder";
import {Role} from "../../types";
import DropdownSelect from "../widgets/DropdownSelect";
import PrimaryButton from "../widgets/PrimaryButton";

interface AddRolePermissionProps {
	role: Role;
	refetch: () => Promise<void>;
}

export default function AddRolePermission({ role, refetch }: AddRolePermissionProps) {
	const { currentWorld } = useCurrentWorld();
	const [permissionToAdd, setPermissionToAdd] = useState(null);
	const [subjectTypeSelected, setSubjectTypeSelected] = useState<string>(null);
	const [subjectTypeToSend, setSubjectTypeToSend] = useState<string>(null);
	const [subjectId, setSubjectId] = useState<string>(null);
	const { grantRolePermission, errors } = useGrantRolePermission({callback: refetch});

	useEffect(() => {
		if (subjectTypeSelected !== WIKI_PAGE) {
			setSubjectTypeToSend(subjectTypeSelected);
		}
	}, [subjectTypeSelected]);

	let selectSubject = null;
	if (subjectTypeSelected === WORLD) {
		selectSubject = (
			<DropdownSelect style={{ width: "200px" }} onChange={(worldId: string) => setSubjectId(worldId)} options={
				currentWorld.canAdmin && [{value: currentWorld._id, label: currentWorld.name}]
			}/>
		);
	} else if (subjectTypeSelected === WIKI_PAGE) {
		selectSubject = (
			<SelectWiki
				canAdmin={true}
				onChange={async (wiki) => {
					setSubjectTypeToSend(wiki.type);
					setSubjectId(wiki._id);
				}}
			/>
		);
	} else if (subjectTypeSelected === ROLE) {
		selectSubject = <SelectRole canAdmin={true} onChange={(roleId: string) => setSubjectId(roleId)} />;
	} else if (subjectTypeSelected === WIKI_FOLDER) {
		selectSubject = <SelectFolder canAdmin={true} onChange={(folder) => setSubjectId(folder._id)} />;
	}

	let availablePermissions = getPermissionsBySubjectType(subjectTypeSelected);

	return (
		<div className={"margin-lg-top"}>
			<h2>Add permission</h2>
			<Errors errors={errors} />
			<div className={"margin-lg-top"}>
				<span className={"margin-lg-right"}>Subject Type:</span>
				<DropdownSelect
					style={{ width: "200px" }}
					onChange={(value) => {
						setPermissionToAdd(null);
						setSubjectTypeSelected(value);
						setSubjectId(null);
					}}
					value={subjectTypeSelected}
					options={[WORLD, WIKI_PAGE, ROLE, WIKI_FOLDER].map(permission => {return {label: permission, value: permission};})}
				/>
			</div>
			{subjectTypeSelected && (
				<div className={"margin-lg-top"}>
					<span className={"margin-lg-right"}>Permission:</span>
					<DropdownSelect
						style={{ width: "200px" }}
						onChange={async (value) => {
							await setPermissionToAdd(value);
						}}
						value={permissionToAdd}
						options={availablePermissions.map((permission) => {return {label: permission, value: permission};})}
					/>
				</div>
			)}
			{permissionToAdd && (
				<div className={"margin-lg-top"}>
					<span className={"margin-lg-right"}>Subject:</span> {selectSubject}
				</div>
			)}
			{subjectId && (
				<div className={"margin-lg-top"}>
					<PrimaryButton
						onClick={async () =>
							await grantRolePermission({
								roleId: role._id,
								permission: permissionToAdd,
								subjectId: subjectId,
								subjectType: subjectTypeToSend
							})
						}
					>
						Add Permission
					</PrimaryButton>
				</div>
			)}
		</div>
	);
};
