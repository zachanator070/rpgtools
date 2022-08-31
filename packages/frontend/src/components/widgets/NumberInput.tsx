import React from 'react';
import {InputNumber} from "antd";
import {WidgetProps} from "./WidgetProps";

interface NumberInputProps extends WidgetProps {
    value?: number;
    onChange?: (number) => any;
    name?: string;
}

export default function NumberInput({style, value, onChange, id, name}: NumberInputProps) {
    return <InputNumber name={name} style={style} value={value} onChange={onChange} id={id}/>;
}