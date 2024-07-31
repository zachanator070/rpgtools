import React, { useState } from "react";
import {
	ADD_MODEL_CONTROLS,
	CAMERA_CONTROLS,
	DELETE_CONTROLS,
	FOG_CONTROLS,
	MOVE_MODEL_CONTROLS,
	PAINT_CONTROLS,
	ROTATE_MODEL_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS,
} from "../../game/GameRenderer";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import LeaveGameButton from "./LeaveGameButton";
import PermissionModal from "../modals/PermissionModal";
import { GAME } from "@rpgtools/common/src/type-constants";
import ToolTip from "../widgets/ToolTip";
import DeleteIcon from "../widgets/icons/DeleteIcon";
import QuestionMarkIcon from "../widgets/icons/QuestionMarkIcon";
import CloudIcon from "../widgets/icons/CloudIcon";
import HighlightIcon from "../widgets/icons/HighlightIcon";
import RedoIcon from "../widgets/icons/RedoIcon";
import AddIcon from "../widgets/icons/AddIcon";
import CameraIcon from "../widgets/icons/CameraIcon";
import MoveIcon from "../widgets/icons/MoveIcon";
import PeopleIcon from "../widgets/icons/PeopleIcon";
import LocationIcon from "../widgets/icons/LocationIcon";
import SelectIcon from "../widgets/icons/SelectIcon";

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
	toolTipText[CAMERA_CONTROLS] = (
		<>
			Left click and drag to rotate camera
			<br />
			Right click and drag to pan camera
			<br />
			Scroll to zoom in or out
		</>
	);
	toolTipText[PAINT_CONTROLS] = (
		<>
			Left click and drag to paint on map
			<br />
			See "Brush Options" in side panel for painting config
		</>
	);
	toolTipText[ADD_MODEL_CONTROLS] = <>Add a model to this game</>;
	toolTipText[MOVE_MODEL_CONTROLS] = <>Left click on a model and drag to move it</>;
	toolTipText[ROTATE_MODEL_CONTROLS] = <>Left click on a model and drag to rotate it</>;
	toolTipText[DELETE_CONTROLS] = <>Left click on a mode to delete it</>;
	toolTipText[FOG_CONTROLS] = (
		<>
			Left click and drag to add fog of war to scene
			<br />
			See "Fog Options" in side panel for more options
		</>
	);
	toolTipText[SELECT_MODEL_CONTROLS] = (
		<>Left click to see information and settings about the model</>
	);
	toolTipText[SELECT_LOCATION_CONTROLS] = <>See controls window to change location of this game</>;

	const mouseOverText = {};
	mouseOverText[CAMERA_CONTROLS] = <>Move Camera, hotkey: c</>;
	mouseOverText[PAINT_CONTROLS] = <>Paint Brush, hotkey: p</>;
	mouseOverText[ADD_MODEL_CONTROLS] = <>Add Model, hotkey: a</>;
	mouseOverText[MOVE_MODEL_CONTROLS] = <>Move Model, hotkey: m</>;
	mouseOverText[ROTATE_MODEL_CONTROLS] = <>Rotate Model, hotkey: r</>;
	mouseOverText[DELETE_CONTROLS] = <>Delete Model, hotkey: x</>;
	mouseOverText[FOG_CONTROLS] = <>Fog of War Brush, hotkey: f</>;
	mouseOverText[SELECT_MODEL_CONTROLS] = <>Select Model, hotkey: s</>;
	mouseOverText[SELECT_LOCATION_CONTROLS] = <>Game Location, hotkey: l</>;

	const icons = {};
	icons[CAMERA_CONTROLS] = <CameraIcon />;
	icons[PAINT_CONTROLS] = <HighlightIcon />;
	icons[ADD_MODEL_CONTROLS] = <AddIcon />;
	icons[MOVE_MODEL_CONTROLS] = <MoveIcon />;
	icons[ROTATE_MODEL_CONTROLS] = <RedoIcon />;
	icons[DELETE_CONTROLS] = <DeleteIcon />;
	icons[FOG_CONTROLS] = <CloudIcon />;
	icons[SELECT_MODEL_CONTROLS] = <SelectIcon />;
	icons[SELECT_LOCATION_CONTROLS] = <LocationIcon />;

	const permission = {};
	permission[CAMERA_CONTROLS] = true;
	permission[PAINT_CONTROLS] = currentGame.canPaint;
	permission[ADD_MODEL_CONTROLS] = currentGame.canModel;
	permission[MOVE_MODEL_CONTROLS] = currentGame.canModel;
	permission[ROTATE_MODEL_CONTROLS] = currentGame.canModel;
	permission[DELETE_CONTROLS] = currentGame.canModel;
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
							onClick={async () => {
								await setControlsMode(mode);
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
						onClick={async () => {
							await setPermissionModalVisibility(true);
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
