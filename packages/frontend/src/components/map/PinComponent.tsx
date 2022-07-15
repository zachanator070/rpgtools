import React, {useContext, useState} from "react";
import { Popover } from "antd";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import EditPinModal from "../modals/EditPinModal";
import { PLACE } from "@rpgtools/common/src/type-constants";
import {Pin} from "../../types";
import MapWikiContext from "../../MapWikiContext";

import './PinComponent.css';

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

	return (
		<>
			<EditPinModal
				visibility={editPinModalVisibility}
				setVisibility={async (visible) => setEditPinModalVisibility(visible)}
				pinId={pin._id}
			/>
			<Popover
				content={pinPopupContent}
				trigger="click"
				key={pin._id}
				overlayStyle={{ zIndex: 10 }}
				visible={visible}
				onVisibleChange={async (newVisible) => setVisible(newVisible)}
			>
				<div
					id={'mapPin'}
					className={'mapPin'}
					style={{
						left: coordinates[0] - 5,
						top: coordinates[1] - 5
					}}
				/>
			</Popover>
		</>
	);
};
