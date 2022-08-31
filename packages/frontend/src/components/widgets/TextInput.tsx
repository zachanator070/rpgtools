import React, {CSSProperties} from 'react';
import {Input} from "antd";
import {WidgetProps} from "./WidgetProps";

interface TextInputProps extends WidgetProps{
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any;
    disabled?: boolean;
    onKeyDown?: (key: string) => any;
    name?: string;
}

export default function TextInput({id, value, onChange, style, ref, disabled, onKeyDown, name}: TextInputProps) {
    return <Input id={id} name={name} value={value} onChange={onChange} style={style} ref={ref} disabled={disabled} onKeyDown={(event) => onKeyDown && onKeyDown(event.key)}/>;
}