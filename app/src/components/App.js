import React from 'react';
import "@babel/polyfill";
import {Route, Switch, Redirect} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import {NavBar} from './nav/NavBar';
import {DefaultView} from "./DefaultView";
import {AppContent} from "./AppContent";
import {ServerSetup} from "./server/ServerSetup";
import ServerSettings from "./server/ServerSettings";


export default () => {

	return (
		<Switch>
			<Route path="/ui/world/:world_id">
				<NavBar/>
				<AppContent/>
			</Route>
			<Route path="/ui/setup">
				<ServerSetup/>
			</Route>
			<Route path={`/ui/serverSettings`}>
				<ServerSettings/>
			</Route>
			<Route exact path={'/'}>
				<NavBar/>
				<DefaultView/>
			</Route>
			<Route>
				<Redirect to={'/'}/>
			</Route>
		</Switch>
	);
};