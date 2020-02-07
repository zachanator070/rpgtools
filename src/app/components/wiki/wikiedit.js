import React, {Component, useEffect, useState} from 'react';
import {Button, Icon, Input, Modal, Select, Upload} from "antd";
import {Editor} from "./editor";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {LoadingView} from "../loadingview";
import {useHistory} from 'react-router-dom';
import {useDeleteWiki} from "../../hooks/useDeleteWiki";
import {useCreateImage} from "../../hooks/useCreateImage";
import useCurrentWorld from "../../hooks/useCurrentWorld";

export const WikiEdit = () => {

	const history = useHistory();
	const {currentWiki, loading} = useCurrentWiki();
	const {currentWorld} = useCurrentWorld();

	const [mapToUpload, setMapToUpload] = useState( false);
	const [coverToUpload, setCoverToUpload] = useState( false);
	const [name, setName] = useState(currentWiki ?? currentWiki.name);
	const [type, setType] = useState(currentWiki ?? currentWiki.type);
	const [coverImageList, setCoverImageList] = useState([]);
	const [mapImageList, setMapImageList] = useState([]);
	const {deleteWiki} = useDeleteWiki();
	const {createImage} = useCreateImage();

	if(loading){
		return <LoadingView/>
	}

	if (!currentWiki) {
		return (<div>Please Search for or select a wiki on the side</div>);
	}

	const loadCoverImageList = async () => {
		await setCoverImageList(currentWiki.coverImage ? [{
			uid: '-1',
			url: `data:image/png;base64,${currentWiki.coverImage.chunks[0].data}`,
			name: currentWiki.coverImage.name
		}] : []);
	};

	const loadMapImageList = async () => {
		await setMapImageList(currentWiki.mapImage ? [{
			uid: '-1',
			url: `data:image/png;base64,${currentWiki.mapImage.chunks[0].data}`,
			name: currentWiki.mapImage.name
		}] : []);
	};

	useEffect(() => {
		if (!currentWiki) {
			return;
		}
		(async () => {
			await loadCoverImageList();
			await loadMapImageList();
		})();

	}, []);

	const wikiTypes = ['person', 'place', 'item', 'ability', 'spell', 'article', 'monster'];
	const options = [];
	for (let type of wikiTypes) {
		options.push(<Select.Option key={type} value={type}>{type}</Select.Option>);
	}

	let coverRevert = null;
	if (coverToUpload !== false) {
		coverRevert = <Button onClick={async () => {
			await setCoverToUpload(null);
			await loadCoverImageList();
		}}>Revert</Button>;
	}

	let mapRevert = null;
	if (mapToUpload !== false) {
		mapRevert = <Button type='danger' onClick={async () => {
			await setMapToUpload(false);
			await loadMapImageList();
		}}>Revert</Button>;
	}

	return (
		<div>
			<div className='margin-lg'>
				Article Name: <Input placeholder="Article Name" style={{width: 120}} value={name}
				                     onChange={async (event) => await setName(event.target.value)}/>
			</div>
			<div className='margin-lg'>
				Type: <Select defaultValue={currentWiki.type} style={{width: 120}}
				              onChange={setType}>
				{options}
			</Select>
			</div>
			<div className='margin-lg'>
				<Upload
					action="/api/images"
					beforeUpload={setCoverToUpload}
					multiple={false}
					listType={'picture'}
					coverImage={coverToUpload}
					fileList={coverImageList}
					className='upload-list-inline'
					onChange={async (files) => {
						await setCoverImageList(files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []);
						if (files.fileList.length === 0) {
							await setCoverToUpload(null);
						}
					}}
				>
					<Button>
						<Icon type="upload"/> Select Cover Image
					</Button>
				</Upload>
				{coverRevert}
			</div>
			{type === 'place' ?
				<div className='margin-lg'>
					<Upload
						action="/api/images"
						beforeUpload={setMapToUpload}
						multiple={false}
						listType={'picture'}
						coverImage={mapToUpload}
						fileList={mapImageList}
						className='upload-list-inline'
						onChange={async (files) => {
							await setMapImageList(files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []);
							if (files.fileList.length === 0) {
								await setMapToUpload(null);
							}
						}}
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
					content={currentWiki.content}
				/>
			</div>

			<div>
				<Button type='primary' disabled={saving} onClick={save}><Icon
					type="save"/>Save</Button>
				<Button type='danger' disabled={saving} className='margin-md-left' onClick={() => {
					history.push(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
				}}><Icon type="undo"/>Discard</Button>
				<span className='absolute-right'>
						<Button type='danger' disabled={saving} onClick={() => {
							Modal.confirm({
								title: "Confirm Delete",
								content: `Are you sure you want to delete the wiki page ${currentWiki.name}?`,
								onOk: async () => {
									await deleteWiki(currentWiki._id);
								}
							});
						}}><Icon type="delete"/>Delete Page</Button>
					</span>
			</div>
		</div>
	);
};
