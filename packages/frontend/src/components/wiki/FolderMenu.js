import React, { useState } from "react";
import { Dropdown, Form, Menu, Modal, Input, Button, Upload } from "antd";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	ImportOutlined,
	TeamOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import { useCreateWiki } from "../../hooks/wiki/useCreateWiki";
import useCreateFolder from "../../hooks/wiki/useCreateFolder";
import { useRenameFolder } from "../../hooks/wiki/useRenameFolder";
import { SelectFolder } from "../select/SelectFolder";
import { useMoveFolder } from "../../hooks/wiki/useMoveFolder";
import { useDeleteFolder } from "../../hooks/wiki/useDeleteFolder";
import { ToolTip } from "../ToolTip";
import { useImportContent } from "../../hooks/world/useImportContent";
import { PermissionEditor } from "../permissions/PermissionEditor";
import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";

export const FolderMenu = ({
	folder,
	children,
	refetchFolders,
	refetchWikis,
}) => {
	const { createWiki } = useCreateWiki();
	const { createFolder } = useCreateFolder();
	const { renameFolder } = useRenameFolder();
	const { moveFolder } = useMoveFolder();
	const { deleteFolder } = useDeleteFolder();

	const { importContent, loading: importLoading } = useImportContent();
	const [renameModalVisibility, setRenameModalVisibility] = useState(false);
	const [moveFolderModalVisibility, setMoveFolderModalVisibility] = useState(
		false
	);
	const [importModalVisibility, setImportModalVisibility] = useState(false);
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(
		false
	);

	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	const tailLayout = {
		wrapperCol: { offset: 8, span: 16 },
	};

	const canWriteMenu = [
		<Menu.Item
			key="createWiki"
			onClick={async () => {
				await createWiki("New Page", folder._id);
				await refetchWikis();
			}}
		>
			<FileAddOutlined />
			New Wiki Page
		</Menu.Item>,
		<Menu.Item
			key="createFolder"
			onClick={async () => {
				await createFolder(folder._id, "New Folder");
				await refetchFolders();
			}}
		>
			<FolderAddOutlined />
			New Folder
		</Menu.Item>,
		<Menu.Item
			key="renameFolder"
			onClick={async () => {
				setRenameModalVisibility(true);
				await refetchFolders();
			}}
		>
			<EditOutlined />
			Rename Folder
		</Menu.Item>,
		<Menu.Item
			key="moveFolder"
			onClick={async () => {
				setMoveFolderModalVisibility(true);
				await refetchFolders();
			}}
		>
			<ImportOutlined />
			Move Folder
		</Menu.Item>,
		<Menu.Item
			key="deleteFolder"
			onClick={() => {
				Modal.confirm({
					title: "Confirm Delete",
					content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
					onOk: async () => {
						await deleteFolder(folder._id);
						await refetchFolders();
					},
					onCancel: () => {},
				});
			}}
		>
			<DeleteOutlined />
			Delete Folder
		</Menu.Item>,
		<Menu.Item
			key="importFolder"
			onClick={async () => {
				setImportModalVisibility(true);
				await refetchFolders();
			}}
		>
			<UploadOutlined />
			Import Content
		</Menu.Item>,
	];

	const menu = [
		<Menu.Item
			key="exportFolder"
			onClick={() => {
				window.location = `/export/WikiFolder/${folder._id}`;
			}}
		>
			<DownloadOutlined />
			Export Folder
		</Menu.Item>,
		<Menu.Item
			key="permissions"
			onClick={() => {
				setPermissionModalVisibility(true);
			}}
		>
			<TeamOutlined />
			Folder Permissions
		</Menu.Item>,
	];
	if (folder.canWrite) {
		menu.unshift(...canWriteMenu);
	}

	return (
		<div>
			<div
				onClick={(event) => {
					event.stopPropagation();
				}}
			>
				<Modal
					footer={null}
					title={`Rename ${folder.name}`}
					visible={renameModalVisibility}
					onCancel={() => setRenameModalVisibility(false)}
					onClick={(event) => {
						event.stopPropagation();
					}}
				>
					<Form
						{...layout}
						onFinish={async ({ newName }) => {
							setRenameModalVisibility(false);
							await renameFolder(folder._id, newName);
						}}
					>
						<Form.Item name={"newName"} label={"New Name"}>
							<Input />
						</Form.Item>
						<Form.Item {...tailLayout}>
							<Button type="primary" htmlType="submit">
								Submit
							</Button>
						</Form.Item>
					</Form>
				</Modal>
				<Modal
					footer={null}
					title={`Move ${folder.name}`}
					visible={moveFolderModalVisibility}
					onCancel={() => setMoveFolderModalVisibility(false)}
					onClick={(event) => {
						event.stopPropagation();
					}}
				>
					<Form
						{...layout}
						onFinish={async ({ newFolder }) => {
							setMoveFolderModalVisibility(false);
							await moveFolder({
								folderId: folder._id,
								parentFolderId: newFolder,
							});
							await refetchFolders();
						}}
					>
						<Form.Item label={"New Parent Folder"} name={"newFolder"}>
							<SelectFolder />
						</Form.Item>
						<Form.Item {...tailLayout}>
							<Button type="primary" htmlType="submit">
								Submit
							</Button>
						</Form.Item>
					</Form>
				</Modal>
				<Modal
					title={"Import Content"}
					visible={importModalVisibility}
					footer={null}
					onCancel={() => setImportModalVisibility(false)}
					onClick={(event) => {
						event.stopPropagation();
					}}
				>
					<div className={"margin-lg-top"}>
						<Form
							{...layout}
							onFinish={async ({ file }) => {
								setImportModalVisibility(false);
								await importContent({
									folderId: folder._id,
									zipFile: file[0].originFileObj,
								});
							}}
						>
							<Form.Item
								label={
									<div>
										<ToolTip>
											Supported file types: <br />
											<ul>
												<li>.zip</li>
											</ul>
										</ToolTip>{" "}
										File
									</div>
								}
								name="file"
								rules={[
									{ required: true, message: "File required" },
									{
										validator: async (rule, value) => {
											// this function has to be async b/c the validator has to return a promise
											if (!value || value.length !== 1) {
												return;
											}
											const file = value[0];
											const supportedTypes = ["zip"];
											const parts = file.name.split(".");

											const type =
												parts.length > 0 ? parts[parts.length - 1] : null;
											if (!supportedTypes.includes(type)) {
												throw new Error(`File type ${type} not supported`);
											}
										},
									},
								]}
								getValueFromEvent={(e) => {
									return e.fileList.length > 0 ? [e.fileList[0]] : [];
								}}
								valuePropName="fileList"
							>
								<Upload multiple={false} beforeUpload={() => false}>
									<Button icon={<UploadOutlined />}>Select File</Button>
								</Upload>
							</Form.Item>
							<Form.Item {...tailLayout}>
								<Button
									type="primary"
									htmlType="submit"
									loading={importLoading}
								>
									Submit
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Modal>
				<Modal
					footer={null}
					title={`Permissions for ${folder.name}`}
					visible={permissionModalVisibility}
					onCancel={() => setPermissionModalVisibility(false)}
					width={750}
					onClick={(event) => {
						event.stopPropagation();
					}}
				>
					<PermissionEditor
						subjectType={WIKI_FOLDER}
						subject={folder}
						refetch={refetchFolders}
					/>
				</Modal>
			</div>
			<Dropdown
				overlay={
					<Menu
						onClick={(event) => {
							event.domEvent.stopPropagation();
						}}
					>
						{menu.length > 0 ? (
							menu
						) : (
							<Menu.Item>
								You don't have permission to do anything here
							</Menu.Item>
						)}
					</Menu>
				}
				trigger={["contextMenu"]}
			>
				<div>{children}</div>
			</Dropdown>
		</div>
	);
};
