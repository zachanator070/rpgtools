import { Form } from "antd";
import React from "react";
import { WidgetProps } from "../WidgetProps";
import { Rule } from "rc-field-form/lib/interface";

export interface FormItemProps extends WidgetProps {
	label?: React.ReactNode;
	children: React.ReactNode;
	lastItem?: boolean;
	required?: boolean;
	validationRules?: ((any) => Promise<void>)[];
}

export default function FormItem({
	label,
	children,
	lastItem,
	required,
	validationRules,
}: FormItemProps) {
	const rules: Rule[] = [
		{
			required: true,
			message: `${label} is required`,
		},
	];
	if (validationRules) {
		for (const rule of validationRules) {
			rules.push({ validator: async (_, value) => rule(value) });
		}
	}
	return (
		<Form.Item
			label={label}
			wrapperCol={
				lastItem && {
					offset: 8,
					span: 8,
				}
			}
			rules={required && rules}
			getValueFromEvent={(e) => e.target.value}
		>
			{children}
		</Form.Item>
	);
}
