import React, {CSSProperties} from 'react';
import {Input} from "antd";

export default function TextInput({id, value, onChange, style}: {
    id?: string,
    value?: string,
    onChange?: (event:  React.ChangeEvent<HTMLInputElement>) => any,
    style?: CSSProperties
}) {
    return <Input id={id} value={value} onChange={onChange}/>;
}