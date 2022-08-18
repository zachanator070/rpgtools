import React, { useState } from "react";
import SelectWiki from "../select/SelectWiki";
import { PLACE } from "@rpgtools/common/src/type-constants";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import useSetGameMap from "../../hooks/game/useSetGameMap";
import LoadingView from "../LoadingView";
import {GameRenderer} from "../../rendering/GameRenderer";
import PrimaryButton from "../widgets/PrimaryButton";
import PrimaryCheckbox from "../widgets/PrimaryCheckbox";
import Toggle from "../widgets/Toggle";

 interface GameLocationSettingsProps {
	 setGameWikiId: (wikiId: string) => Promise<any>;
	 renderer: GameRenderer;
 }

export default function GameLocationSettings({ setGameWikiId, renderer }: GameLocationSettingsProps) {
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
					defaultChecked={renderer.getDrawGrid()}
					onChange={async (checked) => {
						renderer.setDrawGrid(checked);
					}}
				/>
			</div>
			{currentGame.canWrite && (
				<div className={"margin-lg-bottom"}>
					<h3>Change Location</h3>
					<SelectWiki
						types={[PLACE]}
						onChange={async (wiki) => {
							await setSelectedLocation(wiki._id);
						}}
					/>
					<div className={"margin-md"}>
						Clear Paint:{" "}
						<PrimaryCheckbox
							checked={clearPaint}
							onChange={async (checked) => {
								await setClearPaint(checked);
							}}
						/>
					</div>
					<div className={"margin-md"}>
						Set Fog:{" "}
						<PrimaryCheckbox
							checked={setFog}
							onChange={async (checked) => {
								await setSetFog(checked);
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
