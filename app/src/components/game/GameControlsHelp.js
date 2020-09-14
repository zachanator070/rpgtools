import React from 'react';
import {
	CAMERA_CONTROLS, DELETE_CONTROLS,
	MOVE_MODEL_CONTROLS,
	PAINT_CONTROLS,
	ROTATE_MODEL_CONTROLS
} from "../../rendering/GameRenderer";
import {Tooltip} from "antd";
import {
	DeleteOutlined,
	DragOutlined,
	HighlightOutlined,
	QuestionCircleOutlined,
	RedoOutlined,
	VideoCameraOutlined
} from '@ant-design/icons';

export const GameControlsHelp = ({controlsMode, setControlsMode}) => {

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
		</>
	}

	const mouseOverText = {
		CAMERA_CONTROLS: <>
			Move Camera, hotkey: c
		</>,
		PAINT_CONTROLS: <>
			Paint, hotkey: p
		</>,
		MOVE_MODEL_CONTROLS: <>
			Move Model, hotkey: m
		</>,
		ROTATE_MODEL_CONTROLS: <>
			Rotate Model, hotkey: r
		</>,
		DELETE_CONTROLS: <>
			Delete Model, hotkey: x
		</>
	}

	const icons = {
		CAMERA_CONTROLS: <VideoCameraOutlined/>,
		PAINT_CONTROLS: <HighlightOutlined/>,
		MOVE_MODEL_CONTROLS: <DragOutlined/>,
		ROTATE_MODEL_CONTROLS: <RedoOutlined/>,
		DELETE_CONTROLS: <DeleteOutlined />
	};

	const menu = Object.keys(icons).map((mode) => {
		return <Tooltip placement='right' title={mouseOverText[mode]}>
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