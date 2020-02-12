import React from 'react';
import {Button, Dropdown, Icon, Menu} from "antd";
import useSetCreateWorldModalVisibility from "../../hooks/useSetCreateWorldModalVisibility";
import useSetSelectWorldModalVisibility from "../../hooks/useSetSelectWorldModalVisibility";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentUser from "../../hooks/useCurrentUser";
import {LoadingView} from "../LoadingView";

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
			{currentUser &&
				<Menu.Item key="0">
					<a href="#"
					   onClick={async () => await setCreateWorldModalVisibility(true)}>New
						World</a>
				</Menu.Item>
			}
			<Menu.Item key="1">
				<a href="#" onClick={async () => await setSelectWorldModalVisibility(true)}>Select
					World</a>
			</Menu.Item>
		</Menu>
	);

	return (
		<div>
			<Dropdown overlay={menu} trigger={['click']}>
				<Button>
					{currentWorld ? currentWorld.name : 'No World Selected'} <Icon type="down"/>
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