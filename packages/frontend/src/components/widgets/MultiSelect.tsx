import {Select} from "antd";
import React from 'react';

export default function MultiSelect({options, onChange, onSearch}: {options: {label: any, value: any}[], onChange: (selected: string[]) => any, onSearch?: (term) => any}) {
    return <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder="Please select"
        onChange={onChange}
        options={options}
        onSearch={onSearch}
    />
}