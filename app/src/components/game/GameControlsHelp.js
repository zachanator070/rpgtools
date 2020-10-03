import React from 'react';
import {Tooltip} from "antd";
import {
	CloudOutlined,
	DeleteOutlined,
	DragOutlined,
	HighlightOutlined,
	QuestionCircleOutlined,
	RedoOutlined,
	VideoCameraOutlined,
	SelectOutlined
} from '@ant-design/icons';
import useCurrentGame from "../../hooks/game/useCurrentGame";

export const GameControlsHelp = ({controlsMode, setControlsMode}) => {

	const {currentGame, loading} = useCurrentGame();

	if(loading){
		return <></>;
	}

	const toolTipText = {
		CAMERA_CONTROLS: <>
			Left click and drag to rotate camera
			<br/>
			Right click and drag to pan camera
			<br/>
			Scroll to zoom in or out
		</>,
		PAINT_CONTROLS: <>
			Left click and drag to paint on map
			<br/>
			See "Brush Options" in side panel for painting config
		</>,
		MOVE_MODEL_CONTROLS: <>
			Left click on a model and drag to move it
		</>,
		ROTATE_MODEL_CONTROLS: <>
			Left click on a model and drag to rotate it
		</>,
		DELETE_CONTROLS: <>
			Left click on a mode to delete it
		</>,
		FOG_CONTROLS: <>
			Left click and drag to add fog of war to scene
			<br/>
			See "Fog Options" in side panel for more options
		</>,
		SELECT_MODEL_CONTROLS: <>
			Left click to see information and settings about the model
		</>,
	}

	const mouseOverText = {
		CAMERA_CONTROLS: <>
			Move Camera, hotkey: c
		</>,
		PAINT_CONTROLS: <>
			Paint Brush, hotkey: p
		</>,
		MOVE_MODEL_CONTROLS: <>
			Move Model, hotkey: m
		</>,
		ROTATE_MODEL_CONTROLS: <>
			Rotate Model, hotkey: r
		</>,
		DELETE_CONTROLS: <>
			Delete Model, hotkey: x
		</>,
		FOG_CONTROLS: <>
			Fog of War Brush, hotkey: f
		</>,
		SELECT_MODEL_CONTROLS: <>
			Select Model, hotkey: s
		</>
	}

	const icons = {
		CAMERA_CONTROLS: <VideoCameraOutlined/>,
		PAINT_CONTROLS: <HighlightOutlined/>,
		MOVE_MODEL_CONTROLS: <DragOutlined/>,
		ROTATE_MODEL_CONTROLS: <RedoOutlined/>,
		DELETE_CONTROLS: <DeleteOutlined />,
		FOG_CONTROLS: <CloudOutlined />,
		SELECT_MODEL_CONTROLS: <SelectOutlined />
	};

	const permission = {
		CAMERA_CONTROLS: true,
		PAINT_CONTROLS: currentGame.canPaint,
		MOVE_MODEL_CONTROLS: currentGame.canModel,
		ROTATE_MODEL_CONTROLS: currentGame.canModel,
		DELETE_CONTROLS: currentGame.canModel,
		FOG_CONTROLS: currentGame.canWriteFog,
		SELECT_MODEL_CONTROLS: currentGame.canModel
	}

	const menu = Object.keys(icons).map((mode) => {
		if(!permission[mode]){
			return null;
		}
		return <Tooltip placement='right' title={mouseOverText[mode]} key={mode}>
			<div
				key={mode}
				style={{
					padding: '10px',
					backgroundColor: mode === controlsMode ? '#e6f7ff' : 'white',
					borderRight: mode === controlsMode ? '3px solid #1890ff' : 'none',
					cursor: 'pointer'
				}}
				onClick={async () => {
					await setControlsMode(mode);
				}}
			>
				{icons[mode]}
			</div>
		</Tooltip>;
	})

	return <div style={{position: 'absolute', left: 0, top: 0, width: 40, backgroundColor: 'white'}}>
		<Tooltip placement='right' title={toolTipText[controlsMode]}>
			<div style={{padding: '10px', backgroundColor: 'white'}}>
				<QuestionCircleOutlined />
			</div>
		</Tooltip>
		{menu}
	</div>;
};