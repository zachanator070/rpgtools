import React from 'react';
import {Map} from "./Map";
import {Pin} from "./Pin";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentMap from "../../hooks/useCurrentMap";
import {LoadingView} from "../LoadingView";
import useCreatePin from "../../hooks/useCreatePin";
import {Link} from "react-router-dom";
import {MapBreadCrumbs} from "./MapBreadCrumbs";
import {MapDrawer} from "./MapDrawer";
import {useQuery} from "@apollo/react-hooks";
import {MAP_WIKI_ID} from "../../../../common/src/gql-queries";

export const MapView = () => {

	const {currentWorld, loading} = useCurrentWorld();
	const {currentMap, loading: mapLoading} = useCurrentMap();
	const {createPin} = useCreatePin();
	const {data: {mapWiki}} = useQuery(MAP_WIKI_ID);

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
				{mapWiki &&
				<div style={{zIndex: '1'}}>
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
