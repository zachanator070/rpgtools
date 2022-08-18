import React, { useState } from "react";
import { Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import LoadingView from "../LoadingView";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCreateRole from "../../hooks/authorization/useCreateRole";
import useDeleteRole from "../../hooks/authorization/useDeleteRole";
import useRevokeRolePermission from "../../hooks/authorization/useRevokeRolePermission";
import useRemoveUserRole from "../../hooks/authorization/useRemoveUserRole";
import SelectUser from "../select/SelectUser";
import useAddUserRole from "../../hooks/authorization/useAddUserRole";
import AddRolePermission from "./AddRolePermission";
import {PermissionAssignment, User} from "../../types";
import useSearchRoles from "../../hooks/authorization/useSearchRoles";
import ColumnedContent from "../widgets/ColumnedContent";
import PrimaryButton from "../widgets/PrimaryButton";
import DangerButton from "../widgets/DangerButton";
import TextInput from "../widgets/TextInput";
import ItemList from "../widgets/ItemList";
import DropdownSelect from "../widgets/DropdownSelect";
import DropdownOption from "../widgets/DropdownOption";
import TabCollection from "../widgets/TabCollection";
import TabPane from "../widgets/TabPane";

interface TabulatedPermissionAssignment extends PermissionAssignment {
	key: string;
}

export default function RolesView() {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();
	const {roles, loading: rolesLoading, refetch} = useSearchRoles({});
	const { createRole, loading: createRoleLoading } = useCreateRole();
	const { revokeRolePermission, loading: revokeRolePermissionLoading } = useRevokeRolePermission({callback: async () => {await refetch()}});
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

	return (
		<div className={"margin-md"}>
			<h1>Roles</h1>
			<hr />
			{currentWorld.canAddRoles && (
				<ColumnedContent>
					<>
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
					</>
				</ColumnedContent>

			)}
			<ColumnedContent>
				<>
					<h2 className={"margin-lg-bottom"}>Manage Roles</h2>
					<span className={"margin-lg-right"}>Role:</span>
					<DropdownSelect
						id={'selectRole'}
						style={{ width: 200 }}
						value={selectedRoleId}
						onChange={(roleId: string) => setSelectedRoleId(roleId)}
					>
						{roles.docs.map((role) => (
							<DropdownOption key={role._id} value={role._id}>
								{role.name}
							</DropdownOption>
						))}
					</DropdownSelect>
					{selectedRole ? (
						<TabCollection>
							<TabPane title="Permissions in this role" key="1">
								<Table
									columns={[
										{
											title: "Permission",
											dataIndex: "permission",
											key: "permission",
										},
										{
											title: "Subject Type",
											dataIndex: "subjectType",
											key: "subjectType",
										},
										{
											title: "Subject Name",
											dataIndex: "subjectName",
											key: "subjectName",
										},
										{
											title: "Remove Permission",
											dataIndex: "_id",
											key: "_id",
											render: (text: string, assignment: TabulatedPermissionAssignment) => {
												return assignment.subject.canAdmin ? (
													<DangerButton
														loading={revokeRolePermissionLoading}
														className={"margin-md-left"}
														onClick={async () => {
															await revokeRolePermission({
																roleId: selectedRole._id,
																permission: assignment.permission,
																subjectId: assignment.subject._id
															});
														}}
													>
														<DeleteOutlined />
													</DangerButton>
												) : (
													<></>
												);
											},
										},
									]}
									dataSource={selectedRole.permissions.map((permission) => {
										return {
											key: permission._id,
											subjectName: permission.subject.name,
											...permission
										};
									})}
									pagination={false}
									scroll={{ y: 250 }}
								/>
								<AddRolePermission role={selectedRole} refetch={async () => {await refetch()}}/>
							</TabPane>
							<TabPane title="Users with this role" key="2">
								<ItemList>
									{selectedRole.members.map((item: User) => {
										return <>
											{item.username}
											{selectedRole.canWrite && (
												<DangerButton
												loading={removeUserRoleLoading}
												className={"margin-md-left"}
												onClick={async () => {
												await removeUserRole({userId: item._id, roleId: selectedRole._id});
											}}
												>
												<DeleteOutlined />
												</DangerButton>
												)}
										</>;
									})}
								</ItemList>
								{selectedRole.canWrite && (
									<>
										<SelectUser onChange={async (userId: string) => setUserIdToAdd(userId)} />
										<PrimaryButton
											loading={addUserRoleLoading}
											className={"margin-md-left"}
											onClick={async () => {
												await addUserRole({userId: userIdToAdd, roleId: selectedRole._id});
											}}
											disabled={userIdToAdd === null}
										>
											Add User
										</PrimaryButton>
									</>
								)}
							</TabPane>
							{selectedRole.canWrite && (
								<TabPane title="Delete this role" key="3">
									<DangerButton
										loading={deleteRoleLoading}
										className={"margin-md-left"}
										onClick={async () => {
											await deleteRole({roleId: selectedRole._id});
											await setSelectedRoleId(null);
										}}
									>
										Delete this role
										<DeleteOutlined />
									</DangerButton>
								</TabPane>
							)}
						</TabCollection>
					) : (
						<div className={"margin-md-top"}>Please select a role</div>
					)}
				</>
			</ColumnedContent>

		</div>
	);
};
