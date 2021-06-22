import React, { useState } from "react";
import { Button, Dropdown, Menu } from "antd";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import { LoadingView } from "../LoadingView";
import { DownOutlined } from "@ant-design/icons";
import { ANON_USERNAME } from "../../../../common/src/permission-constants";
import { CreateWorldModal } from "../modals/CreateWorldModal";
import { SelectWorldModal } from "../modals/SelectWorldModal";

export const WorldMenu = () => {
	const [createWorldModalVisibility, setCreateWorldModalVisibility] = useState(false);
	const [selectWorldModalVisibility, setSelectWorldModalVisibility] = useState(false);

	const { currentUser, loading } = useCurrentUser();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	if (loading || worldLoading) {
		return <LoadingView />;
	}

	const menu = (
		<Menu>
			{currentUser.username !== ANON_USERNAME && (
				<Menu.Item key="0">
					<a href="#" onClick={async () => await setCreateWorldModalVisibility(true)}>
						New World
					</a>
				</Menu.Item>
			)}
			<Menu.Item key="1">
				<SelectWorldModal
					visibility={selectWorldModalVisibility}
					setVisibility={setSelectWorldModalVisibility}
				/>
				<a href="#" onClick={async () => await setSelectWorldModalVisibility(true)}>
					Select World
				</a>
			</Menu.Item>
		</Menu>
	);

	return (
		<span>
			<CreateWorldModal
				visibility={createWorldModalVisibility}
				setVisibility={setCreateWorldModalVisibility}
			/>
			<Dropdown overlay={menu} trigger={["click"]}>
				<Button>
					{currentWorld ? currentWorld.name : "No World Selected"} <DownOutlined />
				</Button>
			</Dropdown>
		</span>
	);
};
