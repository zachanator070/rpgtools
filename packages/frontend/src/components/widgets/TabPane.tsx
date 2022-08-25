import React, {CSSProperties} from 'react';
import {Tabs} from "antd";
import {WidgetProps} from "./WidgetProps";

interface TabPaneProps extends WidgetProps {
    title: string;
    style?: CSSProperties;
    children?: React.ReactNode
}

export default function TabPane({title, style, children}: TabPaneProps) {
    return <Tabs.TabPane
        tab={title}
        style={style}
    >
        {children}
    </Tabs.TabPane>

}