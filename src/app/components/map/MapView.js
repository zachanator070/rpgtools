import React from 'react';
import {Map} from "./Map";
import {Pin} from "./Pin";
import useCurrentWorld from "../../hooks/useCurrentWorld";
import useCurrentMap from "../../hooks/useCurrentMap";
import {LoadingView} from "../LoadingView";
import useCreatePin from "../../hooks/useCreatePin";
import {Link} from "react-router-dom";

export const MapView = () => {

	const {currentWorld, loading} = useCurrentWorld();
	const {currentMap, loading: mapLoading} = useCurrentMap();
	const {createPin} = useCreatePin();

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
			{/*<MapBreadCrumbs/>*/}
			<div className='flex-grow-1 flex-column'>
				{/*{this.props.displayWiki ?*/}
				{/*	<SlidingDrawer*/}
				{/*		side='left'*/}
				{/*		show={this.props.ui.showLeftDrawer}*/}
				{/*		setShow={this.props.showLeftDrawer}*/}
				{/*		height={this.state.height}*/}
				{/*		maxWidth={this.state.width}*/}
				{/*	>*/}
				{/*		<WikiView*/}
				{/*			gotoPage={this.props.gotoPage}*/}
				{/*			currentWiki={this.props.displayWiki}*/}
				{/*			currentWorld={this.props.currentWorld}*/}
				{/*			allPins={this.props.allPins}*/}
				{/*		/>*/}
				{/*	</SlidingDrawer>*/}
				{/*	: null}*/}
				{map}
			</div>
		</div>
	);

};
