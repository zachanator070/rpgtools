import React from "react";
import { Slider } from "antd";
import { WidgetProps } from "./WidgetProps";

interface NumberSliderProps extends WidgetProps {
	min: number;
	max: number;
	value?: number;
	onChange: (number) => void;
	defaultValue?: number;
}

export default function NumberSlider({ min, max, value, onChange }: NumberSliderProps) {
	return <Slider min={min} max={max} value={value} onChange={onChange} />;
}
