import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import useCurrentWorld from "../hooks/world/useCurrentWorld";
import { LoadingView } from "./LoadingView";
import { MapView } from "./map/MapView";
import React from "react";
import WorldSettings from "./WorldSettings";
import { RolesView } from "./permissions/RolesView";
import { MyPermissionsView } from "./permissions/MyPermissionsView";
import { GameView } from "./game/GameView";
import { GameLoginView } from "./game/GameLoginView";
import { WikView } from "./wiki/WikiView";
import { ModelView } from "./models/ModelView";

export const AppContent = () => {
	const match = useRouteMatch();
	const { currentWorld, loading: worldLoading } = useCurrentWorld();

	if (worldLoading) {
		return <LoadingView />;
	}

	if (!currentWorld) {
		return <div>{`404 - World ${match.params.world_id} not found`}</div>;
	}

	return (
		<Switch>
			<Route path={`${match.path}/settings`}>
				<WorldSettings />
			</Route>
			<Route path={`${match.path}/myPermissions`}>
				<MyPermissionsView />
			</Route>
			<Route path={`${match.path}/roles`}>
				<RolesView />
			</Route>
			<Route path={`${match.path}/map/:map_id`}>
				<MapView />
			</Route>
			<Route path={`${match.path}/wiki/:wiki_id`}>
				<WikView />
			</Route>
			<Route path={`${match.path}/model/:model_id?`}>
				<ModelView />
			</Route>
			<Route path={`${match.path}/gameLogin`}>
				<GameLoginView />
			</Route>
			<Route path={`${match.path}/game/:game_id`}>
				<GameView />
			</Route>
			<Route>
				<Redirect
					to={`/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`}
				/>
			</Route>
		</Switch>
	);
};
