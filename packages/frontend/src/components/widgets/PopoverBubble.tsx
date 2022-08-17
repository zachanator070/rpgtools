import React from 'react';
import {Popover} from "antd";


export default function PopoverBubble({children, content, visible, onVisibleChange}: {
    children: React.ReactNode,
    content: React.ReactNode,
    visible: boolean,
    onVisibleChange: (boolean) => any
}) {
    return <Popover
        trigger="click"
        overlayStyle={{ zIndex: 10 }}
        content={content}
        visible={visible}
        onVisibleChange={onVisibleChange}
    >{children}</Popover>;
}