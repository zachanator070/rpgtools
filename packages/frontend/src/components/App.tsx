import React, {useEffect, useState} from "react";
import "@babel/polyfill";
import {Route, useNavigate, useLocation, Routes, Navigate} from "react-router-dom";
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
import DefaultWorld from "./DefaultWorld";

export default function App() {
	const [mapWikiId, setMapWikiId] = useState<string>();
	const [showMapDrawer, setShowMapDrawer] = useState<boolean>(false);
	const {serverConfig, loading} = useServerConfig();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if(location.pathname !== '/ui/setup' && serverConfig && serverConfig.serverNeedsSetup) {
			navigate('/ui/setup')
		}
	}, [location, serverConfig]);

	if (loading) {
		return <LoadingView/>;
	}

	return (
		<MapWikiContext.Provider
			value={{
				mapWikiId,
				setMapWikiId,
				showMapDrawer,
				setShowMapDrawer
		}}>
			<Routes>
				<Route
					path="/ui"
					element={<>
						<NavBar />
						<DefaultView />
					</>}
				/>
				<Route
					path="/ui/world/:world_id/*"
					element={<>
						<NavBar />
						<AppContent />
					</>}
				/>
				<Route
					path={`/ui/serverSettings`}
					element={<ServerSettings />}
				/>
				<Route
					path={'/ui/defaultWorld'}
					element={<DefaultWorld/>}
				/>
				<Route
					path={"/"}
					element={<>
						<Navigate to="/ui" replace={true}/>
					</>}
				/>
				{serverConfig.serverNeedsSetup &&
					<Route path="/ui/setup" element={<ServerSetup />}/>
				}
			</Routes>
		</MapWikiContext.Provider>
	);
};
