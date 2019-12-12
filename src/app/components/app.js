import React, {useEffect} from 'react';
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
import useSetCurrentWorld from "../hooks/useSetCurrentWorld";
import {withRouter} from 'react-router-dom';
import WorldSelectPrompt from "./prompts/worldselectprompt";
import {DefaultView} from "./defaultview";
import WikiContainer from "./wiki/wikicontainer";

export default withRouter(({location, history}) => {

	const {currentUser, loading: currentUserLoading} = useCurrentUser();
	const {loading: currentWorldLoading, currentWorld} = useCurrentWorld();
	const {setCurrentWorld} = useSetCurrentWorld();

	let redirectUrl = '/ui';
	if (currentWorld) {
		redirectUrl += `/world/${currentWorld._id}/map/${currentWorld.wikiPage._id}`;
	}

	useEffect(() => {
		(async () => {
			if(currentUser && currentUser.currentWorld && (!currentWorld || currentUser.currentWorld._id !== currentWorld._id)){
				await setCurrentWorld(currentUser.currentWorld._id);
			}
		})();

	}, [currentUser]);

	useEffect(() => {
		history.push(redirectUrl);
	}, [currentWorld]);

	if (currentUserLoading || currentWorldLoading) return (<LoadingView/>);

	return (
		<>
			<LoginModal/>
			<RegisterModal/>
			<CreateWorldModal/>
			<NavBar/>
			<Switch>
				<Route path="/ui/world/:world_id/map/:map_id">
					<MapView/>
				</Route>
				<Route path="/ui/world/:world_id/wiki/:wiki_id">
				    <WikiContainer/>
				</Route>
				{/*<Route path="/ui/game">*/}
				{/*    <GameContainer/>*/}
				{/*</Route>*/}
				<Route path='/ui'>
					<DefaultView/>
				</Route>
				<Redirect exact from="/" to={redirectUrl}/>
				<Route path="/ui">
					<WorldSelectPrompt/>
				</Route>
			</Switch>
		</>
	);
});