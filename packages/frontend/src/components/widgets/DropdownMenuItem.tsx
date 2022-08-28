import { Menu } from 'antd';
import React from 'react';
import {WidgetProps} from "./WidgetProps";

export interface DropdownMenuItemProps extends WidgetProps {
    children: React.ReactNode;
    onClick?: () => any;
}

export default function DropdownMenuItem({children, onClick}: DropdownMenuItemProps) {
    return <Menu.Item onClick={onClick}>{children}</Menu.Item>;
}