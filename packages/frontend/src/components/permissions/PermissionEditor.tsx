import React, { useEffect, useState } from "react";
import { Button, Col, List, Radio, Row, Tabs } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { getPermissionsBySubjectType } from "@rpgtools/common/src/permission-constants";
import useGrantUserPermission from "../../hooks/authorization/useGrantUserPermisison";
import useGrantRolePermission from "../../hooks/authorization/useGrantRolePermission";
import useRevokeUserPermission from "../../hooks/authorization/useRevokeUserPermission";
import useRevokeRolePermission from "../../hooks/authorization/useRevokeRolePermission";
import SelectUser from "../select/SelectUser";
import SelectRole from "../select/SelectRole";
import {PermissionAssignment, Role, User} from "../../types";

interface PermissionEditorProps {
	subject: any;
	subjectType: string;
	refetch: () => Promise<void>;
}

export default function PermissionEditor({ subject, subjectType, refetch }: PermissionEditorProps) {
	const [permissionGroup, setPermissionGroup] = useState<string>("users");
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
						<Radio.Button id="rolesPermissionTab" value="roles">Roles</Radio.Button>
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
									renderItem={(item: any) => {
										if(permissionGroup === "users") {
											item = item as User;
										} else {
											item = item as Role;
										}
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
																await revokeUserPermission({
																	userId: item._id,
																	permission: selectedPermissionAssignment.permission,
																	subjectId: selectedPermissionAssignment.subject._id

																});
															} else {
																await revokeRolePermission({
																	roleId: item._id,
																	permission: selectedPermissionAssignment.permission,
																	subjectId: selectedPermissionAssignment.subject._id
																});
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
							Add {permissionGroup === "users" ? "user" : "role"}
						</Button>
					</Col>
				</Row>
			)}
		</>
	);
};
