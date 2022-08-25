import { Select } from 'antd';
import React from 'react';
import {WidgetProps} from "./WidgetProps";

export interface DropDownOptionProps extends WidgetProps{
    value: any,
    selectedByDefault?: boolean,
    children: React.ReactNode
}

export default function DropdownOption({value, selectedByDefault, children}: DropDownOptionProps) {
    return <Select.Option value={value} default={selectedByDefault}>
        {children}
    </Select.Option>;
}