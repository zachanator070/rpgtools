import React, {useEffect, useReducer, useState} from "react";
import useCurrentWiki from "../../../hooks/wiki/useCurrentWiki.js";
import { useParams } from "react-router-dom";
import {ALL_WIKI_TYPES, EVENT_WIKI, MODELED_WIKI_TYPES, PLACE} from "@rpgtools/common/src/type-constants";
import ToolTip from "../../widgets/ToolTip.js";
import SelectModel from "../../select/SelectModel.js";
import ModelViewer from "../../models/ModelViewer.js";
import LoadingView from "../../LoadingView.js";
import MoveWikiButton from "./MoveWikiButton.js";
import {EventWiki, Model, ModeledWiki, Place} from "../../../types.js";
import Errors from "../../Errors.js";
import TextInput from "../../widgets/input/TextInput.js";
import DropdownSelect from "../../widgets/DropdownSelect.js";
import ImageInput from "../../widgets/input/ImageInput.js";
import Editor from "../Editor.js";
import NumberInput from "../../widgets/input/NumberInput.js";
import FormItem from "../../widgets/input/FormItem.js";
import SelectCalendar from "../../select/SelectCalendar.js";
import SelectAge from "../../select/SelectAge.js";
import SelectMonth from "../../select/SelectMonth.js";
import SaveWikiButton, {UpdateWikiParams} from "./SaveWikiButton.js";
import DiscardWikiChangesButton from "./DiscardWikiChangesButton.js";
import DeleteWikiButton from "./DeleteWikiButton.js";

export default function WikiEdit() {

	const { wiki_id } = useParams();

	const { currentWiki, loading } = useCurrentWiki();

	const updateWikiParamsReducer = (oldState, action: {values: UpdateWikiParams}) => {
		return {
			...oldState,
			...action.values
		};
	};

	const [updateWikiParams, setUpdateWikiParams] = useReducer(updateWikiParamsReducer, {
		name: null,
		type: null,
		newCoverImageFile: undefined,
		newMapImageFile: undefined,
		pixelsPerFoot: 0,
		modelColor: null,
		selectedModel: null,
		selectedCalendar: null,
		selectedAge: 1,
		selectedYear: 1,
		selectedMonth: 1,
		selectedDay: 1,
		selectedHour: 0,
		selectedMinute: 0,
		selectedSecond: 0,
	});

	const [saving, setSaving] = useState(false);
	const [editor, setEditor] = useState(null);
	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	useEffect(() => {
		if (!currentWiki) {
			return;
		}
		(async () => {
			setUpdateWikiParams({values: {name: currentWiki.name}});
			await setUpdateWikiParams({values: {type: currentWiki.type}});
			if(currentWiki.type === PLACE) {
				const currentMap = currentWiki as Place;
				await setUpdateWikiParams({values: {pixelsPerFoot: currentMap.pixelsPerFoot}});
			} else if (MODELED_WIKI_TYPES.includes(currentWiki.type)) {
				const modeledWiki = currentWiki as ModeledWiki;
				setUpdateWikiParams({values: {selectedModel: modeledWiki.model}});
				setUpdateWikiParams({values: {modelColor: modeledWiki.modelColor}});
			} else if (currentWiki.type === EVENT_WIKI) {
				const eventWiki = currentWiki as EventWiki;
				setUpdateWikiParams({values: {selectedCalendar: eventWiki.calendar}});
				setUpdateWikiParams({values: {selectedAge: eventWiki.age}});
				setUpdateWikiParams({values: {selectedYear: eventWiki.year}});
				setUpdateWikiParams({values: {selectedMonth: eventWiki.month}});
				setUpdateWikiParams({values: {selectedDay: eventWiki.day}});
				setUpdateWikiParams({values: {selectedHour: eventWiki.hour}});
				setUpdateWikiParams({values: {selectedMinute: eventWiki.minute}});
				setUpdateWikiParams({values: {selectedSecond: eventWiki.second}});
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
	for (const type of wikiTypes) {
		options.push({
			label: type,
			value: type
		});
	}

	let wikiSpecificFields = null;

	if(updateWikiParams.type === PLACE) {
		wikiSpecificFields = <>
			<div className="margin-lg">
				<ImageInput
					onChange={(file) => setUpdateWikiParams({values: {newMapImageFile: file}})}
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
						value={updateWikiParams.pixelsPerFoot}
						onChange={async (value) => setUpdateWikiParams({values: {pixelsPerFoot: value}})}
					/>
				</FormItem>
			</div>
		</>;
	} else if(MODELED_WIKI_TYPES.includes(updateWikiParams.type)) {
		const currentModeledWiki = currentWiki as ModeledWiki;
		wikiSpecificFields = (<div className={"margin-lg"} ref={setModelViewerContainer}>
			{updateWikiParams.type} model:
			<span className={"margin-md"}>
						<SelectModel
							onChange={async (newModel: Model) => setUpdateWikiParams({values: {selectedModel: newModel}})}
							defaultModel={currentModeledWiki.model}
						/>
					</span>
			{updateWikiParams.selectedModel && (
				<ModelViewer
					model={updateWikiParams.selectedModel}
					defaultColor={currentModeledWiki.modelColor}
					showColorControls={true}
					onChangeColor={async (color: string) => setUpdateWikiParams({values: {modelColor: color}})}
					container={modelViewerContainer}
				/>
			)}
		</div>);
	} else if(updateWikiParams.type === EVENT_WIKI) {
		const eventWiki = currentWiki as EventWiki;
		wikiSpecificFields = (
			<div className={"margin-lg"}>
				<div>
					Calendar:
					<span className={'margin-md-left'}>
						<SelectCalendar
							defaultCalendar={eventWiki.calendar?._id}
							onChange={async (calendar) =>
								setUpdateWikiParams({values: {selectedCalendar: calendar}})}
						/>
					</span>
				</div>
				{updateWikiParams.selectedCalendar && updateWikiParams.selectedCalendar.ages.length > 0 && <>
					<div className={'margin-md'}>
						Age:
						<span className={'margin-md-left'}>
							<SelectAge
								onChange={(age) => setUpdateWikiParams({values: {selectedAge: age}})}
								calendar={updateWikiParams.selectedCalendar}
								defaultAge={eventWiki.age}
							/>
						</span>
					</div>
					<div className={'margin-md'}>
						Year:
						<span className={'margin-md-left'}>
							<NumberInput
								value={updateWikiParams.selectedYear}
								defaultValue={eventWiki.year}
								onChange={(year) => setUpdateWikiParams({values: {selectedYear: year}})}
								minValue={1}
								maxValue={updateWikiParams.selectedCalendar.ages[updateWikiParams.selectedAge - 1].numYears}
							/>
						</span>
					</div>
					<div className={'margin-md'}>
						Month:
						<span className={'margin-md-left'}>
							<SelectMonth
								onChange={(month) => setUpdateWikiParams({values: {selectedMonth: month}})}
								age={updateWikiParams.selectedCalendar.ages[updateWikiParams.selectedAge - 1]}
								defaultMonth={eventWiki.month}
							/>
						</span>
					</div>
					{updateWikiParams.selectedCalendar.ages[updateWikiParams.selectedAge - 1].months.length > 0 && <>
						<div className={'margin-md'}>
							Day:
							<span className={'margin-md-left'}>
							<NumberInput
								value={updateWikiParams.selectedDay}
								onChange={updateWikiParams.setSelectedDay}
								defaultValue={eventWiki.day}
								minValue={1}
								maxValue={updateWikiParams.selectedCalendar.ages[updateWikiParams.selectedAge - 1].months[updateWikiParams.selectedMonth - 1].numDays}
							/>
						</span>
						</div>
					</>}
					<div className={'margin-md'}>
						Time:
						<span className={'margin-md-left'}>
							<NumberInput
								value={updateWikiParams.selectedHour}
								onChange={(hour) => setUpdateWikiParams({values: {selectedHour: hour}})}
								maxValue={23}
								defaultValue={eventWiki.hour}
							/>
							:
							<NumberInput
								value={updateWikiParams.selectedMinute}
								onChange={(minute) => setUpdateWikiParams({values: {selectedMinute: minute}})}
								maxValue={59}
								defaultValue={eventWiki.minute}
							/>
							:
							<NumberInput
								value={updateWikiParams.selectedSecond}
								onChange={(second) => setUpdateWikiParams({values: {selectedSecond: second}})}
								maxValue={59}
								defaultValue={eventWiki.second}
							/>
						</span>
					</div>
				</>}
			</div>
		);
	}

	return (
		<div>

			<div style={{display: 'flex'}} className="margin-lg">
				{saving ?
					<div>Saving ... </div>
					:
					<>
						<div style={{flexGrow: '1', display: 'flex', justifyContent: 'flex-end'}}>
							<DeleteWikiButton currentWiki={currentWiki}/>
							<MoveWikiButton wikiPage={currentWiki}/>
							<DiscardWikiChangesButton/>
							<SaveWikiButton
								currentWiki={currentWiki}
								updateWikiParams={updateWikiParams}
								editor={editor}
								disabled={saving}
								setSaving={setSaving}
							/>
						</div>
					</>
				}
			</div>

			<div className="margin-lg">
				Article Name:{" "}
				<TextInput
					style={{ width: 120 }}
					value={updateWikiParams.name}
					onChange={async (event) => setUpdateWikiParams({values: {name: event.target.value}})}
				/>
			</div>
			<div className="margin-lg">
				Type:{" "}
				<DropdownSelect defaultValue={currentWiki.type} style={{ width: 120 }} onChange={(type) => setUpdateWikiParams({values: {type}})} options={options}/>
			</div>
			<div className="margin-lg">
				<ImageInput
					onChange={(file) => setUpdateWikiParams({values: {newCoverImageFile: file}})}
					initialImage={currentWiki.coverImage}
					id={'coverImageUpload'}
					revertId={'coverImageRevert'}
					buttonText={"Select Cover Image"}
				/>
			</div>
			{wikiSpecificFields}
			<div className="margin-lg">
				<Editor
					content={currentWiki.content}
					onInit={async (editor) => {
						await setEditor(editor);
					}}
				/>
			</div>
		</div>
	);
};
