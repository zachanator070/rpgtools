import React, {useEffect} from 'react';
import "@babel/polyfill";
import {useRouteMatch, Route, Switch} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import {NavBar} from './nav/navbar';
import {MapView} from './map/mapview';
import {LoginModal} from "./modals/loginmodal";
import {RegisterModal} from "./modals/registermodal";
import {CreateWorldModal} from "./modals/createworldmodal";
import {WikiContainer} from "./wiki/wikicontainer";
import {DefaultView} from "./default-view";

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
	return (
	<Switch>
		<Route path={match.url + "/map/:map_id"}>
			<MapView/>
		</Route>
		<Route path={match.url +  "/wiki/:wiki_id"}>
			<WikiContainer/>
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