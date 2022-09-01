import React, {CSSProperties} from 'react';
import {Tabs} from "antd";
import {WidgetProps} from "./WidgetProps";

interface TabPaneProps  {
    title: string;
    style?: CSSProperties;
    children?: React.ReactNode;
}

interface TabCollectionProps extends WidgetProps {
    activeKey?: string;
    onChange?: (key: string) => any;
    tabs: TabPaneProps[];
    tabPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export default function TabCollection({activeKey, onChange, style, tabs, tabPosition}: TabCollectionProps) {
    if (!tabPosition) {
        tabPosition = 'top';
    }
    return <Tabs
        activeKey={activeKey}
        onChange={onChange}
        style={style}
        type={"card"}
        tabPosition={tabPosition}
    >
        {tabs.map(tab => (
            <Tabs.TabPane tab={tab.title} style={tab.style} key={tab.title}>
                {tab.children}
            </Tabs.TabPane>
        ))}
    </Tabs>;
}