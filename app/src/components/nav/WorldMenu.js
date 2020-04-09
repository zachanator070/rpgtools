import React from 'react';
import {Button, Dropdown, Menu} from "antd";
import useSetCreateWorldModalVisibility from "../../hooks/useSetCreateWorldModalVisibility";
import useSetSelectWorldModalVisibility from "../../hooks/useSetSelectWorldModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentUser from "../../hooks/useCurrentUser";
import {LoadingView} from "../LoadingView";
import {DownOutlined} from "@ant-design/icons";
import {ANON_USERNAME} from "../../../../common/src/permission-constants";

export const WorldMenu = () => {

	const {setCreateWorldModalVisibility} = useSetCreateWorldModalVisibility();
	const {setSelectWorldModalVisibility} = useSetSelectWorldModalVisibility();

	const {currentUser, loading} = useCurrentUser();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	if(loading || worldLoading){
		return (<LoadingView/>);
	}

	const menu = (
		<Menu>
			{currentUser.username !== ANON_USERNAME &&
				<Menu.Item key="0">
					<a
						href="#"
					   onClick={async () => await setCreateWorldModalVisibility(true)}
					>
						New	World
					</a>
				</Menu.Item>
			}
			<Menu.Item key="1">
				<a href="#" onClick={async () => await setSelectWorldModalVisibility(true)}>
					Select World
				</a>
			</Menu.Item>
		</Menu>
	);

	return (
		<span>
			<Dropdown overlay={menu} trigger={['click']}>
				<Button>
					{currentWorld ? currentWorld.name : 'No World Selected'} <DownOutlined/>
				</Button>
			</Dropdown>
		</span>
	);
};