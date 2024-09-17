import React from 'react';
import {Select} from "antd";
import {WidgetProps} from "./WidgetProps";
import SpinIcon from "./icons/SpinIcon";

interface DropdownSelectOption {
    value: string | number;
    label: React.ReactNode;
}

interface DropdownSelectProps extends WidgetProps {
    value?: string,
    onChange: (newValue: any) => any,
    options: DropdownSelectOption[];
    loading?: boolean,
    onSearch?: (searchTerm: string) => Promise<void>;
    icon?: React.ReactNode;
    defaultValue?: any;
    showArrow?: boolean;
    helpText?: string;
}

export default function DropdownSelect({icon, loading, style, value, onChange, id, onSearch, defaultValue, showArrow, helpText, options}: DropdownSelectProps) {
    const children = options.map(option => <Select.Option key={option.value}>{option.label}</Select.Option>);
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