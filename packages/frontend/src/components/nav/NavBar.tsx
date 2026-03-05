import React from "react";
import { Link } from "react-router-dom";
import { Grid } from "antd";
import WorldMenu from "./WorldMenu";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import SearchBar from "./SearchBar";
import useServerConfig from "../../hooks/server/useServerConfig";
import WorldIcon from "../widgets/icons/WorldIcon";
import ServerIcon from "../widgets/icons/ServerIcon";
import getLoginOptions from "./getLoginOptions";
import WorldLinks from "./getWorldLinks";
import { ThemeToggle } from "../ThemeToggle";
import PopoverBubble from "../widgets/PopoverBubble";
import SecondaryButton from "../widgets/SecondaryButton";
import HamburgerMenuIcon from "../widgets/icons/HamburgerMenuIcon";
import './NavBar.css';
import getWorldLinks from "./getWorldLinks";

export interface NavComponent {
	key: string;
	component: React.ReactNode;
}

export default function NavBar() {

	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const { serverConfig, loading: serverConfigLoading } = useServerConfig();
	const screens = Grid.useBreakpoint();
	const [leftMenuVisible, setLeftMenuVisible] = React.useState(false);
	const [rightMenuVisible, setRightMenuVisible] = React.useState(false);
	const loginOptions = getLoginOptions();
	const worldLinks = getWorldLinks();

	if (worldLoading || serverConfigLoading) {
		return <></>;
	}

	const isCollapsed = !screens.lg;

	const leftComponents: NavComponent[] = [
		{
			key: 'worldMenu',
			component: <WorldMenu />
		},
		{
			key: 'worldSettings',
			component: currentWorld && currentWorld.canWrite ? (
				<Link to={`/ui/world/${currentWorld._id}/settings`} title="World Settings">
					<WorldIcon />
				</Link>
			) : null
		},
		...worldLinks
	];

	const leftCollapsedContent = (
		<PopoverBubble
			content={
				<div className={'nav-collapsed-panel'}>
					{leftComponents.map((comp) => (
						<div key={comp.key} className={'nav-collapsed-item'}>
							{comp.component}
						</div>
					))}
				</div>
			}
			visible={leftMenuVisible}
			onVisibleChange={(visible: boolean) => setLeftMenuVisible(visible)}
		>
			<SecondaryButton id={'navLeftCollapseButton'} onClick={(e) => e.preventDefault()}>
				<HamburgerMenuIcon />
			</SecondaryButton>
		</PopoverBubble>
	);

	const leftExpandedContent = (
		<>
			{leftComponents.map((comp) => (
				<div key={comp.key} className={'nav-expanded-item'}>
					{comp.component}
				</div>
			))}
		</>
	);

	const rightComponents: NavComponent[] = [
		{
			key: 'home',
			component: <Link to={'/ui/home'}>Home</Link>
		},
		{
			key: 'legal',
			component: <Link to={'/ui/legal'}>Legal</Link>
		},
		{
			key: 'serverSettings',
			component: (serverConfig.canAdmin || serverConfig.canWrite) ? (
				<Link to={`/ui/serverSettings`}>
					<ServerIcon />
					<span className={'margin-sm-left'}>Server Settings</span>
				</Link>
			) : null
		},
		...loginOptions,
		{
			key: 'themeToggle',
			component: <ThemeToggle />
		}
	];

	const rightCollapsedContent = (
		<PopoverBubble
			content={
				<div className={'nav-collapsed-panel'}>
					{rightComponents.map((comp) => (
						<div key={comp.key} className={'nav-collapsed-item'}>
							{comp.component}
						</div>
					))}
				</div>
			}
			visible={rightMenuVisible}
			onVisibleChange={(visible: boolean) => setRightMenuVisible(visible)}
		>
			<SecondaryButton id={'navRightCollapseButton'} onClick={(e) => e.preventDefault()}>
				<HamburgerMenuIcon />
			</SecondaryButton>
		</PopoverBubble>
	);

	const rightExpandedContent = (
		<>
			{rightComponents.map((comp) => (
				<div key={comp.key} className={'nav-expanded-item'}>
					{comp.component}
				</div>
			))}
		</>
	);

	return (
		<div className="shadow-sm padding-sm nav-bar" style={{top: 0, position: 'sticky'}}>

			<div className={'nav-layout'}>
				<div className={'nav-side'}>
					{isCollapsed ? leftCollapsedContent : leftExpandedContent}
				</div>

				<div className={'nav-search'}>
					{currentWorld && <SearchBar style={{width: '100%'}}/>}
				</div>

				<div className={'nav-side'}>
					{isCollapsed ? rightCollapsedContent : rightExpandedContent}
				</div>
			</div>
		</div>
	);
};
