import React, {CSSProperties} from 'react';
import {Input} from "antd";


export default function NumberInput({style, value, onChange}: {style?: CSSProperties, value?: number, onChange?: (number) => any}) {
    return <Input type="number" style={style} value={value} onChange={onChange}/>;
}