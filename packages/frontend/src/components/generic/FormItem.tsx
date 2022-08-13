import { Form } from 'antd';
import React, {ReactElement} from 'react';

export interface FormItemProps {
    name?: string,
    label?: React.ReactNode,
    children: React.ReactNode
}

export default function FormItem({name, label, children}: FormItemProps) {
    return <Form.Item
        name={name}
        label={label}
    >
        {children}
    </Form.Item>
}