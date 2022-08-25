import React, {CSSProperties} from 'react';
import {Input} from "antd";
import {WidgetProps} from "./WidgetProps";

interface NumberInputProps extends WidgetProps {
    value?: number;
    onChange?: (number) => any;
}

export default function NumberInput({style, value, onChange, id}: NumberInputProps) {
    return <Input type="number" style={style} value={value} onChange={onChange} id={id}/>;
}