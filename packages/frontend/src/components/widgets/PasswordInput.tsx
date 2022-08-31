import React from 'react';
import {Input} from "antd";
import {WidgetProps} from "./WidgetProps";

interface PasswordInputProps extends WidgetProps {
    name?: string;
}

export default function PasswordInput({id, name}: PasswordInputProps) {
    return <Input name={name} type={'password'} id={id}/>;
}