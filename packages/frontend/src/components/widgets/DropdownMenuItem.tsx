import { Menu } from 'antd';
import React from 'react';

export interface DropdownMenuItemProps {
    children: React.ReactNode;
    onClick: () => any;
}
export default function DropdownMenuItem({children, onClick}: DropdownMenuItemProps) {
    return <Menu.Item onClick={onClick}>{children}</Menu.Item>;
}