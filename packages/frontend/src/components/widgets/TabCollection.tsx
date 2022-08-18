import React, {CSSProperties} from 'react';
import {Tabs} from "antd";

export default function TabCollection({activeKey, onChange, style, children}: {
    activeKey?: string;
    onChange?: (key: string) => any;
    children?: React.ReactNode;
    style?: CSSProperties;
}) {
    return <Tabs
        activeKey={activeKey}
        onChange={onChange}
        style={style}
        type={"card"}
    >
        {children}
    </Tabs>
}