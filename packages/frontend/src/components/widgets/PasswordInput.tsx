import React from 'react';
import {Input} from "antd";
import {WidgetProps} from "./WidgetProps";


export default function PasswordInput({id}: WidgetProps) {
    return <Input.Password id={id}/>;
}