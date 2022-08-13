import { Select } from 'antd';
import React from 'react';

export interface DropDownOptionProps {
    value: any,
    selectedByDefault?: boolean,
    children: React.ReactNode
}
export default function DropDownOption({value, selectedByDefault, children}: DropDownOptionProps) {
    return <Select.Option value={value} default={selectedByDefault}>
        {children}
    </Select.Option>;
}