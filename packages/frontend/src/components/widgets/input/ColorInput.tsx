import React, {ChangeEventHandler, SyntheticEvent} from 'react';
import {Input} from "antd";
import {WidgetProps} from "../WidgetProps";

interface ColorInputProps extends WidgetProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

export default function ColorInput({style, value, onChange}: ColorInputProps) {
    return <Input
        style={style}
        type={"color"}
        value={value}
        onChange={onChange}
    />;
}