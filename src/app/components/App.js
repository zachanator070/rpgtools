import React from 'react';
import "@babel/polyfill";
import {useRouteMatch, Route, Switch, Redirect} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import {NavBar} from './nav/NavBar';
import {MapContent} from './map/MapContent';
import {LoginModal} from "./modals/LoginModal";
import {RegisterModal} from "./modals/RegisterModal";
import {CreateWorldModal} from "./modals/CreateWorldModal";
import {WikiContent} from "./wiki/WikiContent";
import {DefaultView} from "./DefaultView";
import useCurrentWorld from "../hooks/useCurrentWorld";
import {LoadingView} from "./LoadingView";
import {SelectWorldModal} from "./modals/SelectWorldModal";

const Header = () => {
	return (
		<>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
			<SelectWorldModal/>
			<NavBar/>
		</>
	);
};

const Content = () => {
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
			<MapContent/>
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

export default () => {

	return (
		<Switch>
			<Route path="/ui/world/:world_id">
				<Header/>
				<Content/>
			</Route>
			<Route exact path={'/'}>
				<Header/>
				<DefaultView/>
			</Route>
			<Route>
				<Redirect to={'/'}/>
			</Route>
		</Switch>
	);
};