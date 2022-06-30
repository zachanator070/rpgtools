import React, {useEffect, useState} from "react";
import { Button, Select } from "antd";
import {ALL_WIKI_TYPES, ROLE, WIKI_FOLDER, WIKI_PAGE, WORLD} from "@rpgtools/common/src/type-constants";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants";
import { SelectRole } from "../select/SelectRole";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { SelectWiki } from "../select/SelectWiki";
import { useGrantRolePermission } from "../../hooks/authorization/useGrantRolePermission";
import Errors from "../Errors";
import { SelectFolder } from "../select/SelectFolder";
import {Role} from "../../types";

interface AddRolePermissionProps {
	role: Role;
}

export const AddRolePermission = ({ role }: AddRolePermissionProps) => {
	const { currentWorld } = useCurrentWorld();
	const [permissionToAdd, setPermissionToAdd] = useState(null);
	const [subjectTypeSelected, setSubjectTypeSelected] = useState<string>(null);
	const [subjectTypeToSend, setSubjectTypeToSend] = useState<string>(null);
	const [subjectId, setSubjectId] = useState<string>(null);
	const { grantRolePermission, errors } = useGrantRolePermission();

	useEffect(() => {
		if (subjectTypeSelected !== WIKI_PAGE) {
			setSubjectTypeToSend(subjectTypeSelected);
		}
	}, [subjectTypeSelected]);

	let selectSubject = null;
	if (subjectTypeSelected === WORLD) {
		selectSubject = (
			<Select style={{ width: "200px" }} onChange={async (worldId: string) => setSubjectId(worldId)}>
				{currentWorld.canAdmin && (
					<Select.Option value={currentWorld._id}>{currentWorld.name}</Select.Option>
				)}
			</Select>
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
		selectSubject = <SelectRole canAdmin={true} onChange={async (roleId: string) => setSubjectId(roleId)} />;
	} else if (subjectTypeSelected === WIKI_FOLDER) {
		selectSubject = <SelectFolder canAdmin={true} onChange={async (folderId: string) => setSubjectId(folderId)} />;
	}

	let availablePermissions = getPermissionsBySubjectType(subjectTypeSelected);

	return (
		<div className={"margin-lg-top"}>
			<h2>Add permission</h2>
			<Errors errors={errors} />
			<div className={"margin-lg-top"}>
				<span className={"margin-lg-right"}>Subject Type:</span>
				<Select
					style={{ width: "200px" }}
					onChange={async (value) => {
						await setPermissionToAdd(null);
						await setSubjectTypeSelected(value);
						await setSubjectId(null);
					}}
					value={subjectTypeSelected}
				>
					{[WORLD, WIKI_PAGE, ROLE, WIKI_FOLDER].map((permission) => (
						<Select.Option key={permission} value={permission}>{permission}</Select.Option>
					))}
				</Select>
			</div>
			{subjectTypeSelected && (
				<div className={"margin-lg-top"}>
					<span className={"margin-lg-right"}>Permission:</span>
					<Select
						style={{ width: "200px" }}
						onChange={async (value) => {
							await setPermissionToAdd(value);
						}}
						value={permissionToAdd}
					>
						{availablePermissions.map((permission) => (
							<Select.Option key={permission} value={permission}>{permission}</Select.Option>
						))}
					</Select>
				</div>
			)}
			{permissionToAdd && (
				<div className={"margin-lg-top"}>
					<span className={"margin-lg-right"}>Subject:</span> {selectSubject}
				</div>
			)}
			{subjectId && (
				<div className={"margin-lg-top"}>
					<Button
						type={"primary"}
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
					</Button>
				</div>
			)}
		</div>
	);
};
