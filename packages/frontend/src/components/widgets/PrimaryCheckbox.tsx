import React from 'react';
import {Checkbox} from "antd";

export default function PrimaryCheckbox({checked, onChange, children}: {
    checked?: boolean,
    onChange?: (newValue: boolean) => any,
    children?: React.ReactNode
}) {
    return <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)}>
        {children}
    </Checkbox>
}