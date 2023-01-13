import React, {ReactElement, useState} from "react";
import useCreateWiki from "../../hooks/wiki/useCreateWiki";
import useCreateFolder from "../../hooks/wiki/useCreateFolder";
import useRenameFolder from "../../hooks/wiki/useRenameFolder";
import useDeleteFolder from "../../hooks/wiki/useDeleteFolder";
import ToolTip from "../widgets/ToolTip";
import useImportContent from "../../hooks/world/useImportContent";
import PermissionEditor from "../permissions/PermissionEditor";
import { WIKI_FOLDER } from "@rpgtools/common/src/type-constants";
import {WikiFolder} from "../../types";
import MoveFolderModal from "../modals/MoveFolderModal";
import useModal from "../widgets/useModal";
import FullScreenModal from "../widgets/FullScreenModal";
import InputForm from "../widgets/input/InputForm";
import TextInput from "../widgets/input/TextInput";
import FormItem from "../widgets/input/FormItem";
import FileInput from "../widgets/input/FileInput";
import AddFileIcon from "../widgets/icons/AddFileIcon";
import EditIcon from "../widgets/icons/EditIcon";
import DeleteIcon from "../widgets/icons/DeleteIcon";
import UploadIcon from "../widgets/icons/UploadIcon";
import DownloadIcon from "../widgets/icons/DownloadIcon";
import PeopleIcon from "../widgets/icons/PeopleIcon";
import ImportIcon from "../widgets/icons/ImportIcon";
import AddFolderIcon from "../widgets/icons/AddFolderIcon";
import ContextMenu from "../widgets/ContextMenu";

interface FolderMenuProps {
	folder: WikiFolder;
	children?: ReactElement;
	refetch?: () => Promise<void>;
}

export default function FolderMenu({ folder, children, refetch }: FolderMenuProps) {
	const { createWiki } = useCreateWiki();
	const { createFolder } = useCreateFolder();
	const { renameFolder, loading: renameLoading, errors: renameErrors } = useRenameFolder();
	const { deleteFolder } = useDeleteFolder();
	const [selectedImportFile, setSelectedImportFile] = useState(null);

	const { importContent, loading: importLoading, errors: importErrors } = useImportContent();
	const [renameModalVisibility, setRenameModalVisibility] = useState(false);
	const [moveFolderModalVisibility, setMoveFolderModalVisibility] = useState(false);
	const [importModalVisibility, setImportModalVisibility] = useState(false);
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);

	const {modalConfirm} = useModal();

	const canWriteMenu = [
		<div
			key="createWiki"
			onClick={async () => {
				await createWiki({name: "New Page", folderId: folder._id});
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<AddFileIcon />
			</span>
			New Wiki Page
		</div>,
		<div
			key="createFolder"
			onClick={async () => {
				await createFolder({parentFolderId: folder._id, name: "New Folder"});
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<AddFolderIcon />
			</span>
			New Folder
		</div>,
		<div
			key="renameFolder"
			onClick={async () => {
				setRenameModalVisibility(true);
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<EditIcon />
			</span>
			Rename Folder
		</div>,
		<div
			key="moveFolder"
			onClick={async () => {
				setMoveFolderModalVisibility(true);
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<ImportIcon />
			</span>
			Move Folder
		</div>,
		<div
			key="deleteFolder"
			onClick={() => {
				modalConfirm({
					title: "Confirm Delete",
					content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
					onOk: async () => {
						await deleteFolder({folderId: folder._id});
					},
				});
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<DeleteIcon />
			</span>
			Delete Folder
		</div>,
		<div
			key="importFolder"
			onClick={async () => {
				setImportModalVisibility(true);
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<UploadIcon />
			</span>
			Import Content
		</div>,
	];

	const menu = [
		<div
			key="exportFolder"
			onClick={() => {
				window.location.href = `/export/WikiFolder/${folder._id}`;
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<DownloadIcon />
			</span>
			Export Folder
		</div>,
		<div
			key="permissions"
			onClick={() => {
				setPermissionModalVisibility(true);
			}}
		>
			<span style={{marginRight: '.5em'}}>
				<PeopleIcon />
			</span>
			Folder Permissions
		</div>,
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
				<FullScreenModal
					title={`Rename ${folder.name}`}
					visible={renameModalVisibility}
					setVisible={() => setRenameModalVisibility(false)}
				>
					<InputForm
						loading={renameLoading}
						errors={renameErrors}
						onSubmit={async ({ newName }) => {
							setRenameModalVisibility(false);
							await renameFolder({folderId: folder._id, name: newName});
						}}
					>
						<FormItem label={"New Name"}>
							<TextInput name={"newName"} />
						</FormItem>
					</InputForm>
				</FullScreenModal>
				<MoveFolderModal folder={folder} visibility={moveFolderModalVisibility} setVisibility={setMoveFolderModalVisibility}/>
				<FullScreenModal
					title={"Import Content"}
					visible={importModalVisibility}
					setVisible={() => setImportModalVisibility(false)}
					closable={!importLoading}
				>
					<div className={"margin-lg-top"}>
						<InputForm
							loading={importLoading}
							errors={importErrors}
							onSubmit={async () => {

								await importContent({
									folderId: folder._id,
									zipFile: selectedImportFile.fileList[0].originFileObj,
								},
								{
									onCompleted: async () => setImportModalVisibility(false)
								});
							}}
						>
							<FormItem
								label={
									<div>
										<ToolTip
											title={<>
												Supported file types:
												<br />
												<ul>
													<li>.zip</li>
												</ul>
											</>}
										/>
										<span style={{marginLeft: ".5em"}}>
											File
										</span>
									</div>
								}
								required={true}
								validationRules={[
									async (value) => {
										// this function has to be async b/c the validator has to return a promise
										if (!value || value.length !== 1) {
											return;
										}
										const file = value[0];
										const supportedTypes = ["zip"];
										const parts = file.name.split(".");

										const type = parts.length > 0 ? parts[parts.length - 1] : null;
										if (!supportedTypes.includes(type)) {
											throw new Error(`File type ${type} not supported`);
										}
									},
								]}
							>
								<FileInput onChange={setSelectedImportFile}/>
							</FormItem>
						</InputForm>
					</div>
				</FullScreenModal>
				<FullScreenModal
					title={`Permissions for ${folder.name}`}
					visible={permissionModalVisibility}
					setVisible={() => setPermissionModalVisibility(false)}
				>
					<PermissionEditor subjectType={WIKI_FOLDER} subject={folder} refetch={async () => {await refetch()}}/>
				</FullScreenModal>
			</div>
			<ContextMenu menu={menu}>
				<div>{children}</div>
			</ContextMenu>
		</div>
	);
};
