import { Form } from 'antd';
import React from 'react';
import {WidgetProps} from "./WidgetProps";

export interface FormItemProps extends WidgetProps{
    name?: string;
    label?: React.ReactNode;
    children: React.ReactNode;
    lastItem?: boolean;
    required?: boolean;
}

export default function FormItem({name, label, children, lastItem, required}: FormItemProps) {
    return <Form.Item
        name={name}
        label={label}
        wrapperCol={lastItem && {
            offset: 8,
            span: 16,
        }}
        rules={required && [
            {
                required: true,
                message: `${label} is required`,
            },
        ]}
    >
        {children}
    </Form.Item>
}