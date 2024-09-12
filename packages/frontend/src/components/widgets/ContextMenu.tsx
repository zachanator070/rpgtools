import React, {ReactNode} from 'react';
import {Dropdown, Menu} from "antd";
import {WidgetProps} from "./WidgetProps.js";

interface ContextMenuProps extends WidgetProps {
    menu: ReactNode[];
    children: React.ReactNode;
}

export default function ContextMenu({menu, children}: ContextMenuProps) {
    const items = menu.map((item, index) => {
        return {
            key: index,
            label: item
        };});
    return <Dropdown
        overlay={
            <Menu items={items} onClick={({domEvent}) => domEvent.stopPropagation()}/>
        }
        trigger={['contextMenu']}
    >
        {children}
    </Dropdown>;
}