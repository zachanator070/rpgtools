import React, {ReactElement, useRef} from "react";
import Editor from "./Editor";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Link, useHistory, useParams } from "react-router-dom";
import LoadingView from "../LoadingView";
import { MODELED_WIKI_TYPES, PLACE } from "@rpgtools/common/src/type-constants";
import ModelViewer from "../models/ModelViewer";
import {ModeledWiki, Place, WikiPage} from "../../types";
import usePins from "../../hooks/map/usePins";
import PrimaryButton from "../widgets/PrimaryButton";
import ToolTip from "../widgets/ToolTip";
import EditIcon from "../widgets/icons/EditIcon";
import GotoIcon from "../widgets/icons/GotoIcon";

interface WikiContentProps {
	currentWiki: WikiPage;
	wikiLoading?: boolean;
}

export default function WikiContent({ currentWiki, wikiLoading }: WikiContentProps) {
	const history = useHistory();

	const { currentWorld, loading } = useCurrentWorld();
	const {pins, loading: pinsLoading} = usePins({});

	const wikiView = useRef(null);

	const { wiki_id } = useParams();

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
					history.push(`/ui/world/${currentWorld._id}/map/${pin.map._id}`);
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
					<div className="padding-md" style={{maxHeight: "100em", maxWidth: "100em"}}>
						<img
							alt={currentPlace.mapImage.name}
							style={{objectFit: "contain"}}
							src={`/images/${currentPlace.mapImage.icon.chunks[0].fileId}`}
							id={'mapImage'}
						/>
						<span className="margin-md-left">
							<a
								href="#"
								onClick={() => {
									history.push(`/ui/world/${currentWorld._id}/map/${currentPlace._id}`);
								}}
							>
								Go to Map <GotoIcon/>
							</a>
						</span>
					</div>
					<>
						Pixels per foot: {currentPlace.pixelsPerFoot}
						<ToolTip
							title={
								"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."
							}
						/>
					</>
				</>
			);
		}
	} else if (MODELED_WIKI_TYPES.includes(currentWiki.type)) {
		const currentModeledWiki = currentWiki as ModeledWiki;
		if(currentModeledWiki.model) {

			typeSpecificContent = (
				<div className={"margin-lg"}>
					<ModelViewer
					model={currentModeledWiki.model}
					showColorControls={false}
					defaultColor={currentModeledWiki.modelColor}
					/>
				</div>
			);
		}
	}

	return (
		<div ref={wikiView} className="margin-md-top">
			<h1>{currentWiki.name}</h1>
			{gotoMap}
			<h2>{currentWiki.type}</h2>
			{currentWiki.coverImage && (
				<div className="padding-md" style={{ maxHeight: "500em", maxWidth: "500em" }}>
					<img
						alt={currentWiki.coverImage.name}
						style={{ objectFit: "contain" }}
						src={`/images/${currentWiki.coverImage.chunks[0].fileId}`}
						id={'coverImage'}
					/>
				</div>
			)}

			{typeSpecificContent}

			<div className="padding-md">
				<Editor content={currentWiki.content} readOnly={true} />
			</div>

			<span>
				{currentWiki.canWrite && (
					<span className="margin-lg">
						<Link to={`/ui/world/${currentWorld._id}/wiki/${currentWiki._id}/edit`}>
							<PrimaryButton>
								<EditIcon />
								Edit
							</PrimaryButton>
						</Link>
					</span>
				)}

				<span className={"margin-lg"}>
					<PrimaryButton
						onClick={() => {
							window.location.href = `/export/${currentWiki.type}/${currentWiki._id}`;
						}}
					>
						Export
					</PrimaryButton>
				</span>
			</span>
		</div>
	);
};
