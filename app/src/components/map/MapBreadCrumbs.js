import React from 'react';
import {Breadcrumb} from "antd";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {useHistory} from 'react-router-dom';
import {useAllWikis} from "../../hooks/wiki/useAllWikis";

export const MapBreadCrumbs = () => {

	const {currentMap} = useCurrentMap();
	const {currentWorld} = useCurrentWorld();
	const history = useHistory();

	const getPinFromPageId = (pageId) => {
		for (let pin of currentWorld.pins) {
			if (pin.page && pin.page._id === pageId) {
				return pin;
			}
		}
	};

	const path = [];
	let nextMapToRender = currentMap;
	while (true) {
		const currentPin = getPinFromPageId(currentMap._id);
		path.push({
			name: nextMapToRender.name,
			id: nextMapToRender._id
		});

		if (nextMapToRender._id === currentWorld.wikiPage._id) {
			break;
		}
		if (!currentPin) {
			break;
		}
		nextMapToRender = currentPin.map;
	}

	const breadCrumbs = [];
	for (let map of path.reverse()) {
		breadCrumbs.push(
			<Breadcrumb.Item key={map.id}>
				<a href="#" onClick={() => {
					history.push(`/ui/world/${currentWorld._id}/map/${map.id}`);
				}}>{map.name}</a>
			</Breadcrumb.Item>
		);
	}

	return (
		<div className='breadcrumbs'>
			<Breadcrumb>
				{breadCrumbs}
			</Breadcrumb>
		</div>
	);
};
