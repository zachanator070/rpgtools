import React, { useRef } from "react";
import { Editor } from "./Editor";
import { ExportOutlined, EditOutlined } from "@ant-design/icons";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Link, useHistory, useParams } from "react-router-dom";
import { LoadingView } from "../LoadingView";
import { MODELED_WIKI_TYPES, PLACE } from "../../../../common/src/type-constants";
import { Button, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { ModelViewer } from "../models/ModelViewer";
import {WikiPage} from "../../types";

interface WikiContentProps {
	currentWiki: WikiPage;
	wikiLoading: boolean;
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
			{currentWiki.type === PLACE && currentWiki.mapImage && (
				<div className="padding-md" style={{ maxHeight: "100em", maxWidth: "100em" }}>
					<img
						alt={currentWiki.mapImage.name}
						style={{ objectFit: "contain" }}
						src={`/images/${currentWiki.mapImage.icon.chunks[0].fileId}`}
					/>
					<span className="margin-md-left">
						<a
							href="#"
							onClick={() => {
								history.push(`/ui/world/${currentWorld._id}/map/${currentWiki._id}`);
							}}
						>
							Go to Map <ExportOutlined />
						</a>
					</span>
				</div>
			)}
			{currentWiki.type === PLACE && currentWiki.mapImage && (
				<>
					Pixels per foot: {currentWiki.pixelsPerFoot}
					<Tooltip
						title={
							"Number of pixels on this map that represent the length of 1 foot. Required if you wish to use this place in a game."
						}
					>
						<QuestionCircleOutlined className={"margin-lg-left"} />
					</Tooltip>
				</>
			)}

			{MODELED_WIKI_TYPES.includes(currentWiki.type) && currentWiki.model && (
				<div className={"margin-lg"}>
					<ModelViewer
						model={currentWiki.model}
						showColorControls={false}
						defaultColor={currentWiki.modelColor}
					/>
				</div>
			)}

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
							window.location = `/export/${currentWiki.type}/${currentWiki._id}`;
						}}
					>
						Export
					</Button>
				</span>
			</span>
		</div>
	);
};
