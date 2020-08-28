import React, {useState} from 'react';
import {Button, Col, Divider, Row} from 'antd';
import {Link} from "react-router-dom";
import {WorldMenu} from "./WorldMenu";
import useCurrentUser from "../../hooks/useCurrentUser";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useLogout from "../../hooks/useLogout";
import {LoadingView} from "../LoadingView";
import {SearchBar} from "./SearchBar";
import {SettingOutlined,UserOutlined, CloudServerOutlined} from "@ant-design/icons";
import useServerConfig from "../../hooks/useServerConfig";
import {ANON_USERNAME} from "../../../../common/src/permission-constants";
import {LoginModal} from "../modals/LoginModal";
import {RegisterModal} from "../modals/RegisterModal";

export const NavBar = () => {

	const {currentUser, loading: userLoading} = useCurrentUser();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();
	const [loginModalVisibility, setLoginModalVisibility] = useState(false);
	const [registerModalVisibility, setRegisterModalVisibility] = useState(false);
	const {serverConfig, loading: serverConfigLoading} = useServerConfig();

	const {logout} = useLogout();

	if (userLoading || worldLoading || serverConfigLoading) {
		return <LoadingView/>;
	}

	let loginOptions = null;

	if (currentUser.username !== ANON_USERNAME) {
		loginOptions = (
			<span>
                <span className='margin-md-right'>Hello {currentUser.username}</span>
                <span>
                    <Button type='primary' onClick={logout}>Logout</Button>
                </span>
            </span>
		);
	} else {
		loginOptions = (
			<div>
				<div className='text-align-right margin-sm-top '>
					<a
						href='#'
					   onClick={async () => await setLoginModalVisibility(true)}
					>
						Login
					</a>
					<span className={'margin-md-left margin-md-right'}>
						or
					</span>
					<a
						href='#'
						onClick={async () => await setRegisterModalVisibility(true)}
					>
						Register
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className='shadow-sm padding-sm nav-bar'>
			<LoginModal setVisibility={setLoginModalVisibility} visibility={loginModalVisibility}/>
			<RegisterModal setVisibility={setRegisterModalVisibility} visibility={registerModalVisibility}/>
			<Row>
				<Col span={4}>
					<div className='margin-md-left'>
						<WorldMenu/>
						{currentWorld && currentWorld.canWrite &&
							<span className='margin-lg-left'>
								<Link
									to={`/ui/world/${currentWorld._id}/settings`}
									title={'World Settings'}
								>
									<SettingOutlined/>
								</Link>
							</span>
						}
						{currentWorld &&
							<span className={'margin-lg-left'}>
								<Link
									to={`/ui/world/${currentWorld._id}/myPermissions`}
									title={'My permissions on this world'}
								>
									<UserOutlined/>
								</Link>
							</span>
						}
					</div>
				</Col>
				{currentWorld ?
					<>
						<Col span={4}>
							<div className='margin-sm-top'>
								<Divider type='vertical'/>
								<Link
									to={`/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`}
								>
									Map
								</Link>
								<Divider type='vertical'/>
								<Link
									to={`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`}
								>
									Wiki
								</Link>
								<Divider type='vertical'/>
								<Link
									to={`/ui/world/${currentWorld._id}/roles`}
								>
									Roles
								</Link>
								<Divider type='vertical'/>
								<Link
									to={`/ui/world/${currentWorld._id}/gameLogin`}
								>
									Game
								</Link>
							</div>
						</Col>
						<Col span={10}>
							<SearchBar/>
						</Col>
					</>
					:
					<Col span={14}>
						<></>
					</Col>
				}
				<Col span={6} className={'padding-md-right'} style={{textAlign: 'right'}}>
					{currentUser && serverConfig.adminUsers.findIndex(user => user._id === currentUser._id) >= 0 &&
						<Link to={`/ui/serverSettings`} className={'margin-lg-right'}>
							<CloudServerOutlined/>
							Server Settings
						</Link>
					}
					{loginOptions}
				</Col>
			</Row>
		</div>
	);
};