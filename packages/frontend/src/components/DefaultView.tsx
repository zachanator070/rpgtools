import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../hooks/authentication/useCurrentUser";
import LoadingView from "./LoadingView";
import WorldSelectPrompt from "./prompts/WorldSelectPrompt";

export default function DefaultView() {
	const navigate = useNavigate();
	const { currentUser, loading: currentUserLoading } = useCurrentUser();
	useEffect(() => {
		// if there isn't a world specified in the url and the logged in user was last using a world, redirect to that world
		if (currentUser && currentUser.currentWorld) {
			let redirectUrl = `/ui/world/${currentUser.currentWorld._id}/map/${currentUser.currentWorld.wikiPage._id}`;
			navigate(redirectUrl);
		}
	}, [currentUser]);

	if (currentUserLoading) return <LoadingView />;

	return <WorldSelectPrompt />;
};
