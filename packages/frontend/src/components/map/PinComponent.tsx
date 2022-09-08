import React, {CSSProperties, useContext, useState} from "react";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import EditPinModal from "../modals/EditPinModal";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {Pin} from "../../types";
import MapWikiContext from "../../MapWikiContext";

import './PinComponent.css';
import PopoverBubble from "../widgets/PopoverBubble";
import {ARTICLE_PIN, ITEM_PIN, MONSTER_PIN, PERSON_PIN, PLACE_PIN} from "@rpgtools/common/src/pin-constants";
import FileIcon from "../widgets/icons/FileIcon";
import ItemIcon from "../widgets/icons/ItemIcon";
import MonsterIcon from "../widgets/icons/MonsterIcon";
import PlaceIcon from "../widgets/icons/PlaceIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import BuiltInPinIcon from "./BuiltInPinIcon";

interface PinComponentProps {
	pin: Pin;
	translate?: (x: number, y: number) => number[];
}

export default function PinComponent({ pin, translate }: PinComponentProps) {
	const history = useHistory();
	const { currentWorld } = useCurrentWorld();
	const [editPinModalVisibility, setEditPinModalVisibility] = useState(false);

	const { setMapWikiId, setShowMapDrawer } = useContext(MapWikiContext);
	const [visible, setVisible] = useState(false);

	const editButton = pin.canWrite ? (
		<a
			href="#"
			className="margin-md-left"
			onClick={async () => {
				setVisible(false);
				setEditPinModalVisibility(true);
			}}
		>
			Edit Pin
		</a>
	) : null;

	let pinPopupContent = (
		<div>
			<h2>Empty Pin</h2>
			{editButton}
		</div>
	);

	if (pin.page) {
		pinPopupContent = (
			<div>
				<h2>{pin.page.name}</h2>
				<h3>{pin.page.type}</h3>
				<a
					href="#"
					onClick={() => {
						setVisible(false);
						setMapWikiId( pin.page._id);
						setShowMapDrawer(true);
					}}
				>
					Details
				</a>
				{pin.page.type === PLACE ? (
					<a
						className="margin-md-left"
						href="#"
						onClick={() => {
							history.push(`/ui/world/${currentWorld._id}/map/${pin.page._id}`);
						}}
					>
						Open Map
					</a>
				) : null}
				{editButton}
			</div>
		);
	}

	const coordinates = translate(pin.x, pin.y);

	let pinIcon = null;
	if (pin.icon.image) {
		pinIcon = <img
			style={{width: pin.icon.size + 'em', height: pin.icon.size + 'em'}}
			alt={pin.icon.image.name}
			src={`/images/${pin.icon.image.icon.chunks[0].fileId}`}
		/>;
	} else {
		pinIcon = <BuiltInPinIcon type={pin.icon.builtInIcon} size={pin.icon.size} color={pin.icon.color}/>;
	}

	return (
		<div>
			<EditPinModal
				visibility={editPinModalVisibility}
				setVisibility={async (visible) => setEditPinModalVisibility(visible)}
				pin={pin}
			/>
			<PopoverBubble
				content={pinPopupContent}
				visible={visible}
				onVisibleChange={async (newVisible) => setVisible(newVisible)}
			>
				<div
					id={'mapPin'}
					className={'mapPin'}
					style={{
						left: coordinates[0] - 5,
						top: coordinates[1] - 5,
					}}
				>
					{pinIcon}
				</div>
			</PopoverBubble>
		</div>
	);
};
