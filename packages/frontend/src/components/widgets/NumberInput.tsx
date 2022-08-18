import React, {CSSProperties} from 'react';
import {Input} from "antd";


export default function NumberInput({style, value, onChange, id}: {style?: CSSProperties, value?: number, onChange?: (number) => any, id?: string}) {
    return <Input type="number" style={style} value={value} onChange={onChange} id={id}/>;
}