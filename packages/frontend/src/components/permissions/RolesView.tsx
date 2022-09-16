import React, { useState } from "react";
import LoadingView from "../LoadingView";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateRole from "../../hooks/authorization/useCreateRole";
import useDeleteRole from "../../hooks/authorization/useDeleteRole";
import useRemoveUserRole from "../../hooks/authorization/useRemoveUserRole";
import SelectUser from "../select/SelectUser";
import useAddUserRole from "../../hooks/authorization/useAddUserRole";
import {Role, User} from "../../types";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";
import ColumnedContent from "../widgets/ColumnedContent";
import PrimaryButton from "../widgets/PrimaryButton";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import TextInput from "../widgets/input/TextInput";
import ItemList from "../widgets/ItemList";
import DropdownSelect from "../widgets/DropdownSelect";
import TabCollection, {TabPaneProps} from "../widgets/TabCollection";
import DeleteIcon from "../widgets/icons/DeleteIcon";


export default function RolesView() {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();
	const {roles, loading: rolesLoading} = useSearchRoles({});
	const { createRole, loading: createRoleLoading } = useCreateRole();
	const { deleteRole, loading: deleteRoleLoading } = useDeleteRole();
	const { removeUserRole, loading: removeUserRoleLoading } = useRemoveUserRole();
	const [newRoleName, setNewRoleName] = useState<string>();
	const [selectedRoleId, setSelectedRoleId] = useState<string>(null);
	const [userIdToAdd, setUserIdToAdd] = useState<string>(null);
	const { addUserRole, loading: addUserRoleLoading } = useAddUserRole();

	if (currentWorldLoading || rolesLoading) {
		return <LoadingView />;
	}

	let selectedRole = null;
	if (selectedRoleId) {
		for (let role of roles.docs) {
			if (role._id === selectedRoleId) {
				selectedRole = role;
			}
		}
	}

	const getTabs = (role: Role): TabPaneProps[] => {
		const tabs: TabPaneProps[] = [
			{
				title: "Users with this role",
				children: <>
					<ItemList>
						{role.members.map((item: User) => {
							return <React.Fragment key={item._id}>
								{item.username}
								{role.canWrite && (
									<PrimaryDangerButton
										loading={removeUserRoleLoading}
										className={"margin-md-left"}
										onClick={async () => {
											await removeUserRole({userId: item._id, roleId: role._id});
										}}
									>
										<DeleteIcon />
									</PrimaryDangerButton>
								)}
							</React.Fragment>;
						})}
					</ItemList>
					{role.canWrite && (
						<div className={'margin-lg-top'}>
							<SelectUser onChange={async (userId: string) => setUserIdToAdd(userId)} />
							<PrimaryButton
								loading={addUserRoleLoading}
								className={"margin-md-left"}
								onClick={async () => {
									await addUserRole({userId: userIdToAdd, roleId: role._id});
								}}
								disabled={userIdToAdd === null}
							>
								Add User
							</PrimaryButton>
						</div>
					)}
				</>
			}
		];
		if (role.canWrite) {
			tabs.push({
				title: 'Delete this role',
				children: <>
					<PrimaryDangerButton
						loading={deleteRoleLoading}
						className={"margin-md-left"}
						onClick={async () => {
							await deleteRole({roleId: role._id});
							await setSelectedRoleId(null);
						}}
					>
						Delete this role
						<DeleteIcon />
					</PrimaryDangerButton>
				</>
			})
		}
		return tabs;
	};

	return (
		<div className={"margin-md padding-lg-bottom"}>
			<h1>Roles</h1>
			<hr />

			<ColumnedContent>
				<>
					<h2 className={"margin-lg-bottom"}>Manage Roles</h2>
					<span className={"margin-lg-right"}>Role:</span>
					<DropdownSelect
						id={'selectRole'}
						style={{ width: 200 }}
						value={selectedRoleId}
						onChange={(roleId: string) => setSelectedRoleId(roleId)}
						options={roles.docs.map((role) => {return {value: role._id, label: role.name}})}
					/>
					<div className={'margin-lg-top'}>
						{selectedRole ?
							<TabCollection tabs={getTabs(selectedRole)} style={{maxWidth: '60em'}}/>
							:
							<>Please select a role</>
						}
					</div>

					{currentWorld.canAddRoles && (
						<div className={'padding-lg-top'}>
							<h2>Add New Role</h2>
							<div className={"flex margin-lg-top"}>
								<span>Role Name:</span>
								<div className={"margin-lg-left"}>
									<TextInput
										id={'newRoleName'}
										value={newRoleName}
										onChange={async (e) => {
											await setNewRoleName(e.target.value);
										}}
									/>
								</div>
								<PrimaryButton
									className={"margin-lg-left"}
									disabled={createRoleLoading}
									onClick={async () => {
										await createRole({worldId: currentWorld._id, name: newRoleName});
									}}
								>
									Create
								</PrimaryButton>
							</div>
						</div>
					)}
				</>
			</ColumnedContent>

		</div>
	);
};
