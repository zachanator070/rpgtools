import React, {Component} from 'react';
import {Icon, Modal} from "antd";

class FolderView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selected: null,
			opened: [],
			editing: null,
			newName: null,
			mouseOn: null
		}
	}

	componentDidMount() {
		const currentPagePath = this.findPage(this.props.currentWorld.rootFolder, this.props.currentWiki ? this.props.currentWiki._id : null, []);
		this.setState({
			opened: this.state.opened.concat(currentPagePath)
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.refs.editing) {
			this.refs.editing.focus();
		}
		if (this.props.currentWiki && (!prevProps.currentWiki || this.props.currentWiki._id !== prevProps.currentWiki._id)) {

			const currentPagePath = this.findPage(this.props.currentWorld.rootFolder, this.props.currentWiki._id, []);
			this.setState({
				opened: this.state.opened.concat(currentPagePath)
			});
		}
	}

	openFolder = (folderId) => {
		// if we are opened already, remove from list
		if (this.state.opened.includes(folderId)) {
			let copy = this.state.opened.slice();
			copy.splice(copy.indexOf(folderId), 1);
			this.setState({
				opened: copy
			});
		} else {
			// otherwise if we aren't opened, add to list
			this.setState({
				opened: this.state.opened.concat(folderId)
			});
		}
	};

	findPage = (folder, wikiId, path) => {
		if (folder.pages.filter((page) => {
			return page._id === wikiId;
		}).length > 0) {
			return path.concat([folder._id]);
		}

		for (let child of folder.children) {
			let childResults = this.findPage(child, wikiId, path.concat([folder._id]));
			if (childResults.length > 0) {
				return childResults;
			}
		}

		return [];
	};

	renderPage = (page, indent) => {
		const style = {'marginLeft': 5 * indent + 5 + 'px'};
		let className = '';
		if (page._id === this.props.currentWiki ? this.props.currentWiki._id : null) {
			className = 'highlighted';
		}
		return (
			<div key={page._id}>
				<a
					href='#'
					className={className}
					onClick={
						() => {
							this.props.gotoPage('/ui/wiki/view', {wiki: page._id})
						}
					}
					style={style}
				>
					<Icon type="file-text" theme="outlined"/> {page.name}
				</a>
			</div>
		);
	};

	setEditing = (folder) => {
		if (folder) {
			this.setState({
				editing: folder._id,
				newName: folder.name
			});
		} else {
			this.setState({
				editing: null,
				newName: null
			});
		}
	};

	stopEditing = (event) => {
		if (event.key === 'Enter') {
			this.props.updateFolder({_id: this.state.editing, name: this.state.newName});
			this.setEditing(null);
		}
		if (event.key === 'Esc') {
			this.setEditing(null);
		}
	};

	setNewName = (event) => {
		this.setState({
			newName: event.target.value
		});
	};

	createFolder = (parent) => {
		this.props.createFolder(parent, {name: 'New Folder'});
		if (!this.state.opened.includes(parent._id)) {
			this.openFolder(parent._id);
		}
	};

	renderFolder = (folder, indent) => {

		let icon = <Icon type="right" theme="outlined"/>;
		const children = [];
		const pages = [];
		// if we are opened, populate children folders and pages then change icon
		if (this.state.opened.includes(folder._id)) {
			icon = <Icon type="down" theme="outlined"/>;
			for (let otherFolder of folder.children) {
				children.push(this.renderFolder(otherFolder, indent + 1));
			}
			for (let page of folder.pages) {

				pages.push(this.renderPage(page, indent));
			}
		}

		let menu = [
			<a href='#' key='new page' onClick={() => {
				this.props.createWiki('New Page', 'article', folder)
			}}><Icon type="file-add"/></a>,
			<a href='#' key='new folder' onClick={() => {
				this.createFolder(folder)
			}}><Icon type="folder-add"/></a>,
			<a href='#' key='rename' onClick={() => {
				this.setEditing(folder)
			}}><Icon type="edit"/></a>,
			<a href='#' key='delete' onClick={() => {
				Modal.confirm({
					title: 'Confirm Delete',
					content: `Are you sure you want to delete the folder "${folder.name}? This will delete all content in this folder as well."`,
					onOk: () => {
						this.props.deleteFolder(folder)
					},
					onCancel: () => {
					},
				});
			}}><Icon type="delete"/></a>
		];

		if (!this.props.currentWorld.canWrite || this.state.mouseOver !== folder._id) {
			menu = [];
		}

		let folderItem = (
			<div
				className='flex'
				onMouseEnter={() => {
					this.setState({mouseOver: folder._id})
				}}
				onMouseLeave={() => {
					this.setState({mouseOver: null})
				}}
			>
				<a href='#' className='flex-grow-1' style={{'marginLeft': 5 * indent + 'px'}} onClick={() => {
					this.openFolder(folder._id)
				}}>
						<span>
							{icon} {folder.name}
						</span>
				</a>
				{menu}
			</div>
		);

		if (folder._id === this.state.editing) {
			folderItem = (
				<span style={{'marginLeft': 5 * indent + 'px'}}>
					{icon} <input type='text' ref='editing' onBlur={() => {
					this.setEditing(null)
				}} onChange={this.setNewName} onKeyDown={this.stopEditing} value={this.state.newName}/>
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

	render() {

		const toRender = [];
		for (let folder of this.props.currentWorld.rootFolder.children) {
			toRender.push(this.renderFolder(folder, 0));
		}
		const pages = [];
		for (let page of this.props.currentWorld.rootFolder.pages) {
			pages.push(this.renderPage(page, 0))
		}
		return (
			<div className='margin-md' style={{fontSize: '17px'}}>
				{toRender}
				{pages}
			</div>
		);

	}
}

export default FolderView;