import React from 'react';
import {Popover} from "antd";
import {WidgetProps} from "./WidgetProps";

interface PopoverBubbleProps extends WidgetProps {
    children: React.ReactNode,
    content: React.ReactNode,
    visible: boolean,
    onVisibleChange: (boolean) => any
}
export default function PopoverBubble({children, content, visible, onVisibleChange}: PopoverBubbleProps) {
    return <Popover
        trigger="click"
        overlayStyle={{ zIndex: 10 }}
        content={content}
        visible={visible}
        onVisibleChange={onVisibleChange}
    >{children}</Popover>;
}