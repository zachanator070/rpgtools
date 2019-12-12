import React from 'react';
import WorldSelectPrompt from "../prompts/worldselectprompt";
import LoadingView from "../loadingview";
import useCurrentUser from "../../hooks/useCurrentUser";
import useCurrentWorld from "../../hooks/useCurrentWorld";

export default function MapView() {

	const {currentWorld, loading} = useCurrentWorld();

	if (loading) return (<LoadingView/>);

	return (
		<>Map Generation Goes Here</>
	);
};