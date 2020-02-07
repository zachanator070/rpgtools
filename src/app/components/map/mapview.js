import React from 'react';
import {LoadingView} from "../loadingview";
import useCurrentWorld from "../../hooks/useCurrentWorld";

export const MapView = () => {

	const {currentWorld, loading} = useCurrentWorld();

	if (loading) return (<LoadingView/>);

	return (
		<>Map Generation Goes Here</>
	);
};