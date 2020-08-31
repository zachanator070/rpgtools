import React from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import {WikiView} from "../wiki/WikiView";
import useMapWiki from "../../hooks/useMapWiki";


export const MapDrawer = () => {

	const {mapWiki} = useMapWiki();

	return 	<SlidingDrawer placement={'left'} startVisible={true}>
		<WikiView currentWiki={mapWiki}/>
	</SlidingDrawer>;
};