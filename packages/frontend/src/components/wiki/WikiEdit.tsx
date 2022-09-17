import React, { useEffect, useState } from "react";
import useCurrentWiki from "../../hooks/wiki/useCurrentWiki";
import { useNavigate, useParams } from "react-router-dom";
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
import useModal from "../widgets/useModal";
import Errors from "../Errors";
import PrimaryDangerButton from "../widgets/PrimaryDangerButton";
import TextInput from "../widgets/input/TextInput";
import DropdownSelect from "../widgets/DropdownSelect";
import ImageInput from "../widgets/input/ImageInput";
import DeleteIcon from "../widgets/icons/DeleteIcon";
import UndoIcon from "../widgets/icons/UndoIcon";
import PrimaryButton from "../widgets/PrimaryButton";
import SaveIcon from "../widgets/icons/SaveIcon";
import Editor from "./Editor";
import NumberInput from "../widgets/input/NumberInput";
import FormItem from "../widgets/input/FormItem";
import SecondaryDangerButton from "../widgets/SecondaryDangerButton";

export default function WikiEdit() {
	const navigate = useNavigate();
	const { currentWiki, loading } = useCurrentWiki();
	const { currentWorld, refetch: refetchWorld } = useCurrentWorld();

	const [name, setName] = useState(null);
	const [type, setType] = useState(null);
	const [newCoverImageFile, setNewCoverImageFile] = useState<any>(undefined);
	const [newMapImageFile, setNewMapImageFile] = useState<any>(undefined);
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
	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	const { wiki_id } = useParams();
	const {modalConfirm} = useModal();


	useEffect(() => {
		if (!currentWiki) {
			return;
		}
		(async () => {
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
		return <Errors
			errors={[`404 - wiki ${wiki_id} not found`]}
		/>;
	}

	if (!currentWiki.canWrite) {
		return <Errors
			errors={[`You do not have permission to edit wiki ${wiki_id}`]}
		/>;
	}

	const wikiTypes = ALL_WIKI_TYPES;
	const options = [];
	for (let type of wikiTypes) {
		options.push({
			label: type,
			value: type
		});
	}

	const save = async () => {
		await setSaving(true);

		let coverImageId = currentWiki.coverImage ? currentWiki.coverImage._id : undefined;
		if (newCoverImageFile) {
			const coverUploadResult = await createImage({file: newCoverImageFile, worldId: currentWorld._id, chunkify: false});
			coverImageId = coverUploadResult._id;
		} else if (newCoverImageFile === null) {
			coverImageId = null;
		}

		const contents = editor != null ? new File([JSON.stringify(editor.getContents())], "contents.json", {
			type: "text/plain",
		}) : null;
		await updateWiki({wikiId: currentWiki._id, name, content: contents, coverImageId, type});

		if (type === PLACE) {
			const currentPlace = currentWiki as Place;
			let mapImageId = currentPlace.mapImage ? currentPlace.mapImage._id : undefined;
			if (newMapImageFile) {
				const mapUploadResult = await createImage({file: newMapImageFile, worldId: currentWorld._id, chunkify: true});
				mapImageId = mapUploadResult._id;
			} else if (newMapImageFile === null) {
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
		navigate(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
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
		modeledWikiFields = (<div className={"margin-lg"} ref={setModelViewerContainer}>
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
					container={modelViewerContainer}
				/>
			)}
		</div>);
	}

	return (
		<div>
			<div className="margin-lg">
				Article Name:{" "}
				<TextInput
					style={{ width: 120 }}
					value={name}
					onChange={async (event) => setName(event.target.value)}
				/>
			</div>
			<div className="margin-lg">
				Type:{" "}
				<DropdownSelect defaultValue={currentWiki.type} style={{ width: 120 }} onChange={setType} options={options}/>
			</div>
			<div className="margin-lg">
				<ImageInput
					onChange={setNewCoverImageFile}
					initialImage={currentWiki.coverImage}
					id={'coverImageUpload'}
					revertId={'coverImageRevert'}
					buttonText={"Select Cover Image"}
				/>
			</div>
			{type === PLACE && (
				<>
					<div className="margin-lg">
						<ImageInput
							onChange={setNewMapImageFile}
							initialImage={(currentWiki as Place).mapImage}
							id={'mapImageUpload'}
							revertId={'mapImageRevert'}
							buttonText={"Select Map Image"}
						/>
					</div>
					<div className="margin-lg" style={{display: 'flex'}}>
						<FormItem label={<>
							<ToolTip title={"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."}/>
							Pixels Per Foot
						</>}>
							<NumberInput
								value={pixelsPerFoot}
								onChange={async (value) => setPixelsPerFoot(value)}
							/>
						</FormItem>
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

			<div style={{display: 'flex'}} className="margin-lg">
				{saving && <div>Saving ... </div>}
				<div style={{flexGrow: '1', display: 'flex', justifyContent: 'space-between'}}>
					<PrimaryButton disabled={saving} onClick={save}>
						<SaveIcon />
						Save
					</PrimaryButton>
					<MoveWikiButton wikiPage={currentWiki} />

					<SecondaryDangerButton
						disabled={saving}
						onClick={() => {
							navigate(`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/view`);
						}}
					>
						<UndoIcon />
						Discard
					</SecondaryDangerButton>
				</div>

				<div style={{flexGrow: '4', display: 'flex', justifyContent: 'flex-end'}}>
					<PrimaryDangerButton
						disabled={saving}
						onClick={() => {
							modalConfirm({
								title: "Confirm Delete",
								content: `Are you sure you want to delete the wiki page ${currentWiki.name}?`,
								onOk: async () => {
									await deleteWiki({wikiId: currentWiki._id});
									navigate(
										`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`
									);
								},
							});
						}}
					>
						<DeleteIcon/>
						Delete Page
					</PrimaryDangerButton>
				</div>
			</div>
		</div>
	);
};
