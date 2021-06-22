import React, { useState } from "react";
import { Button, Modal, List, Row, Col, Divider } from "antd";
import { useHistory } from "react-router-dom";
import { useSetCurrentWorld } from "../../hooks/world/useSetCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import { SelectWorld } from "../select/SelectWorld";

export const SelectWorldModal = ({ visibility, setVisibility }) => {
	const [selectedWorld, setSelectedWorld] = useState(null);

	const { setCurrentWorld } = useSetCurrentWorld();
	const { currentUser } = useCurrentUser();

	const history = useHistory();

	return (
		<Modal
			title="Select a World"
			visible={visibility}
			onCancel={async () => {
				await setVisibility(false);
			}}
			footer={[
				<Button
					type={"primary"}
					key="select button"
					onClick={async () => {
						if (currentUser) {
							await setCurrentWorld(selectedWorld._id);
						}
						history.push(
							`/ui/world/${selectedWorld._id}/map/${selectedWorld.wikiPage._id}`
						);
						await setVisibility(false);
					}}
					disabled={selectedWorld === null}
				>
					Select
				</Button>,
			]}
		>
			<SelectWorld onChange={setSelectedWorld} />
		</Modal>
	);
};
