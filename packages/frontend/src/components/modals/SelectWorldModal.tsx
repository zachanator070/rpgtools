import React, { useState } from "react";
import { Button, Modal } from "antd";
import { useHistory } from "react-router-dom";
import useSetCurrentWorld from "../../hooks/world/useSetCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import SelectWorld from "../select/SelectWorld";
import {World} from "../../types";

interface SelectWorldModalProps {
	visibility: boolean;
	setVisibility: (visibility: boolean) => Promise<void>;
}

export default function SelectWorldModal({ visibility, setVisibility }: SelectWorldModalProps) {
	const [selectedWorld, setSelectedWorld] = useState<World>(null);

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
							await setCurrentWorld({worldId: selectedWorld._id});
						}
						history.push(
							`/ui/world/${selectedWorld._id}/map/${selectedWorld.wikiPage._id}`
						);
						await setVisibility(false);
					}}
					disabled={selectedWorld === null}
					id={'selectWorld'}
				>
					Select
				</Button>,
			]}
		>
			<SelectWorld onChange={async (world: World) => setSelectedWorld(world)} />
		</Modal>
	);
};
