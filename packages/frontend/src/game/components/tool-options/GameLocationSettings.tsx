import React, { useState } from "react";
import { PLACE } from "@rpgtools/common/src/type-constants";
import useCurrentGame from "../../../hooks/game/useCurrentGame";
import useSetGameMap from "../../../hooks/game/useSetGameMap";
import GameControllerManager from "../../GameControllerManager";
import LoadingView from "../../../components/LoadingView";
import Toggle from "../../../components/widgets/Toggle";
import SelectWiki from "../../../components/select/SelectWiki";
import PrimaryCheckbox from "../../../components/widgets/PrimaryCheckbox";
import PrimaryButton from "../../../components/widgets/PrimaryButton";
import {DEFAULT_MAP_DRAW_GRID} from "../../GameState";

 interface GameLocationSettingsProps {
	 setGameWikiId: (wikiId: string) => Promise<any>;
	 controllerManager: GameControllerManager;
 }

export default function GameLocationSettings({ setGameWikiId, controllerManager }: GameLocationSettingsProps) {
	const { currentGame, loading: gameLoading } = useCurrentGame();
	const [selectedLocation, setSelectedLocation] = useState<string>();
	const [clearPaint, setClearPaint] = useState<boolean>();
	const [setFog, setSetFog] = useState<boolean>();
	const { setGameMap } = useSetGameMap();

	if (gameLoading) {
		return <LoadingView />;
	}

	return (
		<div>
			<div className={"margin-lg-top margin-lg-bottom"}>
				<h3>Current Location</h3>
				{currentGame.map ? (
					<a onClick={async () => await setGameWikiId(currentGame.map._id)}>
						{currentGame.map.name}
					</a>
				) : (
					<p>No current location</p>
				)}
			</div>
			<div className={"margin-lg-bottom"}>
				<Toggle
					checkedChildren={"Grid"}
					unCheckedChildren={"No Grid"}
					defaultChecked={DEFAULT_MAP_DRAW_GRID}
					onChange={(checked) => {
						controllerManager.mapController.setDrawGrid(checked);
					}}
				/>
			</div>
			{currentGame.canWrite && (
				<div className={"margin-lg-bottom"}>
					<h3>Change Location</h3>
					<SelectWiki
						types={[PLACE]}
						onChange={(wiki) => {
							setSelectedLocation(wiki._id);
						}}
					/>
					<div className={"margin-md"}>
						Clear Paint:{" "}
						<PrimaryCheckbox
							checked={clearPaint}
							onChange={(checked) => {
								setClearPaint(checked);
							}}
						/>
					</div>
					<div className={"margin-md"}>
						Set Fog:{" "}
						<PrimaryCheckbox
							checked={setFog}
							onChange={(checked) => {
								setSetFog(checked);
							}}
						/>
					</div>

					<div className={"margin-md"}>
						<PrimaryButton
							onClick={async () => {
								await setGameMap({
									gameId: currentGame._id,
									placeId: selectedLocation,
									clearPaint,
									setFog,
								});
							}}
							disabled={!selectedLocation}
						>
							Change location
						</PrimaryButton>
					</div>
				</div>
			)}
		</div>
	);
};
