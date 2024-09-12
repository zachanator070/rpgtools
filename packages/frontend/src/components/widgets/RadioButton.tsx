import { Radio } from 'antd';
import React from 'react';
import {WidgetProps} from "./WidgetProps.js";

export interface RadioButtonProps extends WidgetProps {
    value: string;
    children: React.ReactNode;
}

export default function RadioButton({value, id, children}: RadioButtonProps) {
    return <Radio.Button value={value} id={id}>{children}</Radio.Button>;
}