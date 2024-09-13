import React from "react";
import { Link } from "react-router-dom";
import WorldMenu from "./WorldMenu.js";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import SearchBar from "./SearchBar.js";
import useServerConfig from "../../hooks/server/useServerConfig.js";
import WorldIcon from "../widgets/icons/WorldIcon.js";
import ServerIcon from "../widgets/icons/ServerIcon.js";
import LoginOptions from "./LoginOptions.js";
import WorldLinks from "./WorldLinks.js";

export default function NavBar() {

	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();

	if (worldLoading || serverConfigLoading) {
		return <></>;
	}

	return (
		<div className="shadow-sm padding-sm nav-bar" style={{top: 0, position: 'sticky'}}>

			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

				<div className={'navbar-item'}>
					<WorldMenu />
					{currentWorld && currentWorld.canWrite && (
						<Link to={`/ui/world/${currentWorld._id}/settings`} title="World Settings" style={{marginLeft: '1em'}}>
							<WorldIcon />
						</Link>
					)}
				</div>

				<div className={'navbar-item'}>
					<WorldLinks/>
				</div>

				<div className={'navbar-item flex'} style={{flexGrow: '.5'}}>
					{currentWorld && <SearchBar style={{flexGrow: '1'}}/>}
				</div>

				<div className={'navbar-item'}>
					{(serverConfig.canAdmin || serverConfig.canWrite) && (
						<Link to={`/ui/serverSettings`}>
							<ServerIcon />
							Server Settings
						</Link>
					)}
				</div>

				<div className={'navbar-item'}>
					<LoginOptions/>
				</div>

			</div>
		</div>
	);
};
