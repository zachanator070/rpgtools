import React, { useEffect, useState } from "react";
import {Modal, Upload, InputNumber, Select, Button, Input} from "antd";
import { UploadOutlined, SaveOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import Editor from "./Editor";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import { useHistory, useParams } from "react-router-dom";
import useDeleteWiki from "../../hooks/wiki/useDeleteWiki";
import useCreateImage from "../../hooks/wiki/useCreateImage";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useUpdateWiki from "../../hooks/wiki/useUpdateWiki";
import useUpdatePlace from "../../hooks/wiki/useUpdatePlace";
import { ALL_WIKI_TYPES, MODELED_WIKI_TYPES, PLACE } from "@rpgtools/common/src/type-constants";
import ToolTip from "../widgets/ToolTip";
import SelectModel from "../select/SelectModel";
import ModelViewer from "../models/ModelViewer";
import useUpdateModeledWiki from "../../hooks/wiki/useUpdateModeledWiki";
import LoadingView from "../LoadingView";
import MoveWikiButton from "./MoveWikiButton";
import {Model, ModeledWiki, Place} from "../../types";

export default function WikiEdit() {
	const history = useHistory();
	const { currentWiki, loading } = useCurrentWiki();
	const { currentWorld, refetch: refetchWorld } = useCurrentWorld();

	const [mapToUpload, setMapToUpload] = useState<File>();
	const [coverToUpload, setCoverToUpload] = useState<File>(undefined);
	const [name, setName] = useState(null);
	const [type, setType] = useState(null);
	const [coverImageList, setCoverImageList] = useState([]);
	const [mapImageList, setMapImageList] = useState([]);
	const [pixelsPerFoot, setPixelsPerFoot] = useState<number>(0);
	const [modelColor, setModelColor] = useState<string>();
	const [saving, setSaving] = useState(false);
	const { deleteWiki } = useDeleteWiki();
	const { createImage } = useCreateImage();
	const { updateWiki } = useUpdateWiki();
	const { updatePlace } = useUpdatePlace();
	const { updateModeledWiki } = useUpdateModeledWiki();

	const [selectedModel, setSelectedModel] = useState<Model>();

	const [editor, setEditor] = useState(null);

	const { wiki_id } = useParams();

	const loadCoverImageList = async () => {
		await setCoverImageList(
			currentWiki.coverImage
				? [
						{
							uid: "-1",
							url: `/images/${currentWiki.coverImage.icon.chunks[0].fileId}`,
							name: currentWiki.coverImage.name,
						},
				  ]
				: []
		);
	};

	const loadMapImageList = async () => {
		const currentMap = currentWiki as Place;
		await setMapImageList(
			currentMap.mapImage
				? [
						{
							uid: "-1",
							url: `/images/${currentMap.mapImage.icon.chunks[0].fileId}`,
							name: currentMap.mapImage.name,
						},
				  ]
				: []
		);
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
			if(currentWiki.type === PLACE) {
				const currentMap = currentWiki as Place;
				await setPixelsPerFoot(currentMap.pixelsPerFoot);
			}
			if (MODELED_WIKI_TYPES.includes(currentWiki.type)) {
				const modeledWiki = currentWiki as ModeledWiki;
				setSelectedModel(modeledWiki.model);
				setModelColor(modeledWiki.modelColor);
			}
		})();
	}, [currentWiki]);

	if (loading) {
		return <LoadingView/>;
	}

	if (!currentWiki) {
		return <div>{`404 - wiki ${wiki_id} not found`}</div>;
	}

	if (!currentWiki.canWrite) {
		return <div>{`You do not have permission to edit wiki ${wiki_id}`}</div>;
	}

	const wikiTypes = ALL_WIKI_TYPES;
	const options = [];
	for (let type of wikiTypes) {
		options.push(
			<Select.Option key={type} value={type}>
				{type}
			</Select.Option>
		);
	}

	let coverRevert = null;
	if (coverToUpload) {
		coverRevert = (
			<Button
				danger={true}
				className={"margin-md"}
				onClick={async () => {
					await setCoverToUpload(undefined);
					await loadCoverImageList();
				}}
				id={'revertCover'}
			>
				Revert
			</Button>
		);
	}

	let mapRevert = null;
	if (mapToUpload) {
		mapRevert = (
			<Button
				danger={true}
				className={"margin-md"}
				onClick={async () => {
					await setMapToUpload(undefined);
					await loadMapImageList();
				}}
				id={'revertMap'}
			>
				Revert
			</Button>
		);
	}

	const save = async () => {
		await setSaving(true);

		let coverImageId = currentWiki.coverImage ? currentWiki.coverImage._id : undefined;
		if (coverToUpload) {
			const coverUploadResult = await createImage({file: coverToUpload, worldId: currentWorld._id, chunkify: false});
			coverImageId = coverUploadResult._id;
		} else if (coverToUpload === null) {
			coverImageId = null;
		}

		const contents = editor != null ? new File([JSON.stringify(editor.getContents())], "contents.json", {
			type: "text/plain",
		}) : null;
		await updateWiki({wikiId: currentWiki._id, name, content: contents, coverImageId, type});

		if (type === PLACE) {
			const currentPlace = currentWiki as Place;
			let mapImageId = currentPlace.mapImage ? currentPlace.mapImage._id : undefined;
			if (mapToUpload) {
				const mapUploadResult = await createImage({file: mapToUpload, worldId: currentWorld._id, chunkify: true});
				mapImageId = mapUploadResult._id;
			} else if (mapToUpload === null) {
				mapImageId = null;
			}
			await updatePlace({placeId: currentPlace._id, mapImageId, pixelsPerFoot});
		}
		if (MODELED_WIKI_TYPES.includes(type)) {
			await updateModeledWiki({
				wikiId: currentWiki._id,
				model: selectedModel ? selectedModel._id : null,
				color: modelColor,
			});
		}
		await refetchWorld();
		history.push(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
	};

	if (saving) {
		return (
			<span>
				<span className={"margin-lg"}>
					<LoadingView />
				</span>{" "}
				Saving {currentWiki.name} ...
			</span>
		);
	}

	let modeledWikiFields = null;

	if(MODELED_WIKI_TYPES.includes(type)){
		const currentModeledWiki = currentWiki as ModeledWiki;
		modeledWikiFields = (<div className={"margin-lg"}>
			{type} model:
			<span className={"margin-md"}>
						<SelectModel
							onChange={async (newModel: Model) => setSelectedModel(newModel)}
							defaultModel={currentModeledWiki.model}
						/>
					</span>
			{selectedModel && (
				<ModelViewer
					model={selectedModel}
					defaultColor={currentModeledWiki.modelColor}
					showColorControls={true}
					onChangeColor={async (color: string) => setModelColor(color)}
				/>
			)}
		</div>);
	}

	return (
		<div>
			<div className="margin-lg">
				Article Name:{" "}
				<Input
					placeholder="Article Name"
					style={{ width: 120 }}
					value={name}
					onChange={async (event) => setName(event.target.value)}
				/>
			</div>
			<div className="margin-lg">
				Type:{" "}
				<Select defaultValue={currentWiki.type} style={{ width: 120 }} onChange={setType}>
					{options}
				</Select>
			</div>
			<div className="margin-lg">
				<Upload
					beforeUpload={(file) => {
						setCoverToUpload(file);
						return false;
					}}
					multiple={false}
					listType={"picture"}
					fileList={coverImageList}
					className="upload-list-inline"
					onChange={async (files) => {
						await setCoverImageList(
							files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []
						);
						if (files.fileList.length === 0) {
							await setCoverToUpload(null);
						}
					}}
					id={'coverImageUpload'}
				>
					<Button>
						<UploadOutlined /> Select Cover Image
					</Button>
				</Upload>
				{coverRevert}
			</div>
			{type === PLACE && (
				<>
					<div className="margin-lg">
						<Upload
							beforeUpload={(file) => {
								setMapToUpload(file);
								return false;
							}}
							multiple={false}
							listType={"picture"}
							fileList={mapImageList}
							className="upload-list-inline"
							onChange={async (files) => {
								await setMapImageList(
									files.fileList.length > 0 ? [files.fileList[files.fileList.length - 1]] : []
								);
								if (files.fileList.length === 0) {
									await setMapToUpload(null);
								}
							}}
							id={'mapImageUpload'}
						>
							<Button>
								<UploadOutlined /> Select Map Image
							</Button>
						</Upload>
						{mapRevert}
					</div>
					<div className="margin-lg">
						Pixels Per Foot:
						<InputNumber
							value={pixelsPerFoot}
							onChange={async (value) => setPixelsPerFoot(value)}
						/>
						<ToolTip title={"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."}/>
					</div>
				</>
			)}

			{modeledWikiFields}
			<div className="margin-lg">
				<Editor
					content={currentWiki.content}
					onInit={async (editor) => {
						await setEditor(editor);
					}}
				/>
			</div>

			<div>
				{saving && <div>Saving ... </div>}
				<Button type="primary" disabled={saving} onClick={save}>
					<SaveOutlined />
					Save
				</Button>
				<MoveWikiButton wikiPage={currentWiki} />
				<Button
					danger={true}
					disabled={saving}
					className="margin-md-left"
					onClick={() => {
						history.push(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
					}}
				>
					<UndoOutlined />
					Discard
				</Button>
				<span className="absolute-right">
					<Button
						type="primary"
						danger
						disabled={saving}
						onClick={() => {
							Modal.modalConfirm({
								title: "Confirm Delete",
								content: `Are you sure you want to delete the wiki page ${currentWiki.name}?`,
								onOk: async () => {
									await deleteWiki({wikiId: currentWiki._id});
									history.push(
										`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
									);
								},
							});
						}}
					>
						<DeleteOutlined />
						Delete Page
					</Button>
				</span>
			</div>
		</div>
	);
};
