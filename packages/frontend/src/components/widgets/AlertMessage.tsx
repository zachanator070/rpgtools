import React from 'react';
import {Alert} from "antd";
import {WidgetProps} from "./WidgetProps";

interface AlertMessageProps extends WidgetProps {
    error: string
}

export default function AlertMessage({error}: AlertMessageProps) {
    return <Alert key={error} message={error} type={"error"} showIcon closable />;
}