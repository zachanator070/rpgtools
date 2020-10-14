import React from 'react';
import {Breadcrumb} from "antd";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {Link} from 'react-router-dom';

export const MapBreadCrumbs = () => {

	const {currentMap, loading} = useCurrentMap();
	const {currentWorld} = useCurrentWorld();

	if(loading || !currentMap){
		return null;
	}

	const getMapPins = (map) => {
		return currentWorld.pins.filter(pin => pin.map._id === map._id);
	}

	const bfs = (map, target, path) => {
		if(path.find(otherMap => otherMap._id === map._id)){
			return [];
		}
		let currentPath = [...path, map];
		if(map._id === target._id){
			return currentPath;
		}
		const pins = getMapPins(map);
		for(let pin of pins){
			const newPath = bfs(pin.page, target, currentPath);
			if(newPath.length > 0){
				return newPath;
			}
		}
		return [];
	}

	const path = bfs(currentWorld.wikiPage, currentMap, []);

	const breadCrumbs = [];
	for (let map of path) {
		breadCrumbs.push(
			<Breadcrumb.Item key={map._id}>
				<Link to={`/ui/world/${currentWorld._id}/map/${map._id}`}>{map.name}</Link>
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
