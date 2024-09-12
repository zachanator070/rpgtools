import React, {ReactElement} from "react";
import useCurrentMap from "../../hooks/map/useCurrentMap.js";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import { Link } from "react-router-dom";
import {Pin, Place} from "../../types.js";
import usePins from "../../hooks/map/usePins.js";
import Breadcrumbs from "../widgets/Breadcrumbs.tsx";

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
		const currentPath = [...path, map];
		if (map._id === target._id) {
			return currentPath;
		}
		const pins: Pin[] = getMapPins(map);
		for (const pin of pins) {
			const newPath = bfs(pin.page as Place, target, currentPath);
			if (newPath.length > 0) {
				return newPath;
			}
		}
		return [];
	};

	const path = bfs(currentWorld.wikiPage, currentMap, []);

	const breadCrumbs: ReactElement[] = [];
	for (const map of path) {
		const url = `/ui/world/${currentWorld._id}/map/${map._id}`
		breadCrumbs.push(
			<Link to={url} key={url}>
				{map.name}
			</Link>
		);
	}

	return (
		<div className="breadcrumbs">
			<Breadcrumbs>{breadCrumbs}</Breadcrumbs>
		</div>
	);
};
