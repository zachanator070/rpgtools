import React from 'react';
import {Map} from "./Map";
import {Pin} from "./Pin";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentMap from "../../hooks/useCurrentMap";
import {LoadingView} from "../LoadingView";
import useCreatePin from "../../hooks/useCreatePin";
import {Link} from "react-router-dom";
import {WikiView} from "../wiki/WikiView";
import useMapWikiVisibility from "../../hooks/useMapWikiVisibility";
import useSetMapWikiVisibility from "../../hooks/useSetMapWikiVisibility";
import {SlidingDrawer} from "../SlidingDrawer";
import useMapWiki from "../../hooks/useMapWiki";
import {MapBreadCrumbs} from "./MapBreadCrumbs";

export const MapView = () => {

	const {currentWorld, loading} = useCurrentWorld();
	const {currentMap, loading: mapLoading} = useCurrentMap();
	const {createPin} = useCreatePin();

	const {mapWikiVisibility} = useMapWikiVisibility();
	const {setMapWikiVisibility} = useSetMapWikiVisibility();
	const {mapWiki} = useMapWiki();

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
		<div id='mapContainer' style={{position: 'relative', height: '100%'}}
		     className='overflow-hidden flex-column flex-grow-1'>
			<MapBreadCrumbs/>
			<div className='flex-grow-1 flex-column'>
				{mapWiki &&
					<SlidingDrawer
						side='left'
						show={mapWikiVisibility}
						setShow={setMapWikiVisibility}
					>
						<WikiView currentWiki={mapWiki}/>
					</SlidingDrawer>
				}
				{map}
			</div>
		</div>
	);

};
