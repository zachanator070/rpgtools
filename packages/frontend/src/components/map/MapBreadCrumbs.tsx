import React, {ReactElement} from "react";
import { Breadcrumb } from "antd";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { Link } from "react-router-dom";
import {Pin, Place} from "../../types";
import usePins from "../../hooks/map/usePins";

export default function MapBreadCrumbs() {
	const { currentMap, loading } = useCurrentMap();
	const {pins, loading: pinsLoading} = usePins({});
	const { currentWorld } = useCurrentWorld();

	if (loading || !currentMap || pinsLoading) {
		return null;
	}

	const getMapPins = (map: Place): Pin[] => {
		return pins.docs.filter((pin) => pin.map._id === map._id);
	};

	const bfs = (map: Place, target: Place, path): Place[] => {
		if (path.find((otherMap) => otherMap._id === map._id)) {
			return [];
		}
		let currentPath = [...path, map];
		if (map._id === target._id) {
			return currentPath;
		}
		const pins: Pin[] = getMapPins(map);
		for (let pin of pins) {
			const newPath = bfs(pin.page as Place, target, currentPath);
			if (newPath.length > 0) {
				return newPath;
			}
		}
		return [];
	};

	const path = bfs(currentWorld.wikiPage, currentMap, []);

	const breadCrumbs: ReactElement[] = [];
	for (let map of path) {
		breadCrumbs.push(
			<Breadcrumb.Item key={map._id}>
				<Link to={`/ui/world/${currentWorld._id}/map/${map._id}`}>
					{map.name}
				</Link>
			</Breadcrumb.Item>
		);
	}

	return (
		<div className="breadcrumbs">
			<Breadcrumb>{breadCrumbs}</Breadcrumb>
		</div>
	);
};
