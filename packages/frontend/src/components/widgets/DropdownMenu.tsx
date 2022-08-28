import React, {ReactElement} from 'react';
import {Dropdown, Menu} from "antd";
import {DropdownMenuItemProps} from "./DropdownMenuItem";
import {WidgetProps} from "./WidgetProps";

interface DropdownMenuProps extends WidgetProps {
    menu: ReactElement<DropdownMenuItemProps>[];
    children: React.ReactNode;
}

export default function DropdownMenu({menu, children}: DropdownMenuProps) {
    return <Dropdown
        overlay={
            <Menu
                onClick={(event) => {
                    event.domEvent.stopPropagation();
                }}
            >
                {menu}
            </Menu>
        }
        trigger={["contextMenu"]}
    >
        {children}
    </Dropdown>
}