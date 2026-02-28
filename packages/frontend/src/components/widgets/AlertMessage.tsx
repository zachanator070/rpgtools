import React from 'react';
import {Alert} from "antd";
import {WidgetProps} from "./WidgetProps";
import "./AlertMessage.css";

interface AlertMessageProps extends WidgetProps {
    error: string
}

export default function AlertMessage({error}: AlertMessageProps) {
    return <Alert key={error} className="themed-alert-message" message={error} type={"error"} showIcon closable />;
}