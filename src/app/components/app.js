import React from 'react';
import "@babel/polyfill";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import '../css/index.css';
import 'antd/dist/antd.css';
import NavBar from './nav/navbar';
import MapView from './map/mapview';
import LoadingView from './loadingview';
import LoginModal from "./modals/loginmodal";
import RegisterModal from "./modals/registermodal";
import CreateWorldModal from "./modals/createworldmodal";
import useCurrentUser from "../hooks/useCurrentUser";
import useCurrentWorld from "../hooks/useCurrentWorld";

export default () => {

	const {currentUser, loading: currentUserLoading} = useCurrentUser();
	const {loading: currentWorldLoading, currentWorld} = useCurrentWorld();

	if (currentUserLoading || currentWorldLoading) return (<LoadingView/>);

	let redirectUrl = '/ui/world';
	if (currentWorld && currentUser) {
		if (currentUser.currentWorld) {
			redirectUrl += `${currentWorld._id}`;
		}
	}

	return (
		<BrowserRouter>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
			<NavBar>
				<Switch>
					<Redirect exact from="/" to={redirectUrl}/>
					<Route path="/ui/world/:world_id/map/:map_id">
						<MapView/>
					</Route>
					{/*<Route path="/ui/wiki">*/}
					{/*    <WikiContainer/>*/}
					{/*</Route>*/}
					{/*<Route path="/ui/game">*/}
					{/*    <GameContainer/>*/}
					{/*</Route>*/}
				</Switch>
			</NavBar>
		</BrowserRouter>
	);
};