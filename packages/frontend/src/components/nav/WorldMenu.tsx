import React, { useState } from "react";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import LoadingView from "../LoadingView";
import { DownOutlined } from "@ant-design/icons";
import CreateWorldModal from "../modals/CreateWorldModal";
import SelectWorldModal from "../modals/SelectWorldModal";
import SecondaryButton from "../widgets/SecondaryButton";
import DropdownMenu from "../widgets/DropdownMenu";
import DropdownMenuItem from "../widgets/DropdownMenuItem";
import useServerConfig from "../../hooks/server/useServerConfig";

export default function WorldMenu() {
	const [createWorldModalVisibility, setCreateWorldModalVisibility] = useState(false);
	const [selectWorldModalVisibility, setSelectWorldModalVisibility] = useState(false);

	const {serverConfig, loading: serverConfigLoading} = useServerConfig();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	if (worldLoading || serverConfigLoading) {
		return <LoadingView />;
	}

	let menu = [
			<DropdownMenuItem onClick={async () => setSelectWorldModalVisibility(true)}>
				<SelectWorldModal
					visibility={selectWorldModalVisibility}
					setVisibility={async (visibility: boolean) => setSelectWorldModalVisibility(visibility)}
				/>
				<a href="#">
					Select World
				</a>
			</DropdownMenuItem>
	];

	if (serverConfig.canCreateWorlds) {
		menu = [
			<DropdownMenuItem onClick={async () => setCreateWorldModalVisibility(true)}>
				<a href="#">
					New World
				</a>
			</DropdownMenuItem>,
			...menu
		];
	}

	return (
		<span id={'worldMenu'}>
			<CreateWorldModal
				visibility={createWorldModalVisibility}
				setVisibility={async (visibility: boolean) => setCreateWorldModalVisibility(visibility)}
			/>
			<DropdownMenu menu={menu}>
				<SecondaryButton>
					{currentWorld ? currentWorld.name : "No World Selected"} <DownOutlined />
				</SecondaryButton>
			</DropdownMenu>
		</span>
	);
};
