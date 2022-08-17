import React, {CSSProperties} from 'react';
import {Tabs} from "antd";


export default function TabPane({title, style, children}: {title: string, style?: CSSProperties, children?: React.ReactNode}) {
    return <Tabs.TabPane
        tab={title}
        style={style}
    >
        {children}
    </Tabs.TabPane>

}