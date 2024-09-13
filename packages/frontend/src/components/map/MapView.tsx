import React, {useContext} from "react";
import Map from "./Map.js";
import PinComponent from "./PinComponent";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import useCurrentMap from "../../hooks/map/useCurrentMap.js";
import LoadingView from "../LoadingView.js";
import useCreatePin from "../../hooks/map/useCreatePin.js";
import { Link } from "react-router-dom";
import MapBreadCrumbs from "./MapBreadCrumbs.js";
import MapDrawer from "./MapDrawer.js";
import MapWikiContext from "../../MapWikiContext.js";
import usePins from "../../hooks/map/usePins.js";

export default function MapView() {
	const { currentWorld, loading } = useCurrentWorld();
	const { pins, loading: pinsLoading} = usePins({});
	const { currentMap, loading: mapLoading } = useCurrentMap();
	const { createPin } = useCreatePin();
	const {mapWikiId} = useContext(MapWikiContext);

	const getPins = () => {
		const filteredPins = [];
		const pinsOnThisMap = pins.docs.filter((pin) => {
			return pin.map._id === currentMap._id;
		});
		for (const pin of pinsOnThisMap) {
			filteredPins.push(<PinComponent pin={pin} key={pin._id} />);
		}

		return filteredPins;
	};

	if (loading || mapLoading || pinsLoading) {
		return <LoadingView />;
	}
	const pinComponents = getPins();

	const map = (
		<Map
			menuItems={[
				{
					onClick: async (mouseX, mouseY) => {
						await createPin({mapId: currentMap._id, x: mouseX, y: mouseY});
					},
					name: "New Pin",
				},
			]}
			extras={pinComponents}
		/>
	);

	if (!currentMap.mapImage) {
		return (
			<div>
				No map image to render
				{currentMap.canWrite && (
					<div>
						You can add a map image by{" "}
						<Link
							to={`/ui/world/${currentWorld._id}/wiki/${currentMap._id}/edit`}
						>
							editing the wiki
						</Link>
					</div>
				)}
			</div>
		);
	}

	return (
		<>
			<MapBreadCrumbs />
			<div
				id="mapContainer"
				style={{ position: "relative", height: "100%" }}
				className="overflow-hidden flex-column flex-grow-1"
			>
				{mapWikiId && (
					<div style={{ zIndex: 2 }}>
						<MapDrawer />
					</div>
				)}
				<div className="flex-grow-1 flex-column">{map}</div>
			</div>
		</>
	);
};
