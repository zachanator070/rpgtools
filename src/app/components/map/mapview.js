import React from 'react';
import WorldSelectPrompt from "../prompts/worldselectprompt";
import LoadingView from "../loadingview";
import useCurrentUser from "../../hooks/useCurrentUser";


export default function MapView() {

	const {currentUser, loading, errors} = useCurrentUser();

	if (loading) return (<LoadingView/>);
	if (errors.length > 0) return (<>{errors.join('\n')}</>);

	if (!currentUser || !currentUser.currentWorld) {
		return (<WorldSelectPrompt/>);
	}

	return (
		<>Map Generation Goes Here</>
	);
};