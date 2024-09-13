import React, { useState } from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.js";
import CreateWorldModal from "../modals/CreateWorldModal.js";
import SelectWorldModal from "../modals/SelectWorldModal.js";
import SecondaryButton from "../widgets/SecondaryButton.js";
import DropdownMenu from "../widgets/DropdownMenu.js";
import useServerConfig from "../../hooks/server/useServerConfig.js";
import DownArrowIcon from "../widgets/icons/DownArrowIcon.js";

export default function WorldMenu() {
	const [createWorldModalVisibility, setCreateWorldModalVisibility] = useState(false);
	const [selectWorldModalVisibility, setSelectWorldModalVisibility] = useState(false);

	const {serverConfig, loading: serverConfigLoading} = useServerConfig();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	if (worldLoading || serverConfigLoading) {
		return <LoadingView />;
	}

	let menu = [
		<div key={'selectWorld'} onClick={() => setSelectWorldModalVisibility(true)}>
			<a href="#">
				Select World
			</a>
		</div>
	];

	if (serverConfig.canCreateWorlds) {
		menu = [
			<div key={'createWorld'} onClick={() => setCreateWorldModalVisibility(true)}>
				<a href="#">
					New World
				</a>
			</div>,
			...menu
		];
	}

	return (
		<span id={'worldMenu'}>
			<SelectWorldModal
				visibility={selectWorldModalVisibility}
				setVisibility={setSelectWorldModalVisibility}
			/>
			<CreateWorldModal
				visibility={createWorldModalVisibility}
				setVisibility={setCreateWorldModalVisibility}
			/>
			<DropdownMenu menu={menu}>
				<SecondaryButton onClick={(e) => e.preventDefault()}>
					{currentWorld ? currentWorld.name : "No World Selected"} <DownArrowIcon />
				</SecondaryButton>
			</DropdownMenu>
		</span>
	);
};
