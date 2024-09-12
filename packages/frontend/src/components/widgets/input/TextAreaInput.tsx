
import React from 'react';
import {WidgetProps} from "../WidgetProps.js";
import TextArea from "antd/es/input/TextArea";

interface TextAreaInputProps extends WidgetProps {
    rows: number;
    cols: number;
    readOnly?: boolean;
    value?: string;
    name?: string;
    defaultValue?: string;
}
export default function TextAreaInput({rows, cols, readOnly, value, name, defaultValue}: TextAreaInputProps){
    return <TextArea
        rows={rows}
        cols={cols}
        readOnly={readOnly}
        value={value}
        name={name}
        defaultValue={defaultValue}
    />;
}