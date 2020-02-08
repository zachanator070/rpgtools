import React from 'react';
import "@babel/polyfill";
import {useRouteMatch, Route, Switch} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import {NavBar} from './nav/navbar';
import {MapView} from './map/mapview';
import {LoginModal} from "./modals/loginmodal";
import {RegisterModal} from "./modals/registermodal";
import {CreateWorldModal} from "./modals/createworldmodal";
import {WikiContent} from "./wiki/wiki-content";
import {DefaultView} from "./default-view";
import useCurrentWorld from "../hooks/useCurrentWorld";
import {LoadingView} from "./loadingview";

const Header = () => {
	return (
		<>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
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
			<MapView/>
		</Route>
		<Route path={`${match.path}/wiki/:wiki_id`}>
			<WikiContent/>
		</Route>
		{/*<Route path="/ui/game">*/}
		{/*    <GameContainer/>*/}
		{/*</Route>*/}
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
			<Route>
				<Header/>
				<DefaultView/>
			</Route>
		</Switch>
	);
};