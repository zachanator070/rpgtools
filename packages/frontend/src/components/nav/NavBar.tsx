import React from "react";
import { Link } from "react-router-dom";
import { Grid } from "antd";
import WorldMenu from "./WorldMenu";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import SearchBar from "./SearchBar";
import useServerConfig from "../../hooks/server/useServerConfig";
import WorldIcon from "../widgets/icons/WorldIcon";
import ServerIcon from "../widgets/icons/ServerIcon";
import LoginOptions from "./LoginOptions";
import WorldLinks from "./WorldLinks";
import { ThemeToggle } from "../ThemeToggle";
import PopoverBubble from "../widgets/PopoverBubble";
import SecondaryButton from "../widgets/SecondaryButton";
import HamburgerMenuIcon from "../widgets/icons/HamburgerMenuIcon";
import './NavBar.css';

export default function NavBar() {

	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();
	const screens = Grid.useBreakpoint();
	const [leftMenuVisible, setLeftMenuVisible] = React.useState(false);
	const [rightMenuVisible, setRightMenuVisible] = React.useState(false);

	if (worldLoading || serverConfigLoading) {
		return <></>;
	}

	const isCollapsed = !screens.md;

	const leftCollapsedContent = (
		<div className={'nav-collapsed-panel'}>
			<div className={'nav-collapsed-item'}>
				<WorldMenu />
			</div>
			{currentWorld && currentWorld.canWrite && (
				<div className={'nav-collapsed-item'}>
					<Link to={`/ui/world/${currentWorld._id}/settings`} title="World Settings">
						<WorldIcon />
						<span className={'margin-sm-left'}>World Settings</span>
					</Link>
				</div>
			)}
			{currentWorld && (
				<div className={'nav-collapsed-item'}>
					<WorldLinks compact={true} />
				</div>
			)}
		</div>
	);

	const rightCollapsedContent = (
		<div className={'nav-collapsed-panel'}>
			<div className={'nav-collapsed-item'}>
				<Link to={'/ui/home'}>Home</Link>
			</div>
			<div className={'nav-collapsed-item'}>
				<Link to={'/ui/legal'}>Legal</Link>
			</div>
			{(serverConfig.canAdmin || serverConfig.canWrite) && (
				<div className={'nav-collapsed-item'}>
					<Link to={`/ui/serverSettings`}>
						<ServerIcon />
						<span className={'margin-sm-left'}>Server Settings</span>
					</Link>
				</div>
			)}
			<div className={'nav-collapsed-item'}>
				<LoginOptions/>
			</div>
			<div className={'nav-collapsed-item'}>
				<ThemeToggle />
			</div>
		</div>
	);

	return (
		<div className="shadow-sm padding-sm nav-bar" style={{top: 0, position: 'sticky'}}>

			<div className={'nav-layout'}>
				<div className={'nav-side'}>
					{isCollapsed ? (
						<PopoverBubble
							content={leftCollapsedContent}
							visible={leftMenuVisible}
							onVisibleChange={(visible: boolean) => setLeftMenuVisible(visible)}
						>
							<SecondaryButton id={'navLeftCollapseButton'} onClick={(e) => e.preventDefault()}>
								<HamburgerMenuIcon />
							</SecondaryButton>
						</PopoverBubble>
					) : (
						<>
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
						</>
					)}
				</div>

				<div className={'nav-search'}>
					{currentWorld && <SearchBar style={{width: '100%'}}/>}
				</div>

				<div className={'nav-side nav-side-right'}>
					{isCollapsed ? (
						<PopoverBubble
							content={rightCollapsedContent}
							visible={rightMenuVisible}
							onVisibleChange={(visible: boolean) => setRightMenuVisible(visible)}
						>
							<SecondaryButton id={'navRightCollapseButton'} onClick={(e) => e.preventDefault()}>
								<HamburgerMenuIcon />
							</SecondaryButton>
						</PopoverBubble>
					) : (
						<>
							<div className={'navbar-item'}>
								<Link to={'/ui/home'}>Home</Link>
							</div>

							<div className={'navbar-item'}>
								<Link to={'/ui/legal'}>Legal</Link>
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

							<div className={'navbar-item'}>
								<ThemeToggle />
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
