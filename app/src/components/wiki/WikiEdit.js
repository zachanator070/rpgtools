import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, Select, Upload, InputNumber, Tooltip} from "antd";
import {UploadOutlined, SaveOutlined, DeleteOutlined, UndoOutlined} from "@ant-design/icons";
import {Editor} from "./Editor";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import {useHistory, useParams} from 'react-router-dom';
import {useDeleteWiki} from "../../hooks/wiki/useDeleteWiki";
import {useCreateImage} from "../../hooks/wiki/useCreateImage";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useUpdateWiki from "../../hooks/wiki/useUpdateWiki";
import useUpdatePlace from "../../hooks/wiki/useUpdatePlace";
import {ALL_WIKI_TYPES, MODELED_WIKI_TYPES, PLACE} from "../../../../common/src/type-constants";
import {ToolTip} from "../ToolTip";
import {SelectModel} from "../select/SelectModel";
import {ModelViewer} from "../models/ModelViewer";
import {useUpdateModeledWiki} from "../../hooks/wiki/useUpdateModeledWiki";

export const WikiEdit = () => {

	const history = useHistory();
	const {currentWiki} = useCurrentWiki();
	const {currentWorld, refetch: refetchWorld} = useCurrentWorld();

	const [mapToUpload, setMapToUpload] = useState( false);
	const [coverToUpload, setCoverToUpload] = useState( false);
	const [name, setName] = useState(null);
	const [type, setType] = useState(null);
	const [coverImageList, setCoverImageList] = useState([]);
	const [mapImageList, setMapImageList] = useState([]);
	const [pixelsPerFoot, setPixelsPerFoot] = useState(0);
	const [saving, setSaving] = useState(false);
	const {deleteWiki} = useDeleteWiki();
	const {createImage} = useCreateImage();
	const {updateWiki} = useUpdateWiki();
	const {updatePlace} = useUpdatePlace();
	const {updateModeledWiki} = useUpdateModeledWiki();

	const [selectedModel, setSelectedModel] = useState();

	const [editor, setEditor] = useState(null);

	const {wiki_id} = useParams();

	const loadCoverImageList = async () => {
		await setCoverImageList(currentWiki.coverImage ? [{
			uid: '-1',
			url: `/images/${currentWiki.coverImage.icon.chunks[0].fileId}`,
			name: currentWiki.coverImage.name
		}] : []);
	};

	const loadMapImageList = async () => {
		await setMapImageList(currentWiki.mapImage ? [{
			uid: '-1',
			url: `/images/${currentWiki.mapImage.icon.chunks[0].fileId}`,
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
			await setName(currentWiki.name);
			await setType(currentWiki.type);
			if(MODELED_WIKI_TYPES.includes(currentWiki.type)){
				await setSelectedModel(currentWiki.model);
			}
		})();

	}, [currentWiki]);

	if (!currentWiki) {
		return (<div>{`404 - wiki ${wiki_id} not found`}</div>);
	}

	if(!currentWiki.canWrite){
		return (<div>{`You do not have permission to edit wiki ${wiki_id}`}</div>);
	}

	const wikiTypes = ALL_WIKI_TYPES;
	const options = [];
	for (let type of wikiTypes) {
		options.push(<Select.Option key={type} value={type}>{type}</Select.Option>);
	}

	let coverRevert = null;
	if (coverToUpload !== false) {
		coverRevert = <Button type='danger' className={'margin-md'} onClick={async () => {
			await setCoverToUpload(false);
			await loadCoverImageList();
		}}>Revert</Button>;
	}

	let mapRevert = null;
	if (mapToUpload !== false) {
		mapRevert = <Button type='danger' className={'margin-md'} onClick={async () => {
			await setMapToUpload(false);
			await loadMapImageList();
		}}>Revert</Button>;
	}

	const save = async () => {

		await setSaving(true);

		let coverImageId = currentWiki.coverImage ? currentWiki.coverImage._id : null;
		if(coverToUpload instanceof File){
			const coverUploadResult = await createImage(coverToUpload, currentWorld._id, false);
			coverImageId = coverUploadResult.data.createImage._id
		}
		if(coverToUpload === null) {
			coverImageId = null;
		}

		const contents = new File([JSON.stringify(editor.getContents())], 'contents.json', {
			type: "text/plain",
		});
		await updateWiki(currentWiki._id, name, contents, coverImageId, type );

		if(type === PLACE){
			let mapImageId = currentWiki.mapImage ? currentWiki.mapImage._id : null;
			if(mapToUpload){
				const mapUploadResult = await createImage(mapToUpload, currentWorld._id, true);
				mapImageId = mapUploadResult.data.createImage._id
			}
			if(mapToUpload === null) {
				mapImageId = null;
			}
			await updatePlace(currentWiki._id, mapImageId, pixelsPerFoot);
		}
		if(MODELED_WIKI_TYPES.includes(type)){
			await updateModeledWiki({wikiId: currentWiki._id, model: selectedModel ? selectedModel._id : null});
		}
		await refetchWorld();
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
					beforeUpload={(file) => {
						setCoverToUpload(file);
						return false;
					}}
					multiple={false}
					listType={'picture'}
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
						<UploadOutlined /> Select Cover Image
					</Button>
				</Upload>
				{coverRevert}
			</div>
			{type === PLACE &&
				<>
					<div className='margin-lg'>
						<Upload
							beforeUpload={setMapToUpload}
							multiple={false}
							listType={'picture'}
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
								<UploadOutlined /> Select Map Image
							</Button>
						</Upload>
						{mapRevert}
					</div>
					<div className='margin-lg'>
						Pixels Per Foot:
						<InputNumber
							value={pixelsPerFoot}
							onChange={async (value) => await setPixelsPerFoot(value)}
						/>
                        <ToolTip>
	                        {'Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game.'}
                        </ToolTip>

					</div>
				</>
			}

			{MODELED_WIKI_TYPES.includes(type) &&
					<div className={'margin-lg'}>
						{type} model:
						<SelectModel onChange={setSelectedModel} defaultModel={currentWiki.model}/>
						{selectedModel &&
							<ModelViewer model={selectedModel} />
						}
					</div>
			}

			<div className='margin-lg'>
				<Editor
					content={currentWiki.content}
					onInit={async (editor) => {await setEditor(editor)}}
				/>
			</div>

			<div>
				{saving && <div>Saving ... </div>}
				<Button type='primary' disabled={saving} onClick={save}>
					<SaveOutlined />
					Save
				</Button>
				<Button type='danger' disabled={saving} className='margin-md-left' onClick={() => {
					history.push(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
				}}><UndoOutlined />Discard</Button>
				<span className='absolute-right'>
						<Button
							type='primary'
							danger
							disabled={saving}
							onClick={() => {
								Modal.confirm({
									title: "Confirm Delete",
									content: `Are you sure you want to delete the wiki page ${currentWiki.name}?`,
									onOk: async () => {
										await deleteWiki(currentWiki._id);
										history.push(`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`)
									}
								});
							}}
						>
							<DeleteOutlined />Delete Page
						</Button>
					</span>
			</div>
		</div>
	);
};
