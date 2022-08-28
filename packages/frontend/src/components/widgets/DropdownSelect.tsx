import React, {ReactElement} from 'react';
import {Select} from "antd";
import {DropDownOptionProps} from "./DropdownOption";
import {WidgetProps} from "./WidgetProps";
import SpinIcon from "./icons/SpinIcon";

interface DropdownSelectProps extends WidgetProps {
    value?: string,
    onChange: (string) => any,
    children: ReactElement<DropDownOptionProps> | ReactElement<DropDownOptionProps>[],
    loading?: boolean,
    onSearch?: (string) => Promise<void>;
    icon?: React.ReactNode;
    defaultValue?: string;
    showArrow?: boolean;
    helpText?: string;
}

export default function DropdownSelect({icon, loading, style, value, onChange, children, id, onSearch, defaultValue, showArrow, helpText}: DropdownSelectProps) {
    return <Select
        id={id}
        value={value}
        style={style}
        onChange={onChange}
        showSearch={true}
        notFoundContent={loading ? <SpinIcon/> : null}
        onSearch={onSearch}
        optionFilterProp="children"
        suffixIcon={icon}
        defaultValue={defaultValue}
        showArrow={showArrow}
        placeholder={helpText}
    >
        {children}
    </Select>;
}