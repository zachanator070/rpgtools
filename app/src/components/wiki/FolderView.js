import React, {useEffect, useRef, useState} from 'react';
import {Button, Col, Form, Modal, Upload} from "antd";
import {
	FileTextOutlined,
	RightOutlined,
	DownOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	EditOutlined,
	DeleteOutlined,
	ImportOutlined, DownloadOutlined, UploadOutlined
} from '@ant-design/icons';
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {useRenameFolder} from "../../hooks/wiki/useRenameFolder";
import {useDeleteFolder} from "../../hooks/wiki/useDeleteFolder";
import {useCreateWiki} from "../../hooks/wiki/useCreateWiki";
import {useHistory} from "react-router-dom";
import useCreateFolder from "../../hooks/wiki/useCreateFolder";
import {LoadingView} from "../LoadingView";
import {MoveFolderModal} from "../modals/MoveFolderModal";
import {ToolTip} from "../ToolTip";
import {useImportContent} from "../../hooks/world/useImportContent";

export const FolderView = () => {

	const history = useHistory();
	const [opened, setOpened] = useState([]);
	const [folderBeingEdited, setFolderBeingEdited] = useState(null);
	const [newFolderName, setNewFolderName] = useState('');
	const [folderBeingHovered, setFolderBeingHovered] = useState(null);
	const [folderBeingMoved, setFolderBeingMoved] = useState();

	const [moveFolderModalVisibility, setMoveFolderModalVisibility] = useState(false);

	const {currentWiki, loading: currentWikiLoading} = useCurrentWiki();
	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();

	const {renameFolder} = useRenameFolder();
	const {deleteFolder} = useDeleteFolder();
	const {createWiki} = useCreateWiki();
	const {createFolder} = useCreateFolder();
	const {importContent, loading: importLoading} = useImportContent();
	const [importModalVisibility, setImportModalVisibility] = useState(false);
	const [importFolder, setImportFolder] = useState();


	const editingInput = useRef(null);
	
	useEffect(() => {
		if (editingInput.current) {
			editingInput.current.focus();
		}
	});

	useEffect(() => {
		if(currentWiki && currentWorld && currentWorld.rootFolder){
			const currentPagePath = findPage(currentWorld.rootFolder, currentWiki._id, []);
			setOpened(opened.concat(currentPagePath));
		}
	}, [currentWiki, currentWorld]);

	if(currentWorldLoading || currentWikiLoading){
		return <LoadingView/>;
	}

	const openFolder = (folderId) => {
		// if we are opened already, remove from list
		if (opened.includes(folderId)) {
			let copy = opened.slice();
			copy.splice(copy.indexOf(folderId), 1);
			setOpened(copy);
		} else {
			// otherwise if we aren't opened, add to list
			setOpened(opened.concat(folderId));
		}
	};

	const findPage = (folder, wikiId, path) => {
		if (folder.pages.filter((page) => {
			return page._id === wikiId;
		}).length > 0) {
			return path.concat([folder._id]);
		}

		for (let child of folder.children) {
			for(let otherFolder of currentWorld.folders){
				if(otherFolder._id === child._id){
					child = otherFolder;
				}
			}
			let childResults = findPage(child, wikiId, path.concat([folder._id]));
			if (childResults.length > 0) {
				return childResults;
			}
		}

		return [];
	};

	const renderPage = (page, indent) => {
		const style = {'marginLeft': 5 * indent + 5 + 'px'};
		let className = '';
		if (page._id === currentWiki ? currentWiki._id : null) {
			className = 'highlighted';
		}
		return (
			<div key={page._id}>
				<a
					href='#'
					className={className}
					onClick={
						() => {
							history.push(`/ui/world/${currentWorld._id}/wiki/${page._id}/view`);
						}
					}
					style={style}
				>
					<FileTextOutlined /> {page.name}
				</a>
			</div>
		);
	};

	const setEditing = (folder) => {
		if (folder) {
			setFolderBeingEdited(folder._id);
			setNewFolderName(folder.name);
		} else {
			setFolderBeingEdited(null);
			setNewFolderName(null);
		}
	};

	const stopEditing = async (event) => {
		if (event.key === 'Enter') {
			await renameFolder(folderBeingEdited, newFolderName);
			setEditing(null);
		}
		if (event.key === 'Esc') {
			setEditing(null);
		}
	};

	const renderFolder = (folder, indent) => {

		let icon = <RightOutlined />;
		const children = [];
		const pages = [];
		// if we are opened, populate children folders and pages then change icon
		if (opened.includes(folder._id)) {
			icon = <DownOutlined />;
			for(let child of folder.children){
				for (let otherFolder of currentWorld.folders) {
					if(child._id === otherFolder._id){
						children.push(renderFolder(otherFolder, indent + 1));
					}
				}
			}
			for (let page of folder.pages) {
				pages.push(renderPage(page, indent));
			}
		}

		let menu = [
			<a
				title={'Create new wiki page'}
				href='#'
				key='new page'
				onClick={async () => {
					await createWiki('New Page', folder._id);
				}}
			>
				<FileAddOutlined /></a>,
			<a
				title={'Create new folder'}
				href='#'
				key='new folder'
				onClick={async () => {
					await createFolder(folder._id, 'New Folder');
					if (!opened.includes(folder._id)) {
						openFolder(folder._id);
					}
				}}
			>
				<FolderAddOutlined />
			</a>,
			<a
				title={'Rename this folder'}
				href='#'
				key='rename'
				onClick={() => {
					setEditing(folder)
				}}
			>
				<EditOutlined />
			</a>,
			<a
				title={'Move this folder'}
				href={'#'}
				key={'move'}
				onClick={async () => {
					await setFolderBeingMoved(folder);
					await setMoveFolderModalVisibility(true);
				}}
			>
				<ImportOutlined/>
			</a>,
			<a
				title={'Delete this folder'}
				href='#'
				key='delete'
				onClick={() => {
					Modal.confirm({
						title: 'Confirm Delete',
						content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
						onOk: async () => {
							await deleteFolder(folder._id)
						},
						onCancel: () => {
						},
					});
				}}
			>
				<DeleteOutlined/>
			</a>,
			<a
				title={'Export this folder'}
				href={`/export/WikiFolder/${folder._id}`}
				key='export'
			>
				<DownloadOutlined />
			</a>,
			<a
				title={'Import Content'}
				href='#'
				key='import'
				onClick={() => {
					setImportFolder(folder);
					setImportModalVisibility(true);
				}}
			>
				<UploadOutlined />
			</a>,
		];

		if (!folder.canWrite || folderBeingHovered !== folder._id) {
			menu = [];
		}

		let folderItem = (
			<div
				className='flex'
				onMouseEnter={() => {
					setFolderBeingHovered(folder._id);
				}}
				onMouseLeave={() => {
					setFolderBeingHovered(null);
				}}
			>
				<a href='#' className='flex-grow-1' style={{'marginLeft': 5 * indent + 'px'}} onClick={() => {
					openFolder(folder._id)
				}}>
					<span>
						{icon} {folder.name}
					</span>
				</a>
				{menu}
			</div>
		);

		if (folder._id === folderBeingEdited) {
			folderItem = (
				<span style={{'marginLeft': 5 * indent + 'px'}}>
				{icon}
				<input
					type='text'
					ref={editingInput}
					onBlur={() => {
						setEditing(null)
					}}
					onChange={event => setNewFolderName(event.target.value)}
					onKeyDown={stopEditing}
					value={newFolderName}
				/>
			</span>
			);
		}

		return (
			<div key={folder._id}>
				{folderItem}
				{children}
				{pages}
			</div>
		);
	};

	const formItemLayout = {
		labelCol: { span: 10 },
		wrapperCol: { span: 14 },
	};

	const tailLayout = {
		wrapperCol: { offset: 10, span: 14 },
	};

	return (
		<div className='margin-md' style={{fontSize: '17px'}}>
			<Modal visible={importLoading} closable={false} footer={null}>
				<LoadingView/> Importing content ...
			</Modal>
			<Modal
				visible={importModalVisibility}
				footer={null}
			>
				<h2>Import Content</h2>
				<div className={'margin-lg-top'}>
					<Form
						onFinish={async ({file}) => {
							setImportModalVisibility(false);
							await importContent({folderId: importFolder._id, zipFile: file[0].originFileObj});
						}}
					>
						<Form.Item
							{...formItemLayout}
							label={<div><ToolTip>Supported file types: <br/><ul><li>.zip</li></ul></ToolTip> File</div>}
							name="file"
							rules={[
								{required: true, message: 'File required'},
								{validator: async (rule, value) => {
										// this function has to be async b/c the validator has to return a promise
										if(!value || value.length !== 1){
											return;
										}
										const file = value[0];
										const supportedTypes = ['zip'];
										const parts = file.name.split('.');

										const type = parts.length > 0 ? parts[parts.length - 1] : null;
										if(!supportedTypes.includes(type)){
											throw new Error(`File type ${type} not supported`);
										}
									}}
							]}
							getValueFromEvent={(e) => {
								return e.fileList.length > 0 ? [e.fileList[0]] : [];
							}}
							valuePropName="fileList"
						>
							<Upload
								multiple={false}
								beforeUpload={() => false}
							>
								<Button icon={<UploadOutlined />}>Select File</Button>
							</Upload>
						</Form.Item>
						<Form.Item {...tailLayout}>
							<Button type="primary" htmlType="submit" loading={importLoading}>
								Submit
							</Button>
						</Form.Item>
					</Form>
				</div>
			</Modal>
			{folderBeingMoved &&
				<MoveFolderModal
					visibility={moveFolderModalVisibility}
					setVisibility={setMoveFolderModalVisibility}
					folder={folderBeingMoved}
				/>
			}
			{currentWorld.rootFolder && renderFolder(currentWorld.rootFolder, 0)}
		</div>
	);

};
