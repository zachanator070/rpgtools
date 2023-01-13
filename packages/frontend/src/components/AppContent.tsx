import {useParams, Route, Routes} from "react-router-dom";
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import LoadingView from "./LoadingView";
import MapView from "./map/MapView";
import React from "react";
import WorldSettings from "./WorldSettings";
import RolesView from "./permissions/RolesView";
import GameView from "./game/GameView";
import GameLoginView from "./game/GameLoginView";
import WikView from "./wiki/WikiView";
import ModelView from "./models/ModelView";
import DefaultView from "./DefaultView";

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
			<Route path={`wiki/:wiki_id/*`} element={<WikView />}/>
			<Route path={`model/:model_id/*`} element={<ModelView />}/>
			<Route path={`model`} element={<ModelView />}/>
			<Route path={`gameLogin`} element={<GameLoginView />}/>
			<Route path={`game/:game_id`} element={<GameView />}/>
			<Route element={<DefaultView/>}/>
		</Routes>
	);
};
