import React, {CSSProperties} from 'react';
import {Input} from "antd";

interface TextInputProps {
    id?: string,
    value?: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => any,
    style?: CSSProperties,
    ref?: React.Ref<any>,
    disabled?: boolean,
    onKeyDown?: (key: string) => any,
}

export default function TextInput({id, value, onChange, style, ref, disabled, onKeyDown}: TextInputProps) {
    return <Input id={id} value={value} onChange={onChange} style={style} ref={ref} disabled={disabled} onKeyDown={(event) => onKeyDown(event.key)}/>;
}