import React from 'react';
import "@babel/polyfill";
import {Route, Switch, Redirect} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import {NavBar} from './nav/NavBar';
import {LoginModal} from "./modals/LoginModal";
import {RegisterModal} from "./modals/RegisterModal";
import {CreateWorldModal} from "./modals/CreateWorldModal";
import {DefaultView} from "./DefaultView";
import {SelectWorldModal} from "./modals/SelectWorldModal";
import {AppContent} from "./AppContent";
import {EditPinModal} from "./modals/EditPinModal";
import {PermissionModal} from "./modals/PermissionModal";

export const Modals = () => {
	return (
		<>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
			<SelectWorldModal/>
			<PermissionModal/>
			<EditPinModal/>
			<NavBar/>
		</>
	);
};

export default () => {

	return (
		<Switch>
			<Route path="/ui/world/:world_id">
				<AppContent/>
			</Route>
			<Route exact path={'/'}>
				<Modals/>
				<DefaultView/>
			</Route>
			<Route>
				<Redirect to={'/'}/>
			</Route>
		</Switch>
	);
};