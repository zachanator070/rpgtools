import React, { useState } from "react";
import { Popover } from "antd";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useSetMapWiki from "../../hooks/map/useSetMapWiki";
import { EditPinModal } from "../modals/EditPinModal";
import { PLACE } from "@rpgtools/common/src/type-constants";

export const Pin = ({ pin, translate }) => {
	const history = useHistory();
	const { currentWorld } = useCurrentWorld();
	const [editPinModalVisibility, setEditPinModalVisibility] = useState(false);

	const { setMapWiki } = useSetMapWiki();
	const [visible, setVisible] = useState(false);

	const editButton = pin.canWrite ? (
		<a
			href="#"
			className="margin-md-left"
			onClick={async () => {
				await setVisible(false);
				await setEditPinModalVisibility(true);
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
					onClick={async () => {
						await setVisible(false);
						await setMapWiki(null);
						await setMapWiki(pin.page._id);
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
				setVisibility={setEditPinModalVisibility}
				pinId={pin._id}
			/>
			<Popover
				content={pinPopupContent}
				trigger="click"
				key={pin._id}
				overlayStyle={{ zIndex: "10" }}
				visible={visible}
				onVisibleChange={async (newVisible) => await setVisible(newVisible)}
			>
				<div
					style={{
						position: "absolute",
						left: coordinates[0] - 5,
						top: coordinates[1] - 5,
						zIndex: 1,
						borderRadius: "50%",
						width: "15px",
						height: "15px",
						backgroundColor: "crimson",
						border: "3px solid powderblue",
						cursor: "pointer",
					}}
				/>
			</Popover>
		</>
	);
};
