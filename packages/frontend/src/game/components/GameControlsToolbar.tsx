import React, { useState } from "react";
import useCurrentGame from "../../hooks/game/useCurrentGame.js";
import LeaveGameButton from "./LeaveGameButton.tsx";
import { GAME } from "@rpgtools/common/src/type-constants";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS
} from "../GameState.js";
import HighlightIcon from "../../components/widgets/icons/HighlightIcon.tsx";
import AddIcon from "../../components/widgets/icons/AddIcon.tsx";
import CloudIcon from "../../components/widgets/icons/CloudIcon.tsx";
import SelectIcon from "../../components/widgets/icons/SelectIcon.tsx";
import LocationIcon from "../../components/widgets/icons/LocationIcon.tsx";
import ToolTip from "../../components/widgets/ToolTip.tsx";
import PermissionModal from "../../components/modals/PermissionModal.tsx";
import PeopleIcon from "../../components/widgets/icons/PeopleIcon.tsx";


interface GameControlsToolbarProps {
	controlsMode: string;
	setControlsMode: (mode: string) => void;
}

export default function GameControlsToolbar({ controlsMode, setControlsMode }: GameControlsToolbarProps) {
	const { currentGame, loading, refetch: refetchCurrentGame } = useCurrentGame();
	const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);

	if (loading) {
		return <></>;
	}

	const toolTipText = {};
	toolTipText[PAINT_CONTROLS] = (
		<>
			Left click and drag to paint on map
			<br />
			Right click and drag to pan camera
			<br />
			Scroll to zoom in or out
			<br />
			See "Brush Options" in side panel for painting config
		</>
	);
	toolTipText[ADD_MODEL_CONTROLS] = <>Add a model to this game</>;
	toolTipText[FOG_CONTROLS] = (
		<>
			Left click and drag to add fog of war to scene
			<br />
			Right click and drag to pan camera
			<br />
			Scroll to zoom in or out
			<br />
			See "Fog Options" in side panel for more options
		</>
	);
	toolTipText[SELECT_MODEL_CONTROLS] = (
		<>
			Left click and drag to rotate camera
			<br />
			Right click and drag to pan camera
			<br />
			Scroll to zoom in or out
			<br />
			Left click on a model to see information and settings about the model
			{currentGame.canModel && <>
				<br />
				Left click on a model and drag to move it
				<br />
				Left click on a model and drag to rotate it
				<br />
				Press the delete key while a model is selected to delete it
			</>}
		</>
	);
	toolTipText[SELECT_LOCATION_CONTROLS] = <>See controls window to change location of this game</>;

	const mouseOverText = {};
	mouseOverText[PAINT_CONTROLS] = <>Paint Brush, hotkey: p</>;
	mouseOverText[ADD_MODEL_CONTROLS] = <>Add Model, hotkey: a</>;
	mouseOverText[FOG_CONTROLS] = <>Fog of War Brush, hotkey: f</>;
	mouseOverText[SELECT_MODEL_CONTROLS] = <>Select Model, hotkey: s</>;
	mouseOverText[SELECT_LOCATION_CONTROLS] = <>Game Location, hotkey: l</>;

	const icons = {};
	icons[SELECT_MODEL_CONTROLS] = <SelectIcon />;
	icons[ADD_MODEL_CONTROLS] = <AddIcon />;
	icons[PAINT_CONTROLS] = <HighlightIcon />;
	icons[FOG_CONTROLS] = <CloudIcon />;
	icons[SELECT_LOCATION_CONTROLS] = <LocationIcon />;

	const permission = {};
	permission[PAINT_CONTROLS] = currentGame.canPaint;
	permission[ADD_MODEL_CONTROLS] = currentGame.canModel;
	permission[FOG_CONTROLS] = currentGame.canWriteFog;
	permission[SELECT_MODEL_CONTROLS] = true;
	permission[SELECT_LOCATION_CONTROLS] = true;

	const menu = [
		<div
			style={{
				display: "flex",
			}}
			key={"Help Text"}
		>
			<ToolTip title={toolTipText[controlsMode]}/>
		</div>,
	];
	menu.push(
		...Object.keys(icons).map((mode) => {
			if (!permission[mode]) {
				return null;
			}
			return (
				<div
					style={{
						display: "flex",
					}}
					key={mode}
				>
					<ToolTip title={mouseOverText[mode]}>
						<div
							key={mode}
							style={{
								padding: "10px",
								width: "40px",
								backgroundColor: mode === controlsMode ? "#e6f7ff" : "white",
								borderTop: mode === controlsMode ? "3px solid #1890ff" : "none",
								cursor: "pointer",
							}}
							onClick={() => {
								setControlsMode(mode);
							}}
						>
							{icons[mode]}
						</div>
					</ToolTip>
				</div>
			);
		})
	);

	menu.push(
		<div
			style={{
				display: "flex",
			}}
			key={"Game Permissions"}
		>
			<PermissionModal
				visibility={permissionModalVisibility}
				setVisibility={async (visibility: boolean) => setPermissionModalVisibility(visibility)}
				subject={currentGame}
				subjectType={GAME}
				refetch={refetchCurrentGame}
			/>
			<ToolTip title={"Game Permissions"}>
				<div style={{ padding: "10px", backgroundColor: "white" }}>
					<a
						onClick={() => {
							setPermissionModalVisibility(true);
						}}
					>
						<PeopleIcon />
					</a>
				</div>
			</ToolTip>
		</div>
	);

	return (
		<div>
			<div
				style={{
					padding: "1em",
					position: "absolute",
					margin: "0 auto",
					left: 0,
					right: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<div style={{ backgroundColor: "white", display: 'flex', alignItems: 'center' }}>{menu}</div>
				<div className={"margin-lg-left"}>
					<LeaveGameButton />
				</div>
			</div>
		</div>
	);
};
