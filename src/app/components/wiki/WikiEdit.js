import React, {Component, useEffect, useRef, useState} from 'react';
import {Button, Icon, Input, Modal, Select, Upload} from "antd";
import {Editor} from "./Editor";
import useCurrentWiki from "../../hooks/useCurrentWiki";
import {LoadingView} from "../LoadingView";
import {useHistory, useParams} from 'react-router-dom';
import {useDeleteWiki} from "../../hooks/useDeleteWiki";
import {useCreateImage} from "../../hooks/useCreateImage";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useUpdateWiki from "../../hooks/useUpdateWiki";
import useUpdatePerson from "../../hooks/useUpdatePerson";
import useUpdatePlace from "../../hooks/useUpdatePlace";
import {ALL_TYPES, PLACE} from "../../../wiki-page-types";

export const WikiEdit = () => {

	const history = useHistory();
	const {currentWiki, loading} = useCurrentWiki();
	const {currentWorld} = useCurrentWorld();

	const [mapToUpload, setMapToUpload] = useState( false);
	const [coverToUpload, setCoverToUpload] = useState( false);
	const [name, setName] = useState(currentWiki && currentWiki.name);
	const [type, setType] = useState(currentWiki && currentWiki.type);
	const [coverImageList, setCoverImageList] = useState([]);
	const [mapImageList, setMapImageList] = useState([]);
	const {deleteWiki} = useDeleteWiki();
	const {createImage} = useCreateImage();
	const {updateWiki, loading: updateWikiLoading} = useUpdateWiki();
	const {updatePlace, loading: updatePlaceLoading} = useUpdatePlace();
	const {updatePerson, loading: updatePersonLoading} = useUpdatePerson();

	const [editor, setEditor] = useState(null);

	const {wiki_id} = useParams();

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

	if(loading){
		return <LoadingView/>
	}

	if (!currentWiki) {
		return (<div>{`404 - wiki ${wiki_id} not found`}</div>);
	}

	if(!currentWiki.canWrite){
		return (<div>{`You do not have permission to edit wiki ${wiki_id}`}</div>);
	}

	const wikiTypes = ALL_TYPES;
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

	let saving = updateWikiLoading || updatePersonLoading || updatePlaceLoading;

	const save = async () => {

		let coverImageId = currentWiki.coverImage ? currentWiki.coverImage._id : null;
		if(coverToUpload){
			const coverUploadResult = await createImage(coverToUpload, currentWorld._id, false);
			coverImageId = coverUploadResult.createImage._id
		}

		switch(type){
			// case PLACE:
			// 	let mapImageId = currentWiki.mapImage ? currentWiki.mapImage._id : null;
			// 	if(mapToUpload){
			// 		const mapUploadResult = await createImage(mapToUpload, currentWorld._id, true);
			// 		mapImageId = mapUploadResult.createImage._id
			// 	}
			// 	await updatePlace(currentWiki._id, name, JSON.stringify(editor.getContents()), coverImageId, mapImageId);
			// 	break;
			default:
				const contents = new File([JSON.stringify(editor.getContents())], 'contents.json', {
					type: "text/plain",
				});
				console.log(await contents.text());
				await updateWiki(currentWiki._id, name, contents, coverImageId, type );
				break;
		}

		history.push(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
	};

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
					action={async (file) => {}}
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
			{type === PLACE ?
				<div className='margin-lg'>
					<Upload
						action={async (file) => {}}
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
					onInit={async (editor) => {await setEditor(editor)}}
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
									history.push(`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`)
								}
							});
						}}><Icon type="delete"/>Delete Page</Button>
					</span>
			</div>
		</div>
	);
};
