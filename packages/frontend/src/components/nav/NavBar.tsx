import React from "react";
import { Link } from "react-router-dom";
import WorldMenu from "./WorldMenu";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import SearchBar from "./SearchBar";
import useServerConfig from "../../hooks/server/useServerConfig";
import WorldIcon from "../widgets/icons/WorldIcon";
import ServerIcon from "../widgets/icons/ServerIcon";
import LoginOptions from "./LoginOptions";
import WorldLinks from "./WorldLinks";

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
