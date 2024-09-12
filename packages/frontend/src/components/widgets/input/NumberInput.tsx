import React from 'react';
import {InputNumber} from "antd";
import {WidgetProps} from "../WidgetProps.js";

interface NumberInputProps extends WidgetProps {
    value?: number;
    onChange?: (number) => any;
    name?: string;
    defaultValue?: number;
    maxValue?: number;
    minValue?: number;
}

export default function NumberInput({style, value, onChange, id, name, defaultValue, maxValue, minValue}: NumberInputProps) {
    return <InputNumber name={name} style={style} value={value} onChange={onChange} id={id} defaultValue={defaultValue} max={maxValue} min={minValue}/>;
}