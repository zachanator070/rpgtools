import React from 'react';
import {SlidingDrawer} from "../SlidingDrawerV2";
import {WikiContent} from "../wiki/WikiContent";
import useMapWiki from "../../hooks/map/useMapWiki";


export const MapDrawer = () => {

	const {mapWiki} = useMapWiki();

	return 	<SlidingDrawer placement={'left'} startVisible={true}>
		<WikiContent currentWiki={mapWiki}/>
	</SlidingDrawer>;
};