import React from 'react';
import {Slider} from "antd";
import {WidgetProps} from "./WidgetProps";

interface NumberSliderPorps extends WidgetProps {
    min: number;
    max: number;
    value?: number;
    onChange: (number) => any;
    defaultValue?: number
}

export default function NumberSlider({min, max, value, onChange, defaultValue}: NumberSliderPorps) {
    return <Slider
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
    />;
}