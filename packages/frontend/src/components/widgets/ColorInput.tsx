import React, {CSSProperties} from 'react';
import {Input} from "antd";

export default function ColorInput({style, value, onChange}: {style?: CSSProperties, value: string, onChange: (string) => any}) {
    return <Input
        style={style}
        type={"color"}
        value={value}
        onChange={onChange}
    />;
}