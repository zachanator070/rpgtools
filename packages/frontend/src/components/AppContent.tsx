import {useParams, Route, Routes} from "react-router-dom";
import useCurrentWorld from "../hooks/world/useCurrentWorld.js";
import LoadingView from "./LoadingView.tsx";
import MapView from "./map/MapView.tsx";
import React from "react";
import WorldSettings from "./settings/WorldSettings.tsx";
import RolesView from "./permissions/RolesView.tsx";
import GameView from "../game/components/GameView.tsx";
import GameLoginView from "../game/components/GameLoginView.tsx";
import WikiIndex from "./wiki/WikiIndex.tsx";
import ModelView from "./models/ModelView.tsx";
import DefaultView from "./DefaultView.tsx";
import TimelineView from "./timeline/TimelineView.tsx";

export default function AppContent(){
	const { currentWorld, loading: worldLoading } = useCurrentWorld();
	const params = useParams();

	if (worldLoading) {
		return <LoadingView />;
	}

	if (!currentWorld) {
		return <div>{`404 - World ${params.world_id} not found`}</div>;
	}

	return (
		<Routes>
			<Route
				path={`settings`}
				element={<WorldSettings />}
			/>
			<Route path={`roles`} element={<RolesView />}/>
			<Route path={`map/:map_id`} element={<MapView />}/>
			<Route path={`wiki/:wiki_id/*`} element={<WikiIndex />}/>
			<Route path={`model/:model_id/*`} element={<ModelView />}/>
			<Route path={`model`} element={<ModelView />}/>
			<Route path={`gameLogin`} element={<GameLoginView />}/>
			<Route path={`game/:game_id`} element={<GameView />}/>
			<Route path={`timeline`} element={<TimelineView />}/>
			<Route element={<DefaultView/>}/>
		</Routes>
	);
};
