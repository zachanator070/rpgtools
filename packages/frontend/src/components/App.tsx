import React, {useState} from "react";
import "@babel/polyfill";
import { Route, Switch, Redirect } from "react-router-dom";
import "../css/index.css";
import "antd/dist/antd.css";
import NavBar from "./nav/NavBar";
import DefaultView from "./DefaultView";
import AppContent from "./AppContent";
import ServerSetup from "./server/ServerSetup";
import ServerSettings from "./server/ServerSettings";
import MapWikiContext from "../MapWikiContext";
import useServerConfig from "../hooks/server/useServerConfig";
import LoadingView from "./LoadingView";

export default function App() {
	const [mapWikiId, setMapWikiId] = useState<string>();
	const [showMapDrawer, setShowMapDrawer] = useState<boolean>(false);
	const {serverConfig, loading} = useServerConfig();

	if (loading) {
		return <LoadingView/>;
	}

	if (serverConfig.serverNeedsSetup) {
		return <Switch>
			<Route path="/ui/setup">
				<ServerSetup />
			</Route>
			<Route>
				<Redirect to={"/ui/setup"} />
			</Route>
		</Switch>;
	}

	return (
		<MapWikiContext.Provider
			value={{
				mapWikiId,
				setMapWikiId,
				showMapDrawer,
				setShowMapDrawer
		}}>
			<Switch>
				<Route path="/ui/world/:world_id">
					<NavBar />
					<AppContent />
				</Route>

				<Route path={`/ui/serverSettings`}>
					<ServerSettings />
				</Route>
				<Route exact path={"/"}>
					<NavBar />
					<DefaultView />
				</Route>
				<Route>
					<Redirect to={"/"} />
				</Route>
			</Switch>
		</MapWikiContext.Provider>
	);
};
