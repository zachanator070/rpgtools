import "react";
import { EVENT_WIKI, MODELED_WIKI_TYPES, PLACE } from "@rpgtools/common/src/type-constants";
import { Calendar, Model, Place, WikiPage } from "../../../types";
import useCreateImage from "../../../hooks/wiki/useCreateImage";
import useUpdateWiki from "../../../hooks/wiki/useUpdateWiki";
import useUpdatePlace from "../../../hooks/wiki/useUpdatePlace";
import useUpdateModeledWiki from "../../../hooks/wiki/useUpdateModeledWiki";
import useUpdateEventWiki from "../../../hooks/wiki/useUpdateEventWiki";
import useCurrentWorld from "../../../hooks/world/useCurrentWorld";
import { useNavigate } from "react-router-dom";
import SaveIcon from "../../widgets/icons/SaveIcon";
import PrimaryButton from "../../widgets/PrimaryButton";
import React from "react";
import { UploadFile } from "antd";
import Quill from "quill";

export interface UpdateWikiParams {
	name?: string;
	type?: string;
	newCoverImageFile?: UploadFile;
	newMapImageFile?: UploadFile;
	pixelsPerFoot?: number;
	modelColor?: string;
	selectedModel?: Model;
	selectedCalendar?: Calendar;
	selectedAge?: number;
	selectedYear?: number;
	selectedMonth?: number;
	selectedDay?: number;
	selectedHour?: number;
	selectedMinute?: number;
	selectedSecond?: number;
}

export default function SaveWikiButton({
	currentWiki,
	updateWikiParams: {
		name,
		type,
		newCoverImageFile,
		newMapImageFile,
		pixelsPerFoot,
		modelColor,
		selectedModel,
		selectedCalendar,
		selectedAge,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		selectedMinute,
		selectedSecond,
	},
	editor,
	disabled,
	setSaving,
}: {
	currentWiki: WikiPage;
	updateWikiParams: UpdateWikiParams;
	editor: Quill;
	disabled: boolean;
	setSaving: (saving: boolean) => void;
}) {
	const { createImage } = useCreateImage();
	const { updateWiki } = useUpdateWiki();
	const { updatePlace } = useUpdatePlace();
	const { updateModeledWiki } = useUpdateModeledWiki();
	const { updateEventWiki } = useUpdateEventWiki();

	const { refetch: refetchWorld } = useCurrentWorld();

	const navigate = useNavigate();

	const save = async () => {
		await setSaving(true);

		let coverImageId = currentWiki.coverImage ? currentWiki.coverImage._id : undefined;
		if (newCoverImageFile) {
			const coverUploadResult = await createImage({
				file: newCoverImageFile,
				worldId: currentWiki.world._id,
				chunkify: false,
			});
			coverImageId = coverUploadResult._id;
		} else if (newCoverImageFile === null) {
			coverImageId = null;
		}

		const contents =
			editor != null
				? new File([JSON.stringify(editor.getContents())], "contents.json", {
						type: "text/plain",
				  })
				: null;
		await updateWiki({ wikiId: currentWiki._id, name, content: contents, coverImageId, type });

		if (type === PLACE) {
			const currentPlace = currentWiki as Place;
			let mapImageId = currentPlace.mapImage ? currentPlace.mapImage._id : undefined;
			if (newMapImageFile) {
				const mapUploadResult = await createImage({
					file: newMapImageFile,
					worldId: currentWiki.world._id,
					chunkify: true,
				});
				mapImageId = mapUploadResult._id;
			} else if (newMapImageFile === null) {
				mapImageId = null;
			}
			await updatePlace({ placeId: currentPlace._id, mapImageId, pixelsPerFoot });
		} else if (MODELED_WIKI_TYPES.includes(type)) {
			await updateModeledWiki({
				wikiId: currentWiki._id,
				model: selectedModel ? selectedModel._id : null,
				color: modelColor,
			});
		} else if (type === EVENT_WIKI) {
			await updateEventWiki({
				wikiId: currentWiki._id,
				calendarId: selectedCalendar?._id,
				age: selectedAge,
				year: selectedYear,
				month: selectedMonth,
				day: selectedDay,
				hour: selectedHour,
				minute: selectedMinute,
				second: selectedSecond,
			});
		}
		await refetchWorld();
		navigate(`/ui/world/${currentWiki.world._id}/wiki/${currentWiki._id}/view`);
	};

	return (
		<PrimaryButton className={"margin-md-right margin-md-left"} disabled={disabled} onClick={save}>
			<SaveIcon />
			Save
		</PrimaryButton>
	);
}
