import React from 'react';
import {Button, Dropdown, Icon, Menu} from "antd";
import useSetCreateWorldModalVisibility from "../../hooks/useSetCreateWorldModalVisibility";
import useSetSelectWorldModalVisibility from "../../hooks/useSetSelectWorldModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function WorldMenu(props) {

	const [setCreateWorldModalVisibility] = useSetCreateWorldModalVisibility();
	const [setSelectWorldModalVisibility] = useSetSelectWorldModalVisibility();

	const {data: currentUserData} = useCurrentUser();
	let currentUser = currentUserData.currentUser;

	const {data: currentWorldData} = useCurrentWorld();
	let currentWorld = currentWorldData.currentWorld;

	const menu = (
		<Menu>
			{(currentUser !== null ?
				<Menu.Item key="0">
					<a href="#"
					   onClick={async () => await setCreateWorldModalVisibility({variables: {visibility: true}})}>New
						World</a>
				</Menu.Item>
				: null)}
			<Menu.Item key="1">
				<a href="#" onClick={async () => await setSelectWorldModalVisibility({variables: {visibility: true}})}>Select
					World</a>
			</Menu.Item>
		</Menu>
	);

	return (
		<div>
			<Dropdown overlay={menu} trigger={['click']}>
				<Button>
					{currentUser && currentWorld ? currentWorld.name : 'No World Selected'} <Icon type="down"/>
				</Button>
			</Dropdown>
			{currentWorld && currentWorld.canWrite &&
			<span className='margin-md-left'>
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key="2">
									<a href="#" onClick={setShowWorldPermissionsModal}>World Permissions</a>
								</Menu.Item>
							</Menu>
						}
						trigger={['click']}
					>
						<Icon type="setting" className='pointer'/>
					</Dropdown>
				</span>
			}
		</div>
	);
};