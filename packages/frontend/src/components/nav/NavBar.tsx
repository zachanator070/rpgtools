import React, { useState } from "react";
import { Link } from "react-router-dom";
import WorldMenu from "./WorldMenu";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useLogout from "../../hooks/authentication/useLogout";
import SearchBar from "./SearchBar";
import useServerConfig from "../../hooks/server/useServerConfig";
import { ANON_USERNAME } from "@rpgtools/common/src/permission-constants";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import VerticalBar from "../widgets/VerticalBar";
import PrimaryButton from "../widgets/PrimaryButton";
import ColumnedContent from "../widgets/ColumnedContent";
import WorldIcon from "../widgets/icons/WorldIcon";
import PersonIcon from "../widgets/icons/PersonIcon";
import ServerIcon from "../widgets/icons/ServerIcon";

export default function NavBar() {
	const { currentUser, loading: userLoading } = useCurrentUser();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const [loginModalVisibility, setLoginModalVisibility] = useState(false);
	const [registerModalVisibility, setRegisterModalVisibility] = useState(false);
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();

	const { logout } = useLogout();

	if (userLoading || worldLoading || serverConfigLoading) {
		return <></>;
	}

	let loginOptions;

	if (currentUser.username !== ANON_USERNAME) {
		loginOptions = (
			<span>
				<span className="margin-md-right">Hello {currentUser.username}</span>
				<span>
					<PrimaryButton id="logoutButton" onClick={async () => logout()}>
						Logout
					</PrimaryButton>
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
			<ColumnedContent>
				<>
					<div className="margin-md-left">
						<WorldMenu />
						{currentWorld && currentWorld.canWrite && (
							<span className="margin-lg-left">
								<Link to={`/ui/world/${currentWorld._id}/settings`} title="World Settings">
									<WorldIcon />
								</Link>
							</span>
						)}
						{currentWorld && (
							<span className={"margin-lg-left"}>
								<Link
									to={`/ui/world/${currentWorld._id}/myPermissions`}
									title="My permissions on this world"
								>
									<PersonIcon />
								</Link>
							</span>
						)}
					</div>

					{currentWorld &&
						<>
							<div className="margin-sm-top">
								<VerticalBar/>
								<Link to={`/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`}>
									Map
								</Link>
								<VerticalBar/>
								<Link to={`/ui/world/${currentWorld._id}/wiki/${currentWorld.wikiPage._id}/view`}>
									Wiki
								</Link>
								<VerticalBar/>
								<Link to={`/ui/world/${currentWorld._id}/model`}>Models</Link>
								<VerticalBar/>
								<Link to={`/ui/world/${currentWorld._id}/roles`}>Roles</Link>
								<VerticalBar/>
								<Link to={`/ui/world/${currentWorld._id}/gameLogin`}>Game</Link>
							</div>
						</>
					}
				</>
				<>
					{currentWorld && <SearchBar />}
				</>
				<div style={{ textAlign: "right" }}>
					{(serverConfig.canAdmin || serverConfig.canWrite) && (
						<Link to={`/ui/serverSettings`} className={"margin-lg-right"}>
							<ServerIcon />
							Server Settings
						</Link>
					)}
					{loginOptions}
				</div>
			</ColumnedContent>
		</div>
	);
};
