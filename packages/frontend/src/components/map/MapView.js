import React from 'react';
import {Map} from "./Map";
import {Pin} from "./Pin";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import {LoadingView} from "../LoadingView";
import useCreatePin from "../../hooks/map/useCreatePin";
import {Link} from "react-router-dom";
import {MapBreadCrumbs} from "./MapBreadCrumbs";
import {MapDrawer} from "./MapDrawer";
import {useQuery} from "@apollo/client";
import {MAP_WIKI_ID} from "../../hooks/map/useMapWiki";

export const MapView = () => {

	const {currentWorld, loading} = useCurrentWorld();
	const {currentMap, loading: mapLoading} = useCurrentMap();
	const {createPin} = useCreatePin();
	const {data: mapWikiData} = useQuery(MAP_WIKI_ID);

	const getPins = () => {
		let pins = [];
		let pinsOnThisMap = currentWorld.pins.filter((pin) => {
			return pin.map._id === currentMap._id
		});
		for (let pin of pinsOnThisMap) {
			pins.push(
				<Pin
					pin={pin}
					key={pin._id}
				/>
			);
		}

		return pins;
	};

	if (loading || mapLoading) {
		return <LoadingView/>;
	}
	const pins = getPins();

	let map = <Map
		menuItems={[
			{
				onClick: async (mouseX, mouseY) => {
					await createPin(currentMap._id, mouseX, mouseY, null);
				},
				name: 'New Pin'
			}
		]}
		extras={pins}
	/>;

	if (!currentMap.mapImage) {
		return (
			<div>
				No map image to render
				{currentMap.canWrite && <div>You can add a map image by <Link to={`/ui/world/${currentWorld._id}/wiki/${currentMap._id}/edit`}>editing the wiki</Link></div>}
			</div>
		);
	}

	return (
		<>
			<MapBreadCrumbs/>
			<div id='mapContainer' style={{position: 'relative', height: '100%'}}
			     className='overflow-hidden flex-column flex-grow-1'>
				{mapWikiData && mapWikiData.mapWiki &&
				<div style={{zIndex: '2'}}>
					<MapDrawer/>
				</div>
				}
				<div className='flex-grow-1 flex-column'>
					{map}
				</div>
			</div>
		</>

	);

};
