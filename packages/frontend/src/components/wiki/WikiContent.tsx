import React, {ReactElement, useRef} from "react";
import { Editor } from "./Editor";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Link, useHistory, useParams } from "react-router-dom";
import { LoadingView } from "../LoadingView";
import { MODELED_WIKI_TYPES, PLACE } from "../../../../common/src/type-constants";
import { Button, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { ModelViewer } from "../models/ModelViewer";
import {Model, ModeledWiki, Place, WikiPage} from "../../types";

interface WikiContentProps {
	currentWiki: WikiPage;
	wikiLoading?: boolean;
}

export const WikiContent = ({ currentWiki, wikiLoading }: WikiContentProps) => {
	const history = useHistory();

	const { currentWorld, loading } = useCurrentWorld();

	const wikiView = useRef(null);

	const { wiki_id } = useParams();

	const getPinFromPageId = (pageId) => {
		for (let pin of currentWorld.pins) {
			if (pin.page && pin.page._id === pageId) {
				return pin;
			}
		}
	};

	if (loading || wikiLoading) {
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
				See on map <ExportOutlined />
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
						/>
						<span className="margin-md-left">
							<a
								href="#"
								onClick={() => {
									history.push(`/ui/world/${currentWorld._id}/map/${currentPlace._id}`);
								}}
							>
								Go to Map <ExportOutlined/>
							</a>
						</span>
					</div>
					<>
						Pixels per foot: {currentPlace.pixelsPerFoot}
						<Tooltip
							title={
								"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."
							}
						>
							<QuestionCircleOutlined className={"margin-lg-left"}/>
						</Tooltip>
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
							<Button type={"primary"}>
								<EditOutlined />
								Edit
							</Button>
						</Link>
					</span>
				)}

				<span className={"margin-lg"}>
					<Button
						type="primary"
						onClick={() => {
							window.location.href = `/export/${currentWiki.type}/${currentWiki._id}`;
						}}
					>
						Export
					</Button>
				</span>
			</span>
		</div>
	);
};
