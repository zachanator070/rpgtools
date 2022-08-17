import React, {ReactElement} from 'react';
import {Dropdown, Menu} from "antd";
import {DropdownMenuItemProps} from "./DropdownMenuItem";


export default function DropdownMenu({menu, children}: {menu: ReactElement<DropdownMenuItemProps>[], children: React.ReactNode}) {
    return <Dropdown overlay={<Menu>{menu}</Menu>} trigger={["contextMenu"]}>
        {children}
    </Dropdown>
}