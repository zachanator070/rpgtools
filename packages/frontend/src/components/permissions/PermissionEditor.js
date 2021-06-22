import React, { useEffect, useState } from "react";
import { Button, Col, List, Radio, Row, Tabs } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { getPermissionsBySubjectType } from "../../../../common/src/permission-constants";
import { useGrantUserPermission } from "../../hooks/authorization/useGrantUserPermisison";
import { useGrantRolePermission } from "../../hooks/authorization/useGrantRolePermission";
import { useRevokeUserPermission } from "../../hooks/authorization/useRevokeUserPermission";
import { useRevokeRolePermission } from "../../hooks/authorization/useRevokeRolePermission";
import { SelectUser } from "../select/SelectUser";
import { SelectRole } from "../select/SelectRole";

export const PermissionEditor = ({ subject, subjectType, refetch }) => {
	const [permissionGroup, setPermissionGroup] = useState("users");
	const { grantUserPermission } = useGrantUserPermission();
	const { grantRolePermission } = useGrantRolePermission();
	const { revokeUserPermission } = useRevokeUserPermission();
	const { revokeRolePermission } = useRevokeRolePermission();
	const [permissionAssigneeId, setPermissionAssigneeId] = useState(null);
	const possiblePermissions = getPermissionsBySubjectType(subjectType);
	const [selectedPermission, setSelectedPermission] = useState(
		possiblePermissions.length > 0 ? possiblePermissions[0] : null
	);
	const [selectedPermissionAssignment, setSelectedPermissionAssignment] = useState(null);

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

	if (subject === null || subjectType === null) {
		return <></>;
	}

	return (
		<>
			<Row>
				<Col span={24} style={{ textAlign: "center" }}>
					<Radio.Group
						onChange={async (e) => {
							await setPermissionGroup(e.target.value);
						}}
						defaultValue="users"
					>
						<Radio.Button value="users">Users</Radio.Button>
						<Radio.Button value="roles">Roles</Radio.Button>
					</Radio.Group>
				</Col>
			</Row>
			<Row className="margin-md-top">
				<Col span={24}>
					<Tabs
						defaultActiveKey="1"
						tabPosition="left"
						style={{ height: "100%" }}
						onChange={async (tab) => {
							await setSelectedPermission(tab);
							await updateSelectedPermission(tab);
						}}
					>
						{possiblePermissions.map((permission) => (
							<Tabs.TabPane tab={permission} key={permission}>
								<List
									bordered
									dataSource={
										selectedPermissionAssignment
											? permissionGroup === "users"
												? selectedPermissionAssignment.users
												: selectedPermissionAssignment.roles
											: []
									}
									locale={{ emptyText: <div>No {permissionGroup}</div> }}
									renderItem={(item) => {
										return (
											<List.Item key={selectedPermissionAssignment._id + "." + item._id}>
												{permissionGroup === "users" ? item.username : item.name}
												{subject.canAdmin && (
													<Button
														className="margin-md-left"
														type="primary"
														danger
														onClick={async () => {
															if (permissionGroup === "users") {
																await revokeUserPermission(
																	item._id,
																	selectedPermissionAssignment._id
																);
															} else {
																await revokeRolePermission(
																	item._id,
																	selectedPermissionAssignment._id
																);
															}
															if (refetch) {
																await refetch();
															}
														}}
													>
														<DeleteOutlined />
													</Button>
												)}
											</List.Item>
										);
									}}
								/>
							</Tabs.TabPane>
						))}
					</Tabs>
				</Col>
			</Row>

			{subject.canAdmin && (
				<>
					<Row className="margin-md-top">
						<Col span={24} style={{ textAlign: "center" }}>
							{permissionGroup === "users" ? (
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
							<Button
								disabled={permissionAssigneeId === null}
								className="margin-md-left"
								onClick={async () => {
									let permission = selectedPermission;
									if (!permission) {
										permission = possiblePermissions[0];
									}
									if (permissionGroup === "users") {
										await grantUserPermission(
											permissionAssigneeId,
											permission,
											subject._id,
											subjectType
										);
									} else {
										await grantRolePermission(
											permissionAssigneeId,
											permission,
											subject._id,
											subjectType
										);
									}
									if (refetch) {
										await refetch();
									}
								}}
							>
								Add {permissionGroup === "users" ? "user" : "role"}
							</Button>
						</Col>
					</Row>
				</>
			)}
		</>
	);
};
