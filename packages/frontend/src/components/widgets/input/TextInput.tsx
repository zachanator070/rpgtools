import React, {Ref} from 'react';
import {Input} from "antd";
import {WidgetProps} from "../WidgetProps.js";

interface TextInputProps extends WidgetProps{
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any;
    disabled?: boolean;
    onKeyDown?: (key: string) => any;
    name?: string;
    innerRef?: Ref<any>;
    defaultValue?: string;
}

export default function TextInput({id, value, onChange, style, disabled, onKeyDown, name, innerRef, defaultValue}: TextInputProps) {
    return <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        style={style}
        ref={innerRef}
        disabled={disabled}
        onKeyDown={(event) => onKeyDown && onKeyDown(event.key)}
        defaultValue={defaultValue}
    />;
}