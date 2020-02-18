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

const Header = () => {
	return (
		<>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
			<SelectWorldModal/>
			<EditPinModal/>
			<NavBar/>
		</>
	);
};

export default () => {

	return (
		<Switch>
			<Route path="/ui/world/:world_id">
				<Header/>
				<AppContent/>
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