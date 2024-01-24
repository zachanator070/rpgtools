import React, { Ref } from "react";
import { Input, InputRef } from "antd";
import { WidgetProps } from "../WidgetProps";

interface TextInputProps extends WidgetProps {
	value?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	onKeyDown?: (key: string) => void;
	name?: string;
	innerRef?: Ref<InputRef>;
	defaultValue?: string;
}

export default function TextInput({
	id,
	value,
	onChange,
	style,
	disabled,
	onKeyDown,
	name,
	innerRef,
	defaultValue,
}: TextInputProps) {
	return (
		<Input
			id={id}
			name={name}
			value={value}
			onChange={onChange}
			style={style}
			ref={innerRef}
			disabled={disabled}
			onKeyDown={(event) => onKeyDown && onKeyDown(event.key)}
			defaultValue={defaultValue}
		/>
	);
}
