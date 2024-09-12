import React, { useState } from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import LoadingView from "../LoadingView.tsx";
import CreateWorldModal from "../modals/CreateWorldModal.tsx";
import SelectWorldModal from "../modals/SelectWorldModal.tsx";
import SecondaryButton from "../widgets/SecondaryButton.tsx";
import DropdownMenu from "../widgets/DropdownMenu.tsx";
import useServerConfig from "../../hooks/server/useServerConfig.js";
import DownArrowIcon from "../widgets/icons/DownArrowIcon.tsx";

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
