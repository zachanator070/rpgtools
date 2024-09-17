import React, {ReactNode} from 'react';
import {Dropdown, Menu} from "antd";
import {WidgetProps} from "./WidgetProps";

interface DropdownMenuProps extends WidgetProps {
    menu: ReactNode[];
    children: React.ReactNode;
}

export default function DropdownMenu({menu, children}: DropdownMenuProps) {
    const items = menu.map((item, index) => {
        return {
            key: index,
            label: item
        };});
    return <Dropdown
        overlay={
            <Menu items={items}/>
        }
        trigger={['click']}
    >
        {children}
    </Dropdown>;
}