import React, {useEffect, useRef, useState} from 'react';
import {Modal} from "antd";
import {
	FileTextOutlined,
	RightOutlined,
	DownOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	EditOutlined,
	DeleteOutlined
} from '@ant-design/icons';
import useCurrentWiki from "../../hooks/useCurrentWiki";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useRenameFolder} from "../../hooks/useRenameFolder";
import {useDeleteFolder} from "../../hooks/useDeleteFolder";
import {useCreateWiki} from "../../hooks/useCreateWiki";
import {useHistory} from "react-router-dom";
import useCreateFolder from "../../hooks/useCreateFolder";

export const FolderView = () => {

	const history = useHistory();
	const [opened, setOpened] = useState([]);
	const [folderBeingEdited, setFolderBeingEdited] = useState(null);
	const [newFolderName, setNewFolderName] = useState('');
	const [folderBeingHovered, setFolderBeingHovered] = useState(null);

	const {currentWiki} = useCurrentWiki();
	const {currentWorld} = useCurrentWorld();

	const {renameFolder} = useRenameFolder();
	const {deleteFolder} = useDeleteFolder();
	const {createWiki} = useCreateWiki();
	const {createFolder} = useCreateFolder();

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
			<a href='#' key='new page' onClick={async () => {
				await createWiki('New Page', folder._id);
			}}><FileAddOutlined /></a>,
			<a href='#' key='new folder' onClick={async () => {
				await createFolder(folder._id, 'New Folder');
				if (!opened.includes(folder._id)) {
					openFolder(folder._id);
				}
			}}><FolderAddOutlined /></a>,
			<a href='#' key='rename' onClick={() => {
				setEditing(folder)
			}}><EditOutlined /></a>,
			<a href='#' key='delete' onClick={() => {
				Modal.confirm({
					title: 'Confirm Delete',
					content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
					onOk: async () => {
						await deleteFolder(folder._id)
					},
					onCancel: () => {
					},
				});
			}}><DeleteOutlined/></a>
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
				{icon} <input type='text' ref={editingInput} onBlur={() => {
					setEditing(null)
				}} onChange={event => setNewFolderName(event.target.value)} onKeyDown={stopEditing} value={newFolderName}/>
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

	return (
		<div className='margin-md' style={{fontSize: '17px'}}>
			{currentWorld.rootFolder && renderFolder(currentWorld.rootFolder, 0)}
		</div>
	);

};
