import React, {useEffect, useRef, useState} from 'react';
import {Icon, Modal} from "antd";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {useRenameFolder} from "../../hooks/useRenameFolder";
import {useDeleteFolder} from "../../hooks/useDeleteFolder";
import {useCreateWiki} from "../../hooks/useCreateWiki";
import {useHistory} from "react-router-dom";

export const FolderView = () => {

	const history = useHistory();
	const [opened, setOpened] = useState([]);
	const [folderBeingEdited, setFolderBeingEdited] = useState(null);
	const [newFolderName, setNewFolderName] = useState('');
	const [folderBeingHovered, setFolderBeingHovered] = useState(null);

	const {currentWiki, loading} = useCurrentWiki();
	const {currentWorld} = useCurrentWorld();

	const {renameFolder} = useRenameFolder();
	const {deleteFolder} = useDeleteFolder();
	const {createWiki} = useCreateWiki();

	const editingInput = useRef(null);

	useEffect(() => {
		const currentPagePath = findPage(currentWorld.rootFolder, currentWiki ? currentWiki._id : null, []);
		setOpened(opened.concat(currentPagePath));
	}, []);
	
	useEffect(() => {
		if (editingInput.current) {
			editingInput.current.focus();
		}
	});

	useEffect(() => {
		if(currentWiki){
			const currentPagePath = findPage(currentWorld.rootFolder, currentWiki._id, []);
			setOpened(opened.concat(currentPagePath));
		}
	}, [currentWiki]);

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
					<Icon type="file-text" theme="outlined"/> {page.name}
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

	const createFolder = (parent) => {
		createFolder(parent, {name: 'New Folder'});
		if (!opened.includes(parent._id)) {
			openFolder(parent._id);
		}
	};

	const renderFolder = (folder, indent) => {

		let icon = <Icon type="right" theme="outlined"/>;
		const children = [];
		const pages = [];
		// if we are opened, populate children folders and pages then change icon
		if (opened.includes(folder._id)) {
			icon = <Icon type="down" theme="outlined"/>;
			for (let otherFolder of folder.children) {
				children.push(renderFolder(otherFolder, indent + 1));
			}
			for (let page of folder.pages) {

				pages.push(renderPage(page, indent));
			}
		}

		let menu = [
			<a href='#' key='new page' onClick={async () => {
				await createWiki('New Page', 'article', folder)
			}}><Icon type="file-add"/></a>,
			<a href='#' key='new folder' onClick={() => {
				createFolder(folder)
			}}><Icon type="folder-add"/></a>,
			<a href='#' key='rename' onClick={() => {
				setEditing(folder)
			}}><Icon type="edit"/></a>,
			<a href='#' key='delete' onClick={() => {
				Modal.confirm({
					title: 'Confirm Delete',
					content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
					onOk: async () => {
						await deleteFolder(folder)
					},
					onCancel: () => {
					},
				});
			}}><Icon type="delete"/></a>
		];

		if (!currentWorld.canWrite || folderBeingHovered !== folder._id) {
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

	const folders = [];
	for (let folder of currentWorld.rootFolder.children) {
		folders.push(renderFolder(folder, 0));
	}
	const pages = [];
	for (let page of currentWorld.rootFolder.pages) {
		pages.push(renderPage(page, 0))
	}
	return (
		<div className='margin-md' style={{fontSize: '17px'}}>
			{folders}
			{pages}
		</div>
	);

};
