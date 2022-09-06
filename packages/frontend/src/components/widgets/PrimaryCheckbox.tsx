import React from 'react';
import {Checkbox} from "antd";
import {WidgetProps} from "./WidgetProps";

interface PrimaryCheckboxProps extends WidgetProps {
    checked?: boolean,
    onChange?: (newValue: boolean) => any,
    children?: React.ReactNode;
    name?: string;
}

export default function PrimaryCheckbox({checked, onChange, children, name}: PrimaryCheckboxProps) {
    return <Checkbox name={name} checked={checked} onChange={(e) => onChange(e.target.checked)}>
        {children}
    </Checkbox>
}