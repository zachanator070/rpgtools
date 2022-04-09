import React, { useState } from "react";
import { Button, Col, Divider, Row } from "antd";
import { Link } from "react-router-dom";
import { WorldMenu } from "./WorldMenu";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useLogout from "../../hooks/authentication/useLogout";
import { SearchBarV2 } from "./SearchBar";
import { GlobalOutlined, UserOutlined, CloudServerOutlined } from "@ant-design/icons";
import useServerConfig from "../../hooks/server/useServerConfig";
import { ANON_USERNAME } from "../../../../common/src/permission-constants";
import { LoginModal } from "../modals/LoginModal";
import { RegisterModal } from "../modals/RegisterModal";

export const NavBar = () => {
	const { currentUser, loading: userLoading } = useCurrentUser();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const [loginModalVisibility, setLoginModalVisibility] = useState(false);
	const [registerModalVisibility, setRegisterModalVisibility] = useState(false);
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();

	const { logout } = useLogout();

	if (userLoading || worldLoading || serverConfigLoading) {
		return <></>;
	}

	let loginOptions = null;

	if (currentUser.username !== ANON_USERNAME) {
		loginOptions = (
			<span>
				<span className="margin-md-right">Hello {currentUser.username}</span>
				<span>
					<Button id="logoutButton" type="primary" onClick={async () => logout()}>
						Logout
					</Button>
				</span>
			</span>
		);
	} else {
		loginOptions = (
			<div>
				<div className="text-align-right margin-sm-top ">
					<a href="#" onClick={async () => setLoginModalVisibility(true)}>
						Login
					</a>
					<span className={"margin-md-left margin-md-right"}>or</span>
					<a href="#" onClick={async () => setRegisterModalVisibility(true)}>
						Register
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="shadow-sm padding-sm nav-bar">
			<LoginModal setVisibility={async (visibility: boolean) => setLoginModalVisibility(visibility)} visibility={loginModalVisibility} />
			<RegisterModal
				setVisibility={async (visibility: boolean) => setRegisterModalVisibility(visibility)}
				visibility={registerModalVisibility}
			/>
			<Row>
				<Col span={4}>
					<div className="margin-md-left">
						<WorldMenu />
						{currentWorld && currentWorld.canWrite && (
							<span className="margin-lg-left">
								<Link to={`/ui/world/${currentWorld._id}/settings`} title="World Settings">
									<GlobalOutlined />
								</Link>
							</span>
						)}
						{currentWorld && (
							<span className={"margin-lg-left"}>
								<Link
									to={`/ui/world/${currentWorld._id}/myPermissions`}
									title="My permissions on this world"
								>
									<UserOutlined />
								</Link>
							</span>
						)}
					</div>
				</Col>
				{currentWorld ? (
					<>
						<Col span={4}>
							<div className="margin-sm-top">
								<Divider type="vertical" />
								<Link to={`/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`}>
									Map
								</Link>
								<Divider type="vertical" />
								<Link to={`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`}>
									Wiki
								</Link>
								<Divider type="vertical" />
								<Link to={`/ui/world/${currentWorld._id}/model`}>Models</Link>
								<Divider type="vertical" />
								<Link to={`/ui/world/${currentWorld._id}/roles`}>Roles</Link>
								<Divider type="vertical" />
								<Link to={`/ui/world/${currentWorld._id}/gameLogin`}>Game</Link>
							</div>
						</Col>
						<Col span={10}>
							<SearchBarV2 />
						</Col>
					</>
				) : (
					<Col span={14}>
						<></>
					</Col>
				)}
				<Col span={6} className={"padding-md-right"} style={{ textAlign: "right" }}>
					{(serverConfig.canAdmin || serverConfig.canWrite) && (
						<Link to={`/ui/serverSettings`} className={"margin-lg-right"}>
							<CloudServerOutlined />
							Server Settings
						</Link>
					)}
					{loginOptions}
				</Col>
			</Row>
		</div>
	);
};
