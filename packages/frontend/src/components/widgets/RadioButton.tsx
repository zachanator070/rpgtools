import { Radio } from 'antd';
import React from 'react';

export interface RadioButtonProps {
    value: string;
    children: React.ReactNode;
    id?: string;
}

export default function RadioButton({value, id, children}: RadioButtonProps) {
    return <Radio.Button value={value} id={id}>{children}</Radio.Button>;
}