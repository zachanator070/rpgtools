import React from 'react';
import {Slider} from "antd";

export default function NumberSlider({min, max, value, onChange, defaultValue}: {min: number, max: number, value?: number, onChange: (number) => any, defaultValue?: number}) {
    return <Slider
        min={min}
        max={max}
        value={value}
        onChange={onChange}
    />;
}