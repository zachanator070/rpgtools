import React from 'react';
import {Checkbox} from "antd";
import {WidgetProps} from "./WidgetProps";

interface PrimaryCheckboxProps extends WidgetProps {
    checked?: boolean,
    onChange?: (newValue: boolean) => any,
    children?: React.ReactNode
}

export default function PrimaryCheckbox({checked, onChange, children}: PrimaryCheckboxProps) {
    return <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)}>
        {children}
    </Checkbox>
}