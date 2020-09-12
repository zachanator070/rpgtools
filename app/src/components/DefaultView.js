import {useHistory} from "react-router-dom";
import useCurrentUser from "../hooks/authentication/useCurrentUser";
import {LoadingView} from "./LoadingView";
import React, {useEffect} from "react";
import {WorldSelectPrompt} from "./prompts/WorldSelectPrompt";

export const DefaultView = () => {

	const history = useHistory();
	const {currentUser, loading: currentUserLoading} = useCurrentUser();
	useEffect(() => {
		// if there isn't a world specified in the url and the logged in user was last using a world, redirect to that world
		if (currentUser && currentUser.currentWorld) {
			let redirectUrl = `/ui/world/${currentUser.currentWorld._id}/map/${currentUser.currentWorld.wikiPage._id}`;
			history.push(redirectUrl);
		}
	}, [currentUser]);

	if (currentUserLoading) return (<LoadingView/>);

	return (<WorldSelectPrompt/>);
};