import React, {Component} from 'react';
import {Button, Icon, Input, Modal, Select, Upload} from "antd";
import Editor from "./editor";

class WikiEdit extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mapToUpload: false,
			coverToUpload: false,
			name: props.currentWiki ? props.currentWiki.name : null,
			type: props.currentWiki ? props.currentWiki.type : null,
			coverImageList: [],
			mapImageList: [],
			saving: false
		}
	}

	loadCoverImageList = () => {
		this.setState({
			coverImageList: this.props.currentWiki.coverImage ? [{
				uid: '-1',
				url: `/api/chunks/data/${this.props.currentWiki.coverImage.chunks[0]._id}`,
				name: this.props.currentWiki.coverImage.name
			}] : []
		});
	};

	setCoverImageList = (files) => {
		this.setState({
			coverImageList: files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []
		});
		if (files.fileList.length === 0) {
			this.setState({
				coverToUpload: null
			});
		}
	};

	setMapImageList = (files) => {
		this.setState({
			mapImageList: files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []
		});
		if (files.fileList.length === 0) {
			this.setState({
				mapToUpload: null
			});
		}
	};

	loadMapImageList = () => {
		this.setState({
			mapImageList: this.props.currentWiki.mapImage ? [{
				uid: '-1',
				url: `/api/chunks/data/${this.props.currentWiki.mapImage.chunks[0]._id}`,
				name: this.props.currentWiki.mapImage.name
			}] : []
		});
	};

	componentDidMount() {
		if (!this.props.currentWiki) {
			return;
		}

		this.loadCoverImageList();
		this.loadMapImageList();
	}

	save = () => {
		this.setState({saving: true});
		this.props.saveWiki(
			this.state.name,
			this.state.type,
			this.state.coverToUpload,
			this.state.mapToUpload,
			this.refs.editor.editor.getContents()
		);
	};

	setMapToUpload = (file) => {
		this.setState({
			mapToUpload: file
		});
		return false;
	};

	setCoverToUpload = (file) => {
		this.setState({
			coverToUpload: file
		});
		return false;
	};

	setType = (value) => {
		this.setState({
			type: value
		});
	};

	setName = (value) => {
		this.setState({
			name: value.target.value
		});
	};

	render() {
		if (!this.props.currentWiki) {
			return (<div></div>);
		}

		const wikiTypes = ['person', 'place', 'item', 'ability', 'spell', 'article', 'monster'];
		const options = [];
		for (let type of wikiTypes) {
			options.push(<Select.Option key={type} value={type}>{type}</Select.Option>);
		}

		let coverRevert = null;
		if (this.state.coverToUpload !== false) {
			coverRevert = <Button onClick={() => {
				this.setCoverToUpload(false);
				this.loadCoverImageList();
			}}>Revert</Button>;
		}

		let mapRevert = null;
		if (this.state.mapToUpload !== false) {
			mapRevert = <Button type='danger' onClick={() => {
				this.setMapToUpload(false);
				this.loadMapImageList();
			}}>Revert</Button>;
		}

		return (
			<div>
				<div className='margin-lg'>
					Article Name: <Input placeholder="Article Name" style={{width: 120}} value={this.state.name}
					                     onChange={this.setName}/>
				</div>
				<div className='margin-lg'>
					Type: <Select defaultValue={this.props.currentWiki.type} style={{width: 120}}
					              onChange={this.setType}>
					{options}
				</Select>
				</div>
				<div className='margin-lg'>
					<Upload
						action="/api/images"
						beforeUpload={this.setCoverToUpload}
						multiple={false}
						listType={'picture'}
						coverImage={this.state.coverToUpload}
						fileList={this.state.coverImageList}
						className='upload-list-inline'
						onChange={this.setCoverImageList}
					>
						<Button>
							<Icon type="upload"/> Select Cover Image
						</Button>
					</Upload>
					{coverRevert}
				</div>
				{this.state.type === 'place' ?
					<div className='margin-lg'>
						<Upload
							action="/api/images"
							beforeUpload={this.setMapToUpload}
							multiple={false}
							listType={'picture'}
							coverImage={this.state.mapToUpload}
							fileList={this.state.mapImageList}
							className='upload-list-inline'
							onChange={this.setMapImageList}
						>
							<Button>
								<Icon type="upload"/> Select Map Image
							</Button>
						</Upload>
						{mapRevert}
					</div>
					: null
				}

				<div className='margin-lg'>
					<Editor
						content={this.props.currentWiki.content}
						currentWorld={this.props.currentWorld}
						currentMap={this.props.currentMap}
						currentWiki={this.props.currentWiki}
						searchWikis={this.props.searchWikis}
						ref="editor"
					/>
				</div>

				<div>
					<Button type='primary' disabled={this.state.saving} onClick={this.save}><Icon
						type="save"/>Save</Button>
					<Button type='danger' disabled={this.state.saving} className='margin-md-left' onClick={() => {
						this.props.gotoPage('/ui/wiki/view')
					}}><Icon type="undo"/>Discard</Button>
					<span className='absolute-right'>
						<Button type='danger' disabled={this.state.saving} onClick={() => {
							Modal.confirm({
								title: "Confirm Delete",
								content: `Are you sure you want to delete the wiki page ${this.props.currentWiki.name}?`,
								onOk: () => {
									this.props.deleteWikiPage(this.props.currentWiki);
								}
							});
						}}><Icon type="delete"/>Delete Page</Button>
					</span>
				</div>
			</div>
		);
	}
}

export default WikiEdit;