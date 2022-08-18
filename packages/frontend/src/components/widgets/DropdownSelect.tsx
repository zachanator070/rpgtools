import React, {CSSProperties, ReactElement} from 'react';
import {Select} from "antd";
import {DropDownOptionProps} from "./DropdownOption";

export default function DropdownSelect({style, value, onChange, children, id}: {
    style?: CSSProperties,
    value?: string,
    onChange: (string) => any,
    children: ReactElement<DropDownOptionProps> | ReactElement<DropDownOptionProps>[],
    id?: string
}) {
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