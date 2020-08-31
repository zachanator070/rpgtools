import React from 'react';
import {Input, Select, Slider} from "antd";
import {BRUSH_CIRCLE, BRUSH_ERASE, BRUSH_LINE, BRUSH_SQUARE} from "./GameRenderer";


export const BrushOptions = ({renderer}) => {

		return <>
			<div className={'margin-md'}>
				<h3>Brush Color</h3>
				<Input type={'color'} onChange={(e) => {renderer.setColor(e.target.value)}}/>
			</div>
			<div className={'margin-md'}>
				<h3>Brush Type</h3>
				<Select defaultValue="lucy" style={{ width: 120 }} onChange={(value => {renderer.brushType = value;})}>
					<Select.Option value={BRUSH_LINE} default>Line</Select.Option>
					<Select.Option value={BRUSH_SQUARE}>Square</Select.Option>
					<Select.Option value={BRUSH_CIRCLE}>Circle</Select.Option>
					<Select.Option value={BRUSH_ERASE}>Erase</Select.Option>
				</Select>
			</div>
			<div className={'margin-md'}>
				<h3>Brush Size</h3>
				<Slider
					min={1}
					max={20}
					onChange={(value) => {renderer.bushSize = value;}}
				/>
			</div>
		</>;
};