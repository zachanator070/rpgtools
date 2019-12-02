import React from 'react';
import WorldSelectPrompt from "../prompts/worldselectprompt";
import LoadingView from "../loadingview";
import useCurrentUser from "../../hooks/useCurrentUser";


export default function MapView() {

	const {loading, error, data} = useCurrentUser();

	if (loading) return (<LoadingView/>);
	if (error) return (<>{error}</>);

	if (!data.currentUser || !data.currentUser.currentWorld) {
		return (<WorldSelectPrompt/>);
	}

	return (
		<>Map Generation Goes Here</>
	);
};