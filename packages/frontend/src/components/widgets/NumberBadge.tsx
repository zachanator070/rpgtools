import React from 'react';
import {Badge} from "antd";
import {WidgetProps} from "./WidgetProps";

interface NumberBadgeProps extends WidgetProps {
    count: number, children: React.ReactNode
}

export default function NumberBadge({count, children}: NumberBadgeProps) {
    return <Badge count={count}>
        {children}
    </Badge>;
}