import React, { useState } from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import LoadingView from "../LoadingView";
import CreateWorldModal from "../modals/CreateWorldModal";
import SelectWorldModal from "../modals/SelectWorldModal";
import SecondaryButton from "../widgets/SecondaryButton";
import DropdownMenu from "../widgets/DropdownMenu";
import useServerConfig from "../../hooks/server/useServerConfig";
import DownArrowIcon from "../widgets/icons/DownArrowIcon";

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
