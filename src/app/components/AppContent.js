import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import useCurrentWorld from "../hooks/useCurrentWorld";
import {LoadingView} from "./LoadingView";
import {MapView} from "./map/MapView";
import React from "react";
import useCurrentWiki from "../hooks/useCurrentWiki";
import {Col, Row} from "antd";
import {FolderView} from "./wiki/FolderView";
import {WikiEdit} from "./wiki/WikiEdit";
import {WikiView} from "./wiki/WikiView";

const WikiContent = () => {
	const {currentWiki, loading: wikiLoading} = useCurrentWiki();
	const match = useRouteMatch();

	return wikiLoading ? <LoadingView/> :
			<Row>
				<Col span={4} className='padding-md'>
					<FolderView/>
				</Col>
				<Col span={16}>
					<Switch>
						<Route path={`${match.path}/edit`}>
							<WikiEdit/>
						</Route>
						<Route path={`${match.path}/view`}>
							<div>
								<WikiView currentWiki={currentWiki}/>
							</div>
						</Route>
					</Switch>
				</Col>
				<Col span={4} className='padding-md'>
				</Col>
			</Row>

};

export const AppContent = () => {

	const match = useRouteMatch();
	const {currentWorld, loading: worldLoading} = useCurrentWorld();

	if(worldLoading){
		return <LoadingView/>;
	}

	if(!currentWorld){
		return (
			<div>
				{`404 - World ${match.params.world_id} not found`}
			</div>
		);
	}

	return (
		<Switch>
			<Route path={`${match.path}/map/:map_id`}>
				<MapView/>
			</Route>
			<Route path={`${match.path}/wiki/:wiki_id`}>
				<WikiContent/>
			</Route>
			{/*<Route path="/ui/game">*/}
			{/*    <GameContainer/>*/}
			{/*</Route>*/}
			<Route>
				<Redirect to={`/ui/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`}/>
			</Route>
		</Switch>
	);
};