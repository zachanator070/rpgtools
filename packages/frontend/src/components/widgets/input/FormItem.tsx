import { Form } from 'antd';
import React from 'react';
import {WidgetProps} from "../WidgetProps";

export interface FormItemProps extends WidgetProps{
    label?: React.ReactNode;
    children: React.ReactNode;
    lastItem?: boolean;
    required?: boolean;
    validationRules?: ((any) => Promise<void>)[]
}

export default function FormItem({label, children, lastItem, required, validationRules}: FormItemProps) {
    const rules: any[] = [
        {
            required: true,
            message: `${label} is required`,
        },
    ];
    if (validationRules) {
        for(let rule of validationRules) {
            rules.push({validator: async (rule, value) => rule(value)})
        }
    }
    return <Form.Item
        label={label}
        wrapperCol={lastItem && {
            offset: 8,
            span: 8,
        }}
        rules={required && rules}
        getValueFromEvent={(e) => e.target.value}
    >
        {children}
    </Form.Item>
}