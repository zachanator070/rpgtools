import React, {CSSProperties} from 'react';
import {Tabs} from "antd";
import {WidgetProps} from "./WidgetProps";

interface TabCollectionProps extends WidgetProps {
    activeKey?: string;
    onChange?: (key: string) => any;
    children?: React.ReactNode;
}

export default function TabCollection({activeKey, onChange, style, children}: TabCollectionProps) {
    return <Tabs
        activeKey={activeKey}
        onChange={onChange}
        style={style}
        type={"card"}
    >
        {children}
    </Tabs>
}