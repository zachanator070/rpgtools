import React, {CSSProperties, ReactElement} from 'react';
import {Select} from "antd";
import {DropDownOptionProps} from "./DropdownOption";
import {WidgetProps} from "./WidgetProps";

interface DropdownSelectProps extends WidgetProps {
    value?: string,
    onChange: (string) => any,
    children: ReactElement<DropDownOptionProps> | ReactElement<DropDownOptionProps>[],
}

export default function DropdownSelect({style, value, onChange, children, id}: DropdownSelectProps) {
    return <Select
        value={value}
        style={style}
        onChange={onChange}
        showSearch={true}
        optionFilterProp="children"
    >
        {children}
    </Select>;
}