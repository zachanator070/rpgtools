import React, {CSSProperties, ReactElement} from 'react';
import {Select} from "antd";
import {DropDownOptionProps} from "./DropdownOption";

export default function DropdownSelect({style, value, onChange, children}: {style?: CSSProperties, value: string, onChange: (string) => any, children: ReactElement<DropDownOptionProps>[]}) {
    return <Select
        value={value}
        style={style}
        onChange={onChange}
    >
        {children}
    </Select>;
}