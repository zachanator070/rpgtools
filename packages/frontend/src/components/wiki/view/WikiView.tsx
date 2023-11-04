import React, {ReactElement, useRef, useState} from "react";
import Editor from "../Editor";
import useCurrentWorld from "../../../hooks/world/useCurrentWorld";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingView from "../../LoadingView";
import {EVENT_WIKI, MODELED_WIKI_TYPES, PLACE} from "@rpgtools/common/src/type-constants";
import ModelViewer from "../../models/ModelViewer";
import {EventWiki, ModeledWiki, Place, WikiPage} from "../../../types";
import usePins from "../../../hooks/map/usePins";
import ToolTip from "../../widgets/ToolTip";
import GotoIcon from "../../widgets/icons/GotoIcon";
import WikiViewButtonBar from "./WikiViewButtonBar";

interface WikiContentProps {
	currentWiki: WikiPage;
	wikiLoading?: boolean;
}

function getDayOfTheWeek(event: EventWiki): string {
	const age = event.calendar.ages[event.age - 1];
	const dayOfTheYear = age.months.slice(event.month).reduce((sum, month) => sum + month.numDays, 0) + event.day - 1;
	const dayOfTheWeekIndex = dayOfTheYear % age.daysOfTheWeek.length;
	return age.daysOfTheWeek[dayOfTheWeekIndex].name;
}

export function getDate(event: EventWiki): string {
	const age = event.calendar.ages[event.age - 1];
	const month = age.months[event.month - 1];
	return `${getDayOfTheWeek(event)}, ${month.name} ${event.day}, Year ${event.year} of ${age.name}`;
}

export function getTime(event: EventWiki): string {
	return `${event.hour}:${event.minute}:${event.second}`;
}

export default function WikiView({ currentWiki, wikiLoading }: WikiContentProps) {
	const navigate = useNavigate();

	const { currentWorld, loading } = useCurrentWorld();
	const {pins, loading: pinsLoading} = usePins({});

	const wikiView = useRef(null);

	const { wiki_id } = useParams();

	const [modelViewerContainer, setModelViewerContainer] = useState<HTMLElement>();

	const getPinFromPageId = (pageId) => {
		for (let pin of pins.docs) {
			if (pin.page && pin.page._id === pageId) {
				return pin;
			}
		}
	};

	if (loading || wikiLoading || pinsLoading) {
		return <LoadingView />;
	}

	if (!currentWiki) {
		return <div>{`404 - Wiki ${wiki_id} not found`}</div>;
	}

	let gotoMap = null;
	let pin = getPinFromPageId(currentWiki._id);
	if (pin) {
		gotoMap = (
			<a
				href="#"
				onClick={() => {
					navigate(`/ui/world/${currentWorld._id}/map/${pin.map._id}`);
				}}
			>
				See on map <GotoIcon />
			</a>
		);
	}

	let typeSpecificContent: ReactElement = null;
	if(currentWiki.type === PLACE) {
		const currentPlace = currentWiki as Place;
		if(currentPlace.mapImage) {

			typeSpecificContent = (
				<>
					<div className="padding-md">
						<img
							alt={currentPlace.mapImage.name}
							style={{maxWidth: '100%'}}
							src={`/images/${currentPlace.mapImage.icon.chunks[0].fileId}`}
							id={'mapImage'}
						/>
						<span className="margin-md-left">
							<a
								href="#"
								onClick={() => {
									navigate(`/ui/world/${currentWorld._id}/map/${currentPlace._id}`);
								}}
							>
								Go to Map <GotoIcon/>
							</a>
						</span>
					</div>
					<>
						<ToolTip
							title={
								"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."
							}
						/>
						<span>Pixels per foot: {currentPlace.pixelsPerFoot}</span>
					</>
				</>
			);
		}
	} else if (MODELED_WIKI_TYPES.includes(currentWiki.type)) {
		const currentModeledWiki = currentWiki as ModeledWiki;
		if(currentModeledWiki.model) {
			typeSpecificContent = (
				<div className={"margin-lg"} ref={setModelViewerContainer}>
					<ModelViewer
						model={currentModeledWiki.model}
						showColorControls={false}
						defaultColor={currentModeledWiki.modelColor}
						container={modelViewerContainer}
					/>
				</div>
			);
		}
	} else if(currentWiki.type === EVENT_WIKI) {
		let eventWiki = currentWiki as EventWiki
		typeSpecificContent = (<div>
			{eventWiki.calendar && <>
				<div className={'margin-md'}>
					Calendar: {eventWiki.calendar.name}
				</div>
				<div className={'margin-md'}>
					Date: {getDate(eventWiki)}
				</div>
				<div className={'margin-md'}>
					Time: {getTime(eventWiki)}
				</div>
			</>}
		</div>);
	}

	return (
		<div ref={wikiView} className="margin-md-top">
			<WikiViewButtonBar currentWiki={currentWiki} currentWikiLoading={wikiLoading}/>
			<h1>{currentWiki.name}</h1>
			{gotoMap}
			<h2>{currentWiki.type}</h2>
			{currentWiki.coverImage && (
				<img
					className="padding-md"
					alt={currentWiki.coverImage.name}
					style={{ objectFit: "contain", maxWidth: '100%'}}
					src={`/images/${currentWiki.coverImage.chunks[0].fileId}`}
					id={'coverImage'}
				/>
			)}

			{typeSpecificContent}

			<div className="padding-md">
				<Editor content={currentWiki.content} readOnly={true} />
			</div>
		</div>
	);
};
