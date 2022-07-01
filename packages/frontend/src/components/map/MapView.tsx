import React, {useContext} from "react";
import { Map } from "./Map";
import { PinComponent } from "./PinComponent";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useCurrentMap from "../../hooks/map/useCurrentMap";
import { LoadingView } from "../LoadingView";
import useCreatePin from "../../hooks/map/useCreatePin";
import { Link } from "react-router-dom";
import { MapBreadCrumbs } from "./MapBreadCrumbs";
import { MapDrawer } from "./MapDrawer";
import MapWikiContext from "../../MapWikiContext";

export const MapView = () => {
	const { currentWorld, loading } = useCurrentWorld();
	const { currentMap, loading: mapLoading } = useCurrentMap();
	const { createPin } = useCreatePin();
	const {mapWikiId} = useContext(MapWikiContext);

	const getPins = () => {
		let pins = [];
		let pinsOnThisMap = currentWorld.pins.filter((pin) => {
			return pin.map._id === currentMap._id;
		});
		for (let pin of pinsOnThisMap) {
			pins.push(<PinComponent pin={pin} key={pin._id} />);
		}

		return pins;
	};

	if (loading || mapLoading) {
		return <LoadingView />;
	}
	const pins = getPins();

	let map = (
		<Map
			menuItems={[
				{
					onClick: async (mouseX, mouseY) => {
						await createPin({mapId: currentMap._id, x: mouseX, y: mouseY});
					},
					name: "New Pin",
				},
			]}
			extras={pins}
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
